import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as profileTabsModule from "../ProfileTabs";
import { ProfileTabs } from "../ProfileTabs";

vi.mock("@/components/common/EmptyState", () => ({
  EmptyState: ({ title, description }: { title: string; description: string }) => (
    <section aria-label={title}>
      <p>{description}</p>
    </section>
  ),
}));

vi.mock("@/components/common/TimeAgo", () => ({
  TimeAgo: ({ date }: { date: string }) => <time dateTime={date}>{date}</time>,
}));

vi.mock("@/components/common/UserAvatar", () => ({
  UserAvatar: ({ user, subtitle }: { user: { name: string }; subtitle?: ReactNode }) => (
    <div>
      <span>{user.name}</span>
      {subtitle}
    </div>
  ),
}));

vi.mock("@/components/feed/FeedCard", () => ({
  default: ({
    workout,
  }: {
    workout: {
      id: string;
      distance: number;
      user: { name: string };
      _count: { likes: number; comments: number };
    };
  }) => (
    <article aria-label={`workout-card-${workout.id}`}>
      <span>workout:{workout.distance}</span>
      <span>runner:{workout.user.name}</span>
      <span>workout-likes:{workout._count.likes}</span>
    </article>
  ),
}));

vi.mock("@/components/feed/PostFeedCard", () => ({
  default: ({
    post,
  }: {
    post: {
      id: string;
      content: string;
      _count: { likes: number; comments: number };
    };
  }) => (
    <article aria-label={`post-card-${post.id}`}>
      <span>{post.content}</span>
      <span>post-likes:{post._count.likes}</span>
      <span>post-comments:{post._count.comments}</span>
    </article>
  ),
}));

vi.mock("@/components/post/PostImageGallery", () => ({
  PostImageGallery: ({ images }: { images: Array<{ id: string }> }) => (
    <div>crew-images:{images.length}</div>
  ),
}));

vi.mock("@/components/social/LikeButton", () => ({
  LikeButton: ({ entityId, initialCount }: { entityId: string; initialCount: number }) => (
    <button type="button">like:{`${entityId}:${initialCount}`}</button>
  ),
}));

type ProfileTabsProps = ComponentProps<typeof ProfileTabs>;

const runner = {
  id: "runner-1",
  name: "김러너",
  profileImage: null,
};

const posts: ProfileTabsProps["posts"] = [
  {
    id: "post-1",
    content: "새벽 러닝 기록",
    createdAt: "2026-05-07T01:00:00.000Z",
    likesCount: 7,
    commentsCount: 3,
    user: runner,
  },
];

const workouts: ProfileTabsProps["workouts"] = [
  {
    id: "workout-1",
    distance: 5000,
    duration: 1500,
    pace: 300,
    date: "2026-05-07T02:00:00.000Z",
    memo: "가벼운 조깅",
  },
];

const crews: ProfileTabsProps["crews"] = [
  {
    id: "crew-1",
    name: "마스터즈 러너스",
    description: "함께 달리는 크루",
    imageUrl: null,
    _count: { members: 42 },
  },
];

const crewPosts: ProfileTabsProps["crewPosts"] = [
  {
    id: "crew-post-1",
    crewId: "crew-1",
    content: "이번 주말 LSD 공지",
    createdAt: "2026-05-07T03:00:00.000Z",
    user: runner,
    _count: { likes: 5, comments: 2 },
    images: [{ id: "crew-image-1", url: "/crew.jpg", order: 0 }],
    crew: {
      id: "crew-1",
      name: "마스터즈 러너스",
      imageUrl: null,
    },
  },
];

function setScrollY(value: number) {
  Object.defineProperty(window, "scrollY", {
    configurable: true,
    value,
  });
}

function installMatchMedia(matches = true) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

function installPointerCaptureMocks() {
  Object.defineProperty(HTMLElement.prototype, "setPointerCapture", {
    configurable: true,
    value: vi.fn(),
  });
  Object.defineProperty(HTMLElement.prototype, "hasPointerCapture", {
    configurable: true,
    value: vi.fn(() => true),
  });
  Object.defineProperty(HTMLElement.prototype, "releasePointerCapture", {
    configurable: true,
    value: vi.fn(),
  });
}

function renderProfileTabs(overrides: Partial<ProfileTabsProps> = {}) {
  const props: ProfileTabsProps = {
    posts,
    workouts,
    crews,
    crewPosts,
    isLoading: false,
    activeTab: "posts",
    onTabChange: vi.fn(),
    ...overrides,
  };

  const view = render(
    <MemoryRouter>
      <ProfileTabs {...props} />
    </MemoryRouter>,
  );

  return { ...view, props };
}

