import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ComponentProps } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Board, BoardPost, BoardPostWithBoard } from "@/hooks/useCrewBoards";

import CrewBoardList from "../CrewBoardList";

const crewBoardHooks = vi.hoisted(() => ({
  useBoards: vi.fn(),
  useBoardPostFeeds: vi.fn(),
  useBoardPosts: vi.fn(),
  useBoardPost: vi.fn(),
  useCreatePost: vi.fn(),
  useCreateComment: vi.fn(),
  useToggleLike: vi.fn(),
}));

vi.mock("@/hooks/useCrewBoards", () => crewBoardHooks);

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    user: { id: "user-1", name: "김러너", profileImage: null },
  }),
}));

const author = { id: "user-1", name: "김러너", profileImage: null };

const announcementBoard: Board = {
  id: "board-announcement",
  crewId: "crew-1",
  name: "공지 게시판",
  type: "ANNOUNCEMENT",
  writePermission: "ADMINS",
  sortOrder: 0,
  _count: { posts: 1 },
};

const generalBoard: Board = {
  id: "board-general",
  crewId: "crew-1",
  name: "일반 게시판",
  type: "GENERAL",
  writePermission: "ALL_MEMBERS",
  sortOrder: 1,
  _count: { posts: 1 },
};

const freeBoard: Board = {
  id: "board-free",
  crewId: "crew-1",
  name: "자유 게시판",
  type: "FREE",
  writePermission: "ALL_MEMBERS",
  sortOrder: 2,
  _count: { posts: 1 },
};

const boards = [announcementBoard, generalBoard, freeBoard];

function createPost(overrides: Partial<BoardPost>): BoardPost {
  return {
    id: "post-1",
    boardId: "board-free",
    title: "게시글",
    content: "게시글 본문",
    isPinned: false,
    authorId: author.id,
    author,
    createdAt: "2026-05-07T01:00:00.000Z",
    updatedAt: "2026-05-07T01:00:00.000Z",
    images: [],
    comments: [],
    _count: { comments: 0, likes: 0 },
    liked: false,
    ...overrides,
  };
}

const boardPostsByBoard: Record<string, BoardPost[]> = {
  [announcementBoard.id]: [
    createPost({
      id: "announcement-post",
      boardId: announcementBoard.id,
      title: "공지 라우팅",
      content: "공지 본문",
      isPinned: true,
    }),
  ],
  [generalBoard.id]: [
    createPost({
      id: "general-post",
      boardId: generalBoard.id,
      title: "일반 게시글",
      content: "일반 본문",
    }),
  ],
  [freeBoard.id]: [
    createPost({
      id: "free-post",
      boardId: freeBoard.id,
      title: "자유 게시글",
      content: "자유 본문",
    }),
  ],
};

const routedPost = createPost({
  id: "routed-post",
  boardId: freeBoard.id,
  title: "라우트 게시글 상세",
  content: "라우트 상세 본문",
  _count: { comments: 1, likes: 2 },
});

const feedPosts: BoardPostWithBoard[] = [
  { ...boardPostsByBoard[freeBoard.id][0], board: freeBoard },
  { ...boardPostsByBoard[generalBoard.id][0], board: generalBoard },
];

type CrewBoardListProps = ComponentProps<typeof CrewBoardList>;

const baseProps: CrewBoardListProps = {
  crewId: "crew-1",
  canOpenBoardPosts: true,
  isAuthenticated: true,
  isMember: true,
  isAdmin: false,
  onRequireAuth: vi.fn(),
};

function renderCrewBoardList(overrides: Partial<CrewBoardListProps> = {}) {
  const props = { ...baseProps, ...overrides };
  const view = render(
    <MemoryRouter>
      <CrewBoardList {...props} />
    </MemoryRouter>,
  );

  return {
    ...view,
    rerenderCrewBoardList: (nextOverrides: Partial<CrewBoardListProps> = {}) =>
      view.rerender(
        <MemoryRouter>
          <CrewBoardList {...props} {...nextOverrides} />
        </MemoryRouter>,
      ),
  };
}

