import { act, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import NewPostPage from "../index";
import { usePostComposer } from "../use-post-composer";

const { apiFetchMock, createPostMock, workoutsMock } = vi.hoisted(() => ({
  apiFetchMock: vi.fn(),
  createPostMock: vi.fn(),
  workoutsMock: [
    {
      id: "workout-1",
      distance: 5000,
      duration: 1500,
      pace: 300,
      date: "2026-05-07T00:00:00.000Z",
      workoutType: { id: "run", name: "러닝" },
    },
    {
      id: "workout-2",
      distance: 10000,
      duration: 3300,
      pace: 330,
      date: "2026-05-06T00:00:00.000Z",
      workoutType: { id: "tempo", name: "템포런" },
    },
  ],
}));

vi.mock("@/hooks/useWorkouts", () => ({
  useWorkouts: () => ({ data: workoutsMock, isLoading: false }),
}));

vi.mock("@/hooks/usePosts", () => ({
  useCreatePost: () => ({
    mutateAsync: createPostMock,
    isPending: false,
  }),
}));

vi.mock("@/lib/api-client", () => ({
  api: {
    fetch: apiFetchMock,
  },
}));

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    user: { id: "user-1", name: "러너 김", profileImage: null },
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("@/components/ui/select", async () => {
  const React = await vi.importActual<typeof import("react")>("react");

  return {
    Select: ({ children, onValueChange, value }: any) =>
      React.createElement(
        "div",
        { "data-testid": "visibility-select", "data-value": value },
        React.Children.map(children, (child) =>
          React.isValidElement(child) ? React.cloneElement(child, { onValueChange } as any) : child,
        ),
      ),
    SelectContent: ({ children, onValueChange }: any) =>
      React.createElement(
        "div",
        null,
        React.Children.map(children, (child) =>
          React.isValidElement(child) ? React.cloneElement(child, { onValueChange } as any) : child,
        ),
      ),
    SelectItem: ({ children, onValueChange, value }: any) =>
      React.createElement(
        "button",
        { onClick: () => onValueChange(value), type: "button" },
        children,
      ),
    SelectTrigger: ({ children }: any) => React.createElement("div", null, children),
    SelectValue: () => null,
  };
});

function renderComposer(path = "/posts/new") {
  window.history.replaceState(null, "", path);

  return render(
    <BrowserRouter>
      <NewPostPage />
    </BrowserRouter>,
  );
}

function renderComposerHook(path = "/posts/new") {
  window.history.replaceState(null, "", path);

  return renderHook(() => usePostComposer(), {
    wrapper: ({ children }) => <BrowserRouter>{children}</BrowserRouter>,
  });
}

function currentComposerStepQuery() {
  return new URLSearchParams(window.location.search).get("post-composer.step");
}

function getImageInput(container: HTMLElement) {
  const input = container.querySelector<HTMLInputElement>("#image-input");
  expect(input).not.toBeNull();
  return input!;
}

async function uploadImage(container: HTMLElement, name = "finish-line.jpg") {
  const file = new File(["image-bytes"], name, { type: "image/jpeg" });

  fireEvent.change(getImageInput(container), {
    target: { files: [file] },
  });

  await waitFor(() => {
    expect(apiFetchMock).toHaveBeenCalledWith(
      "/uploads/presign",
      expect.objectContaining({ method: "POST" }),
    );
  });

  await screen.findByAltText("선택한 사진 1");
  return file;
}

async function expectStep(title: string, queryStep: string) {
  expect(await screen.findByRole("heading", { name: title })).toBeInTheDocument();
  expect(currentComposerStepQuery()).toBe(queryStep);
}

function clickPrimaryNext() {
  fireEvent.click(screen.getByRole("button", { name: /^다음/ }));
}

function clickHeaderBack() {
  fireEvent.click(screen.getAllByRole("button")[0]);
}

describe("post composer funnel migration contract", () => {
  beforeEach(() => {
    apiFetchMock.mockResolvedValue({
      key: "posts/finish-line.jpg",
      publicUrl: "https://cdn.example.test/finish-line.jpg",
      uploadUrl: "https://upload.example.test/finish-line.jpg",
    });
    createPostMock.mockResolvedValue({ id: "post-1" });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 200 })));
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn((file: File) => `blob:${file.name}`),
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("keeps next/back UI state and history query aligned with the shared funnel contract", async () => {
    const { container } = renderComposer();

    await expectStep("워크아웃 선택", "workout");

    fireEvent.click(screen.getByRole("button", { name: /러닝/ }));
    clickPrimaryNext();
    await expectStep("사진 선택", "photos");

    await uploadImage(container);
    clickPrimaryNext();
    await expectStep("내용 작성", "text");

    fireEvent.change(screen.getByLabelText("텍스트 작성"), {
      target: { value: "오늘 러닝 좋았습니다 #훈련" },
    });
    fireEvent.click(screen.getByRole("button", { name: "비공개" }));
    fireEvent.click(screen.getByRole("button", { name: "미리보기" }));
    await expectStep("미리보기", "preview");

    fireEvent.click(screen.getByRole("button", { name: "수정하기" }));
    await expectStep("내용 작성", "text");

    clickHeaderBack();
    await expectStep("사진 선택", "photos");

    clickHeaderBack();
    await expectStep("워크아웃 선택", "workout");
  });

  it("uses browser Back from step 2+ as previous composer step navigation with context preserved", async () => {
    const { container } = renderComposer();

    fireEvent.click(screen.getByRole("button", { name: /러닝/ }));
    clickPrimaryNext();
    await uploadImage(container);
    clickPrimaryNext();
    fireEvent.change(screen.getByLabelText("텍스트 작성"), {
      target: { value: "브라우저 뒤로가기 초안" },
    });

    expect(currentComposerStepQuery()).toBe("text");

    act(() => {
      window.history.back();
    });

    await expectStep("사진 선택", "photos");
    expect(screen.getByAltText("선택한 사진 1")).toBeInTheDocument();

    act(() => {
      window.history.back();
    });

    await expectStep("워크아웃 선택", "workout");
    expect(screen.getByRole("button", { name: /러닝/ })).toHaveClass("border-primary");
  });

  it("preserves selected workouts, images, text, and visibility across funnel navigation", async () => {
    const { container } = renderComposer();

    fireEvent.click(screen.getByRole("button", { name: /러닝/ }));
    clickPrimaryNext();
    await uploadImage(container);
    clickPrimaryNext();
    fireEvent.change(screen.getByLabelText("텍스트 작성"), {
      target: { value: "컨텍스트 유지 확인 #장거리" },
    });
    fireEvent.click(screen.getByRole("button", { name: "비공개" }));
    fireEvent.click(screen.getByRole("button", { name: "미리보기" }));

    await expectStep("미리보기", "preview");
    expect(screen.getByAltText("첨부 이미지")).toBeInTheDocument();
    expect(screen.getByText(/컨텍스트 유지 확인/)).toBeInTheDocument();
    expect(screen.getByText("러닝")).toBeInTheDocument();
    expect(screen.getByText("비공개")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "수정하기" }));

    expect(screen.getByLabelText("텍스트 작성")).toHaveValue("컨텍스트 유지 확인 #장거리");
    expect(screen.getByTestId("visibility-select")).toHaveAttribute("data-value", "PRIVATE");
    expect(screen.getByAltText("선택한 사진 1")).toBeInTheDocument();
  });

  it("normalizes a reload or direct query to a later step without recoverable context", async () => {
    renderComposer("/posts/new?post-composer.step=preview");

    await expectStep("워크아웃 선택", "workout");
    expect(window.history.state).toMatchObject({
      __mastersFunnel: {
        "post-composer": {
          step: "workout",
          context: { selectedWorkoutIds: [] },
        },
      },
    });
  });

  it("keeps usePostComposer upload cleanup and submit payload invariants unchanged", async () => {
    const { result, unmount } = renderComposerHook();
    const firstFile = new File(["first"], "first.jpg", { type: "image/jpeg" });
    const secondFile = new File(["second"], "second.jpg", { type: "image/jpeg" });

    await act(async () => {
      await result.current.handleAddImages({
        target: { files: [firstFile], value: "first.jpg" },
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    });

    await waitFor(() => {
      expect(result.current.images[0]).toMatchObject({
        preview: "blob:first.jpg",
        publicUrl: "https://cdn.example.test/finish-line.jpg",
        uploading: false,
      });
    });

    act(() => {
      result.current.removeImage("blob:first.jpg");
    });

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:first.jpg");

    await act(async () => {
      await result.current.handleAddImages({
        target: { files: [secondFile], value: "second.jpg" },
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    });
    act(() => {
      result.current.toggleWorkout("workout-1");
      result.current.setContent("  업로드 완료 #러닝 @coach  ");
      result.current.setVisibility("FOLLOWERS");
    });

    await waitFor(() => {
      expect(result.current.visibility).toBe("FOLLOWERS");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(createPostMock).toHaveBeenCalledWith({
      content: "업로드 완료 #러닝 @coach",
      hashtags: ["러닝"],
      imageUrls: ["https://cdn.example.test/finish-line.jpg"],
      visibility: "FOLLOWERS",
      workoutIds: ["workout-1"],
    });

    unmount();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:second.jpg");
  });
});
