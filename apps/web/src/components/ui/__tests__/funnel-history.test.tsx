import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  type HistoryFunnel,
  useFunnel,
  type UseHistoryFunnelOptions,
} from "@/components/ui/funnel";

type ImageUpload = {
  file: File;
  preview: string;
  publicUrl?: string;
  uploading: boolean;
  error?: string;
};

type ComposerFunnel = {
  workout: { selectedWorkoutIds: string[] };
  photos: { selectedWorkoutIds: string[]; images: ImageUpload[] };
  text: { selectedWorkoutIds: string[]; images: ImageUpload[]; content: string };
  preview: {
    selectedWorkoutIds: string[];
    images: ImageUpload[];
    content: string;
    visibility: "PRIVATE" | "FOLLOWERS" | "PUBLIC";
  };
};

const COMPOSER_STEPS = ["workout", "photos", "text", "preview"] as const;
const FUNNEL_URL = "/funnel-test";

type ComposerHistoryFunnel = HistoryFunnel<ComposerFunnel>;

function createImage(name = "private-route.gpx"): ImageUpload {
  return {
    file: new File(["workout-binary"], name, { type: "application/octet-stream" }),
    preview: `blob:${name}`,
    uploading: false,
  };
}

function createComposerFunnelOptions(
  initialContext: ComposerFunnel["workout"] = { selectedWorkoutIds: [] },
): UseHistoryFunnelOptions<ComposerFunnel> {
  return {
    id: "composer",
    initialStep: "workout",
    initialContext,
    steps: COMPOSER_STEPS,
    sync: "history",
  };
}

function renderComposerFunnel() {
  return renderHook(() => useFunnel<ComposerFunnel>(createComposerFunnelOptions()));
}

function currentStepQuery() {
  return new URLSearchParams(window.location.search).get("composer.step");
}

function expectPublicFunnelTypes(funnel: ComposerHistoryFunnel) {
  funnel.history.push("photos", {
    selectedWorkoutIds: [],
    images: [],
  });
  funnel.history.replace("preview", {
    selectedWorkoutIds: [],
    images: [],
    content: "",
    visibility: "PUBLIC",
  });

  // @ts-expect-error photos context requires images.
  funnel.history.push("photos", { selectedWorkoutIds: [] });
  // @ts-expect-error text context requires content.
  funnel.history.replace("text", { selectedWorkoutIds: [], images: [] });
}
void expectPublicFunnelTypes;

