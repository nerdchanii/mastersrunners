import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, renderHook, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { PropsWithChildren } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { commentKeys, useDeleteComment } from "@/hooks/useComments";

import { CommentList } from "../CommentList";

const apiMock = vi.hoisted(() => ({
  fetch: vi.fn(),
  fetchSession: vi.fn(),
  logout: vi.fn(),
}));

vi.mock("@/lib/api-client", () => ({
  api: apiMock,
}));

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    logout: vi.fn(),
    refreshUser: vi.fn(),
    user: {
      id: "user-1",
      email: "runner@example.com",
      name: "김러너",
      profileImage: null,
      backgroundImage: null,
      bio: null,
      isPrivate: false,
      workoutSharingDefault: "PUBLIC",
      region: "서울",
      subRegion: "성동구",
      pb5kSeconds: null,
      pb10kSeconds: null,
      pbHalfMarathonSeconds: null,
      pbMarathonSeconds: null,
      createdAt: "2026-05-07T00:00:00.000Z",
    },
  }),
}));

type TestComment = {
  id: string;
  content: string;
  createdAt: string;
  parentId?: string | null;
  user: {
    id: string;
    name: string;
    profileImage: string | null;
  };
  replies?: TestComment[];
};

const sourceDirectory = path.dirname(fileURLToPath(import.meta.url));
const currentUserComment = createComment({
  id: "comment-1",
  content: "오늘도 완주했습니다",
  user: { id: "user-1", name: "김러너", profileImage: null },
});
const otherUserComment = createComment({
  id: "comment-2",
  content: "좋은 페이스였어요",
  user: { id: "user-2", name: "이페이서", profileImage: null },
});

function createComment(overrides: Partial<TestComment>): TestComment {
  return {
    id: "comment-id",
    content: "댓글 내용",
    createdAt: "2026-05-07T01:00:00.000Z",
    parentId: null,
    user: { id: "user-1", name: "김러너", profileImage: null },
    replies: [],
    ...overrides,
  };
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });
}

function renderCommentList() {
  const queryClient = createQueryClient();

  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );

  const view = render(<CommentList entityType="post" entityId="post-1" />, { wrapper });

  return { queryClient, ...view };
}

async function readCommentListSource() {
  return readFile(path.join(sourceDirectory, "../CommentList.tsx"), "utf8");
}

describe("CommentList query and mutation migration", () => {
  beforeEach(() => {
    apiMock.fetch.mockReset();
    apiMock.fetchSession.mockReset();
    apiMock.logout.mockReset();
  });

  it("keeps CommentList out of direct api-client ownership", async () => {
    const source = await readCommentListSource();

    expect(source).not.toContain("@/lib/api-client");
    expect(source).not.toMatch(/\bapi\.(fetch|fetchSession)\b/);
  });

  it("scopes comment mutations at hook construction instead of mutate call time", async () => {
    const source = await readCommentListSource();

    expect(source).toContain(
      "useCreateComment({ entityType, entityId, params: COMMENT_LIST_PARAMS })",
    );
    expect(source).toContain(
      "useDeleteComment({ entityType, entityId, params: COMMENT_LIST_PARAMS })",
    );

    const createMutationBody = source.match(/createComment\.mutateAsync\(\{(?<body>[\s\S]*?)\}\);/)
      ?.groups?.body;
    const deleteMutationBody = source.match(/deleteComment\.mutateAsync\(\{(?<body>[\s\S]*?)\}\);/)
      ?.groups?.body;

    expect(createMutationBody).toBeDefined();
    expect(deleteMutationBody).toBeDefined();
    expect(createMutationBody).not.toMatch(/\bentity(Type|Id)\b/);
    expect(deleteMutationBody).not.toMatch(/\bentity(Type|Id)\b/);
  });

  it("invalidates the exact current comment list after a scoped delete mutation succeeds", async () => {
    apiMock.fetch.mockResolvedValueOnce({ ok: true });
    const queryClient = createQueryClient();
    const invalidateQueriesSpy = vi
      .spyOn(queryClient, "invalidateQueries")
      .mockResolvedValue(undefined);
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(
      () =>
        useDeleteComment({
          entityType: "post",
          entityId: "post-1",
          params: { limit: 50 },
        }),
      { wrapper },
    );

    await act(async () => {
      await result.current.mutateAsync({ commentId: "comment-1" });
    });

    expect(apiMock.fetch).toHaveBeenCalledWith("/posts/post-1/comments/comment-1", {
      method: "DELETE",
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledTimes(1);
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      exact: true,
      queryKey: commentKeys.list("post", "post-1", { limit: 50 }),
    });
  });

  it("shows an inline load error and retries through the comment query boundary", async () => {
    const user = userEvent.setup();
    apiMock.fetchSession
      .mockRejectedValueOnce(new Error("load failed"))
      .mockResolvedValueOnce({ cursor: null, data: [otherUserComment], hasMore: false });

    renderCommentList();

    expect(
      await screen.findByText("댓글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /다시 시도|재시도/ }));

    expect(await screen.findByText("좋은 페이스였어요")).toBeInTheDocument();
    expect(apiMock.fetchSession).toHaveBeenCalledTimes(2);
  });

  it("preserves reply input state and shows a visible message when comment creation fails", async () => {
    const user = userEvent.setup();
    apiMock.fetchSession.mockResolvedValue({
      cursor: null,
      data: [otherUserComment],
      hasMore: false,
    });
    apiMock.fetch.mockRejectedValueOnce(new Error("create failed"));

    renderCommentList();

    await screen.findByText("좋은 페이스였어요");
    await user.click(screen.getByRole("button", { name: "답글 달기" }));

    const input = screen.getByPlaceholderText("댓글 달기...");
    await user.type(input, "감사합니다");
    await user.keyboard("{Enter}");

    expect(screen.getByText("이페이서님에게 답글 작성 중")).toBeInTheDocument();
    expect(input).toHaveValue("@이페이서 감사합니다");
    expect(
      await screen.findByText(/댓글을 등록하지 못했습니다|댓글 작성에 실패했습니다/),
    ).toBeInTheDocument();
  });

  it("refreshes the visible comment list after delete succeeds", async () => {
    const user = userEvent.setup();
    apiMock.fetchSession
      .mockResolvedValueOnce({ cursor: null, data: [currentUserComment], hasMore: false })
      .mockResolvedValueOnce({ cursor: null, data: [], hasMore: false });
    apiMock.fetch.mockResolvedValueOnce({ ok: true });

    renderCommentList();

    await screen.findByText("오늘도 완주했습니다");
    await user.click(screen.getByRole("button", { name: "댓글 삭제" }));

    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "삭제" }));

    await waitFor(() => expect(screen.getByText("첫 댓글을 작성해보세요")).toBeInTheDocument());
    expect(apiMock.fetch).toHaveBeenCalledWith("/posts/post-1/comments/comment-1", {
      method: "DELETE",
    });
    expect(apiMock.fetchSession).toHaveBeenCalledTimes(2);
  });
});