describe("CrewBoardList decomposition behavior", () => {
  beforeEach(() => {
    crewBoardHooks.useBoards.mockReturnValue({ data: boards, isLoading: false });
    crewBoardHooks.useBoardPostFeeds.mockReturnValue({ items: feedPosts, isLoading: false });
    crewBoardHooks.useBoardPosts.mockImplementation((_crewId: string, boardId: string) => ({
      data: { items: boardPostsByBoard[boardId] ?? [], nextCursor: null },
      isLoading: false,
    }));
    crewBoardHooks.useBoardPost.mockImplementation(
      (_crewId: string, _boardId: string, postId: string) => ({
        data:
          postId === routedPost.id
            ? routedPost
            : (Object.values(boardPostsByBoard)
                .flat()
                .find((post) => post.id === postId) ?? null),
        isLoading: false,
      }),
    );
    crewBoardHooks.useCreatePost.mockReturnValue({ mutate: vi.fn(), isPending: false });
    crewBoardHooks.useCreateComment.mockReturnValue({ mutate: vi.fn(), isPending: false });
    crewBoardHooks.useToggleLike.mockReturnValue({ mutate: vi.fn(), isPending: false });
  });

  it("opens a routed board post with the routed board id", () => {
    renderCrewBoardList({
      routedBoardId: freeBoard.id,
      routedPostId: routedPost.id,
    });

    expect(screen.getByRole("heading", { name: "라우트 게시글 상세" })).toBeInTheDocument();
    expect(screen.getByText("라우트 상세 본문")).toBeInTheDocument();
    expect(crewBoardHooks.useBoardPost).toHaveBeenCalledWith("crew-1", freeBoard.id, routedPost.id);
  });

  it("keeps auth-gated routed posts out of the detail query", () => {
    const onRequireAuth = vi.fn();

    renderCrewBoardList({
      canOpenBoardPosts: false,
      isAuthenticated: false,
      routedBoardId: freeBoard.id,
      routedPostId: routedPost.id,
      onRequireAuth,
    });

    expect(screen.getByText("크루 멤버만 읽을 수 있습니다")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "로그인하고 보기" })).toBeInTheDocument();
    expect(crewBoardHooks.useBoardPost).not.toHaveBeenCalled();
  });

  it("does not handle a composer nonce while a routed post detail is active", () => {
    const handled = vi.fn();

    renderCrewBoardList({
      routedBoardId: freeBoard.id,
      routedPostId: routedPost.id,
      composerDefaultBoardType: "FREE",
      composerNonce: 1,
      onComposerHandled: handled,
    });

    expect(screen.getByRole("heading", { name: "라우트 게시글 상세" })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("제목")).not.toBeInTheDocument();
    expect(handled).not.toHaveBeenCalled();
  });

  it("preserves the selected board when routed defaults change after selection", async () => {
    const { rerenderCrewBoardList } = renderCrewBoardList({
      defaultSelectedBoardId: freeBoard.id,
    });

    expect(await screen.findByRole("heading", { name: "자유 게시판" })).toBeInTheDocument();

    rerenderCrewBoardList({ defaultSelectedBoardId: generalBoard.id });

    expect(screen.getByRole("heading", { name: "자유 게시판" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "일반 게시판" })).not.toBeInTheDocument();
    expect(crewBoardHooks.useBoardPosts).toHaveBeenLastCalledWith("crew-1", freeBoard.id);
  });

  it("opens the composer once for a stable composer nonce", async () => {
    const firstHandled = vi.fn();
    const secondHandled = vi.fn();
    const nextHandled = vi.fn();
    const { rerenderCrewBoardList } = renderCrewBoardList({
      composerDefaultBoardType: "FREE",
      composerNonce: 1,
      onComposerHandled: firstHandled,
    });

    expect(await screen.findByPlaceholderText("제목")).toBeInTheDocument();
    expect(firstHandled).toHaveBeenCalledTimes(1);

    rerenderCrewBoardList({
      composerDefaultBoardType: "FREE",
      composerNonce: 1,
      onComposerHandled: secondHandled,
    });

    await waitFor(() => expect(secondHandled).not.toHaveBeenCalled());

    rerenderCrewBoardList({
      composerDefaultBoardType: "FREE",
      composerNonce: 2,
      onComposerHandled: nextHandled,
    });

    await waitFor(() => expect(nextHandled).toHaveBeenCalledTimes(1));
  });

  it("handles a default selected board composer nonce once", async () => {
    const handled = vi.fn();
    const secondHandled = vi.fn();
    const { rerenderCrewBoardList } = renderCrewBoardList({
      defaultSelectedBoardId: freeBoard.id,
      composerNonce: 1,
      onComposerHandled: handled,
    });

    expect(await screen.findByRole("heading", { name: "자유 게시판" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("제목")).toBeInTheDocument();
    expect(handled).toHaveBeenCalledTimes(1);

    rerenderCrewBoardList({
      defaultSelectedBoardId: freeBoard.id,
      composerNonce: 1,
      onComposerHandled: secondHandled,
    });

    await waitFor(() => expect(secondHandled).not.toHaveBeenCalled());
    expect(handled).toHaveBeenCalledTimes(1);
  });

  it("does not handle a composer nonce while a selected post detail is active", async () => {
    const handled = vi.fn();
    const { rerenderCrewBoardList } = renderCrewBoardList({
      defaultSelectedBoardId: freeBoard.id,
    });

    fireEvent.click(await screen.findByText("자유 게시글"));
    expect(await screen.findByRole("heading", { name: "자유 게시글" })).toBeInTheDocument();

    rerenderCrewBoardList({
      defaultSelectedBoardId: freeBoard.id,
      composerNonce: 1,
      onComposerHandled: handled,
    });

    expect(screen.getByRole("heading", { name: "자유 게시글" })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("제목")).not.toBeInTheDocument();
    expect(handled).not.toHaveBeenCalled();
  });

  it("closes an open feed composer when the board list becomes inactive", async () => {
    const handled = vi.fn();
    const { rerenderCrewBoardList } = renderCrewBoardList({
      composerDefaultBoardType: "FREE",
      composerNonce: 1,
      onComposerHandled: handled,
    });

    expect(await screen.findByPlaceholderText("제목")).toBeInTheDocument();
    expect(handled).toHaveBeenCalledTimes(1);

    rerenderCrewBoardList({
      composerDefaultBoardType: "FREE",
      composerNonce: 1,
      isActive: false,
      onComposerHandled: handled,
    });

    await waitFor(() => expect(screen.queryByPlaceholderText("제목")).not.toBeInTheDocument());
    expect(handled).toHaveBeenCalledTimes(1);
  });

  it("closes an open board composer when the board list becomes inactive", async () => {
    const handled = vi.fn();
    const { rerenderCrewBoardList } = renderCrewBoardList({
      defaultSelectedBoardId: freeBoard.id,
      composerNonce: 1,
      onComposerHandled: handled,
    });

    expect(await screen.findByRole("heading", { name: "자유 게시판" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("제목")).toBeInTheDocument();
    expect(handled).toHaveBeenCalledTimes(1);

    rerenderCrewBoardList({
      defaultSelectedBoardId: freeBoard.id,
      composerNonce: 1,
      isActive: false,
      onComposerHandled: handled,
    });

    await waitFor(() => expect(screen.queryByPlaceholderText("제목")).not.toBeInTheDocument());
    expect(screen.getByRole("heading", { name: "자유 게시판" })).toBeInTheDocument();
    expect(handled).toHaveBeenCalledTimes(1);
  });
});