function getStickyTabs() {
  const tabList = screen.getByRole("tablist");
  const stickyTabs = tabList.parentElement;

  if (!stickyTabs) {
    throw new Error("Profile tab list is missing its sticky container");
  }

  return stickyTabs;
}

function getSwipeViewport(container: HTMLElement) {
  const viewport = container.querySelector(".touch-pan-y");

  if (!(viewport instanceof HTMLElement)) {
    throw new Error("Profile tab viewport is missing the touch swipe surface");
  }

  Object.defineProperty(viewport, "offsetWidth", {
    configurable: true,
    value: 360,
  });

  return viewport;
}

function swipeLeft(viewport: HTMLElement, deltaX: number) {
  fireEvent.pointerDown(viewport, {
    pointerType: "touch",
    pointerId: 1,
    clientX: 240,
    clientY: 20,
  });
  fireEvent.pointerMove(viewport, {
    pointerType: "touch",
    pointerId: 1,
    clientX: 240 - deltaX,
    clientY: 24,
  });
  fireEvent.pointerUp(viewport, {
    pointerType: "touch",
    pointerId: 1,
    clientX: 240 - deltaX,
    clientY: 24,
  });
}

describe("ProfileTabs decomposition behavior", () => {
  beforeEach(() => {
    installMatchMedia();
    installPointerCaptureMocks();
    setScrollY(0);
  });

  it("keeps sticky tabs visible near the top, hides on downward scroll, and restores on upward scroll", async () => {
    renderProfileTabs({
      desktopStickyTopOffset: 64,
      mobileStickyTopOffset: 48,
    });

    const stickyTabs = getStickyTabs();

    expect(stickyTabs).toHaveClass("translate-y-0");

    setScrollY(160);
    fireEvent.scroll(window);

    await waitFor(() => {
      expect(stickyTabs).toHaveClass("-translate-y-full");
    });

    setScrollY(80);
    fireEvent.scroll(window);

    await waitFor(() => {
      expect(stickyTabs).toHaveClass("translate-y-0");
    });
  });

  it("changes tabs only after a mobile swipe crosses the threshold", async () => {
    const onTabChange = vi.fn();
    const { container } = renderProfileTabs({ activeTab: "posts", onTabChange });
    const viewport = getSwipeViewport(container);

    swipeLeft(viewport, 40);

    await waitFor(() => {
      expect(onTabChange).not.toHaveBeenCalled();
    });

    swipeLeft(viewport, 96);

    await waitFor(() => {
      expect(onTabChange).toHaveBeenCalledWith("workouts");
    });
  });

  it("falls back to posts when the active workouts tab is hidden", async () => {
    const onTabChange = vi.fn();

    renderProfileTabs({
      activeTab: "workouts",
      showWorkoutsTab: false,
      onTabChange,
    });

    expect(screen.queryByRole("tab", { name: "워크아웃" })).not.toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "게시글" })).toHaveAttribute("data-state", "active");

    await waitFor(() => {
      expect(onTabChange).toHaveBeenCalledWith("posts");
    });
  });

  it("renders posts, workouts, and crews panes with their feed contracts intact", () => {
    renderProfileTabs({ activeTab: "crews" });

    expect(screen.getByLabelText("post-card-post-1")).toHaveTextContent("새벽 러닝 기록");
    expect(screen.getByLabelText("post-card-post-1")).toHaveTextContent("post-likes:7");
    expect(screen.getByLabelText("post-card-post-1")).toHaveTextContent("post-comments:3");

    expect(screen.getByLabelText("workout-card-workout-1")).toHaveTextContent("workout:5000");
    expect(screen.getByLabelText("workout-card-workout-1")).toHaveTextContent("runner:러너");
    expect(screen.getByLabelText("workout-card-workout-1")).toHaveTextContent("workout-likes:0");

    expect(screen.getByText("이번 주말 LSD 공지")).toBeInTheDocument();
    expect(screen.getByText("@마스터즈 러너스")).toBeInTheDocument();
    expect(screen.getByText("crew-images:1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "like:crew-post-1:5" })).toBeInTheDocument();
  });

  it("exposes the R7 interaction and pane boundaries before the route query migration starts", () => {
    expect(profileTabsModule).toEqual(
      expect.objectContaining({
        ProfileTabs: expect.any(Function),
        useProfileTabsInteraction: expect.any(Function),
        ProfileTabBar: expect.any(Function),
        ProfilePostsPane: expect.any(Function),
        ProfileWorkoutsPane: expect.any(Function),
        ProfileCrewsPane: expect.any(Function),
      }),
    );
  });
});