describe("useFunnel history integration", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", FUNNEL_URL);
  });

  it("preserves typed string step contexts when moving through steps", () => {
    const { result } = renderComposerFunnel();
    const image = createImage();

    act(() => {
      result.current.history.push("photos", {
        selectedWorkoutIds: ["workout-1"],
        images: [image],
      });
    });

    expect(result.current.step).toBe("photos");
    expect(result.current.context).toMatchObject({
      selectedWorkoutIds: ["workout-1"],
      images: [image],
    });

    act(() => {
      result.current.history.push("text", {
        selectedWorkoutIds: ["workout-1"],
        images: [image],
        content: "오늘 인터벌 기록",
      });
    });

    expect(result.current.step).toBe("text");
    expect(result.current.context).toMatchObject({
      selectedWorkoutIds: ["workout-1"],
      images: [image],
      content: "오늘 인터벌 기록",
    });
  });

  it("dispatches the current typed context and history through the render helper", () => {
    const renderEvents: Array<{
      step: string;
      selectedWorkoutIds: string[];
      hasHistoryPush: boolean;
    }> = [];

    function RenderProbe() {
      const funnel = useFunnel<ComposerFunnel>(
        createComposerFunnelOptions({ selectedWorkoutIds: ["workout-1"] }),
      );
      const Render = funnel.Render;

      return (
        <Render
          workout={({ context, history, step }) => {
            renderEvents.push({
              step,
              selectedWorkoutIds: context.selectedWorkoutIds,
              hasHistoryPush: typeof history.push === "function",
            });

            return <div data-testid="current-step">{step}</div>;
          }}
          photos={({ context }) => (
            <div data-testid="current-step">{context.images.length} photos</div>
          )}
          text={({ context }) => <div data-testid="current-step">{context.content}</div>}
          preview={({ context }) => <div data-testid="current-step">{context.visibility}</div>}
        />
      );
    }

    render(<RenderProbe />);

    expect(screen.getByTestId("current-step")).toHaveTextContent("workout");
    expect(renderEvents).toEqual([
      {
        step: "workout",
        selectedWorkoutIds: ["workout-1"],
        hasHistoryPush: true,
      },
    ]);
  });

  it("pushes a browser entry and exposes only the current step in the query", () => {
    const { result } = renderComposerFunnel();
    const initialLength = window.history.length;
    const image = createImage();
    const largeContentMarker = "draft-content-that-must-not-enter-the-url";

    act(() => {
      result.current.history.push("text", {
        selectedWorkoutIds: ["workout-1"],
        images: [image],
        content: largeContentMarker,
      });
    });

    expect(window.history.length).toBe(initialLength + 1);
    expect(currentStepQuery()).toBe("text");
    expect(window.location.href).not.toContain(largeContentMarker);
    expect(window.location.href).not.toContain("selectedWorkoutIds");
    expect(window.location.href).not.toContain("private-route.gpx");
  });

  it("replaces the current browser entry and current context", async () => {
    const { result } = renderComposerFunnel();
    const image = createImage();

    act(() => {
      result.current.history.push("photos", {
        selectedWorkoutIds: ["workout-1"],
        images: [image],
      });
    });
    const lengthAfterPush = window.history.length;

    act(() => {
      result.current.history.replace("text", {
        selectedWorkoutIds: ["workout-2"],
        images: [image],
        content: "대체된 본문",
      });
    });

    expect(window.history.length).toBe(lengthAfterPush);
    expect(currentStepQuery()).toBe("text");
    expect(result.current.step).toBe("text");
    expect(result.current.context).toMatchObject({
      selectedWorkoutIds: ["workout-2"],
      content: "대체된 본문",
    });

    act(() => {
      result.current.history.back();
    });

    await waitFor(() => {
      expect(result.current.step).toBe("workout");
    });
  });

  it("syncs history.back, browser forward, and history.go with popstate", async () => {
    const { result } = renderComposerFunnel();
    const image = createImage();

    act(() => {
      result.current.history.push("photos", {
        selectedWorkoutIds: ["workout-1"],
        images: [image],
      });
      result.current.history.push("text", {
        selectedWorkoutIds: ["workout-1"],
        images: [image],
        content: "브라우저 이동 초안",
      });
    });

    expect(result.current.step).toBe("text");

    act(() => {
      result.current.history.back();
    });

    await waitFor(() => {
      expect(result.current.step).toBe("photos");
    });
    expect(result.current.context).toMatchObject({
      selectedWorkoutIds: ["workout-1"],
      images: [image],
    });

    act(() => {
      window.history.forward();
    });

    await waitFor(() => {
      expect(result.current.step).toBe("text");
    });

    act(() => {
      result.current.history.go(-1);
    });

    await waitFor(() => {
      expect(result.current.step).toBe("photos");
    });
  });

  it("falls back to initialStep and exposes it when the query has an invalid step", () => {
    window.history.replaceState(null, "", `${FUNNEL_URL}?composer.step=not-a-real-step`);

    const { result } = renderComposerFunnel();

    expect(result.current.step).toBe("workout");
    expect(currentStepQuery()).toBe("workout");
  });

  it("normalizes a valid later query step when stored context is not recoverable", () => {
    window.history.replaceState(null, "", `${FUNNEL_URL}?composer.step=photos`);

    const { result } = renderComposerFunnel();

    expect(result.current.step).toBe("workout");
    expect(result.current.context).toEqual({ selectedWorkoutIds: [] });
    expect(currentStepQuery()).toBe("workout");
  });

  it("removes popstate listeners on unmount to avoid stale or duplicate handling", () => {
    const originalAddEventListener = window.addEventListener.bind(window);
    const originalRemoveEventListener = window.removeEventListener.bind(window);
    const popstateListeners = new Set<EventListenerOrEventListenerObject>();

    vi.spyOn(window, "addEventListener").mockImplementation((type, listener, options) => {
      if (type === "popstate") {
        popstateListeners.add(listener);
      }

      originalAddEventListener(type, listener, options);
    });
    vi.spyOn(window, "removeEventListener").mockImplementation((type, listener, options) => {
      if (type === "popstate") {
        popstateListeners.delete(listener);
      }

      originalRemoveEventListener(type, listener, options);
    });

    const first = renderComposerFunnel();

    expect(popstateListeners.size).toBe(1);

    first.unmount();

    expect(popstateListeners.size).toBe(0);

    const second = renderComposerFunnel();

    expect(popstateListeners.size).toBe(1);

    second.unmount();
    window.dispatchEvent(new PopStateEvent("popstate", { state: null }));

    expect(popstateListeners.size).toBe(0);
  });
});
