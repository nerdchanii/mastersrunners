import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { QueryClient, QueryClientProvider, type QueryKey } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type PropsWithChildren } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as profileHookModule from "@/hooks/useProfile";
import { profileKeys } from "@/hooks/useProfile";
import { api } from "@/lib/api-client";

import ProfilePage from "../index";

const { authState } = vi.hoisted(() => ({
  authState: {
    isAuthenticated: false,
    isLoading: false,
    user: null as null | {
      id: string;
      name: string;
      profileImage: string | null;
    },
  },
}));

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => authState,
}));

vi.mock("@/lib/api-client", () => ({
  api: {
    fetch: vi.fn(),
  },
}));

vi.mock("@/components/common/LoadingPage", () => ({
  LoadingPage: () => <div>프로필 로딩</div>,
}));

vi.mock("@/components/profile/ProfileHeader", () => ({
  ProfileHeader: ({
    crews,
    followerPreviewUsers,
  }: {
    crews: Array<{ name: string }>;
    followerPreviewUsers: Array<{ name: string }>;
  }) => (
    <header>
      <p>profile header</p>
      <p>header crews:{crews.map((crew) => crew.name).join(",")}</p>
      <p>header followers:{followerPreviewUsers.map((follower) => follower.name).join(",")}</p>
    </header>
  ),
}));

vi.mock("@/components/profile/ProfileTabs", () => ({
  ProfileTabs: ({
    posts,
    workouts,
    crewPosts,
    activeTab,
    onTabChange,
    error,
    onRetry,
  }: {
    posts: Array<{ content: string }>;
    workouts: Array<{ memo: string | null }>;
    crewPosts: Array<{ content: string }>;
    activeTab: string;
    onTabChange: (tab: string) => void;
    error?: string | null;
    onRetry?: () => void;
  }) => (
    <section>
      <button type="button" onClick={() => onTabChange("posts")}>
        게시글
      </button>
      <button type="button" onClick={() => onTabChange("workouts")}>
        워크아웃
      </button>
      <button type="button" onClick={() => onTabChange("crews")}>
        크루
      </button>
      <div aria-label="active profile tab">
        {error ? (
          <div role="alert">
            <p>{error}</p>
            <button type="button" onClick={onRetry}>
              탭 다시 시도
            </button>
          </div>
        ) : null}
        {!error && activeTab === "posts"
          ? posts.map((post) => <article key={post.content}>{post.content}</article>)
          : null}
        {!error && activeTab === "workouts"
          ? workouts.map((workout) => <article key={workout.memo}>{workout.memo}</article>)
          : null}
        {!error && activeTab === "crews"
          ? crewPosts.map((post) => <article key={post.content}>{post.content}</article>)
          : null}
      </div>
    </section>
  ),
}));

const sourceDirectory = path.dirname(fileURLToPath(import.meta.url));
const profileHookExports = profileHookModule as unknown as Record<string, unknown>;
const profileQueries = profileHookExports.profileQueries as
  | Record<
      string,
      (...args: never[]) => {
        enabled?: boolean;
        queryFn?: () => Promise<unknown>;
        queryKey: QueryKey;
      }
    >
  | undefined;
const apiFetch = vi.mocked(api.fetch);

async function readSource(relativePath: string) {
  return readFile(path.join(sourceDirectory, relativePath), "utf8");
}

function createQueryClientWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });

  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { queryClient, wrapper };
}

function renderProfileRoute() {
  const { queryClient } = createQueryClientWrapper();

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/profile"]}>
        <Routes>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<main>login route</main>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function expectProfileQueryFactory(name: string, expectedQueryKey: QueryKey, ...args: unknown[]) {
  const factory = profileQueries?.[name];

  expect(factory, `profileQueries.${name} must be exported as a query option factory`).toEqual(
    expect.any(Function),
  );
  expect(factory!(...(args as never[])).queryKey).toEqual(expectedQueryKey);
}

function authenticateRunner() {
  authState.isAuthenticated = true;
  authState.isLoading = false;
  authState.user = {
    id: "runner-1",
    name: "김러너",
    profileImage: null,
  };
}

function installSuccessfulProfileApi() {
  apiFetch.mockImplementation(async (url) => {
    if (url === "/profile") {
      return profileResponse();
    }

    if (url === "/crews/my") {
      return [
        {
          id: "crew-1",
          name: "마스터즈",
          description: null,
          imageUrl: null,
          _count: { members: 9 },
        },
      ];
    }

    if (url === "/follow/followers") {
      return [{ id: "follower-1", name: "팔로워", profileImage: null }];
    }

    if (url === "/posts?userId=runner-1&limit=12") {
      return [
        {
          id: "post-1",
          content: "게시글 탭 데이터",
          createdAt: "2026-05-07T00:00:00.000Z",
          user: profileUser(),
        },
      ];
    }

    if (url === "/workouts?userId=runner-1") {
      return [
        {
          id: "workout-1",
          distance: 5000,
          duration: 1500,
          pace: 300,
          date: "2026-05-07T00:00:00.000Z",
          memo: "워크아웃 탭 데이터",
        },
      ];
    }

    if (url === "/crews/crew-1/posts") {
      return { items: [], nextCursor: null };
    }

    throw new Error(`Unhandled API request: ${url}`);
  });
}

function profileUser() {
  return {
    id: "runner-1",
    email: "runner@example.com",
    name: "김러너",
    profileImage: null,
    backgroundImage: null,
    bio: null,
    isPrivate: false,
    createdAt: "2026-05-07T00:00:00.000Z",
  };
}

function profileResponse() {
  return {
    user: profileUser(),
    stats: {
      postCount: 1,
      totalWorkouts: 1,
      totalDistance: 5000,
      totalDuration: 1500,
      averagePace: 300,
    },
    followersCount: 3,
    followingCount: 2,
    isFollowing: false,
  };
}

describe("profile route query migration", () => {
  beforeEach(() => {
    authState.isAuthenticated = false;
    authState.isLoading = false;
    authState.user = null;
    apiFetch.mockReset();
  });

  it("redirects unauthenticated /profile visits to /login", async () => {
    renderProfileRoute();

    await waitFor(() => {
      expect(screen.getByText("login route")).toBeInTheDocument();
    });
  });

  it("keeps profile route out of direct fetch and local server-state ownership", async () => {
    const routeSource = await readSource("../index.tsx");

    expect(routeSource).not.toContain("./profile-api");
    expect(routeSource).not.toMatch(
      /\bfetchMy(Profile|ProfilePosts|ProfileWorkouts|ProfileCrews|FollowersPreview)\b/,
    );
    expect(routeSource).not.toContain("fetchCrewPostsFromCrews");
    expect(routeSource).not.toMatch(
      /\bset(ProfileUser|ProfileStats|Posts|Workouts|Crews|CrewPosts|FollowerPreviewUsers)\b/,
    );
    expect(routeSource).not.toContain("isTabDataLoading");
  });

  it("exposes domain query options for profile detail, stats, follower preview, and tab data", () => {
    expectProfileQueryFactory("mine", profileKeys.mine());
    expectProfileQueryFactory("stats", profileKeys.stats("runner-1"), "runner-1");
    expectProfileQueryFactory(
      "followersPreview",
      profileKeys.tab("runner-1", "followers", { limit: 3 }),
      "runner-1",
    );
    expectProfileQueryFactory(
      "tab",
      profileKeys.tab("runner-1", "posts", { limit: 12 }),
      "runner-1",
      "posts",
      { limit: 12 },
    );
    expectProfileQueryFactory(
      "tab",
      profileKeys.tab("runner-1", "workouts"),
      "runner-1",
      "workouts",
    );
    expectProfileQueryFactory("tab", profileKeys.tab("runner-1", "crews"), "runner-1", "crews");
  });

  it("exposes profile tab hooks whose query identity includes the active tab and whose execution is tab-enabled", () => {
    const tabQuery = profileQueries?.tab?.("runner-1" as never, "workouts" as never);

    expect(profileHookExports.useProfileTab).toEqual(expect.any(Function));
    expect(tabQuery?.queryKey).toEqual(profileKeys.tab("runner-1", "workouts"));
    expect(tabQuery).toEqual(
      expect.objectContaining({
        enabled: true,
      }),
    );
    expect(profileKeys.tab("runner-1", "posts")).not.toEqual(
      profileKeys.tab("runner-1", "workouts"),
    );
    expect(profileKeys.tab("runner-1", "workouts")).not.toEqual(
      profileKeys.tab("runner-1", "crews"),
    );
  });

  it("does not execute unsupported following tab reads through the tab query factory", async () => {
    const followingQuery = profileQueries?.tab?.("runner-1" as never, "following" as never);

    expect(followingQuery?.queryKey).toEqual(profileKeys.tab("runner-1", "following"));
    expect(followingQuery?.enabled).toBe(false);
    await expect(followingQuery?.queryFn?.()).rejects.toThrow("Unsupported profile tab: following");
  });

  it("switches authenticated tabs without rendering stale cross-tab data in the active pane", async () => {
    const user = userEvent.setup();
    authenticateRunner();
    installSuccessfulProfileApi();

    renderProfileRoute();

    const pane = await screen.findByLabelText("active profile tab");
    expect(await within(pane).findByText("게시글 탭 데이터")).toBeInTheDocument();
    expect(within(pane).queryByText("워크아웃 탭 데이터")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "워크아웃" }));

    await waitFor(() => {
      expect(within(pane).getByText("워크아웃 탭 데이터")).toBeInTheDocument();
    });
    expect(within(pane).queryByText("게시글 탭 데이터")).not.toBeInTheDocument();
    expect(apiFetch).toHaveBeenCalledWith("/posts?userId=runner-1&limit=12");
    expect(apiFetch).toHaveBeenCalledWith("/workouts?userId=runner-1");
  });

  it("keeps tab query failures inline and retryable instead of rendering a normal empty tab", async () => {
    const user = userEvent.setup();
    authenticateRunner();
    let postsAttempts = 0;
    installSuccessfulProfileApi();
    apiFetch.mockImplementation(async (url) => {
      if (url === "/posts?userId=runner-1&limit=12") {
        postsAttempts += 1;
        if (postsAttempts === 1) {
          throw new Error("posts unavailable");
        }
        return [
          {
            id: "post-1",
            content: "게시글 재시도 성공",
            createdAt: "2026-05-07T00:00:00.000Z",
            user: profileUser(),
          },
        ];
      }
      return installSuccessfulProfileApiFallback(url);
    });

    renderProfileRoute();

    expect(await screen.findByRole("alert")).toHaveTextContent("탭 콘텐츠를 불러오지 못했습니다.");
    expect(screen.queryByText("게시글이 없습니다")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "탭 다시 시도" }));

    await waitFor(() => {
      expect(screen.getByText("게시글 재시도 성공")).toBeInTheDocument();
    });
  });

  it("shows non-fatal retry notices for header auxiliary query failures", async () => {
    const user = userEvent.setup();
    authenticateRunner();
    let crewsAttempts = 0;
    let followersAttempts = 0;
    installSuccessfulProfileApi();
    apiFetch.mockImplementation(async (url) => {
      if (url === "/crews/my") {
        crewsAttempts += 1;
        if (crewsAttempts === 1) {
          throw new Error("crews unavailable");
        }
        return [
          {
            id: "crew-1",
            name: "마스터즈",
            description: null,
            imageUrl: null,
            _count: { members: 9 },
          },
        ];
      }

      if (url === "/follow/followers") {
        followersAttempts += 1;
        if (followersAttempts === 1) {
          throw new Error("followers unavailable");
        }
        return [{ id: "follower-1", name: "팔로워", profileImage: null }];
      }

      return installSuccessfulProfileApiFallback(url);
    });

    renderProfileRoute();

    expect(await screen.findByText("profile header")).toBeInTheDocument();
    const notices = screen.getByLabelText("프로필 보조 정보 오류");
    expect(notices).toHaveTextContent("크루 정보를 불러오지 못했습니다.");
    expect(notices).toHaveTextContent("팔로워 미리보기를 불러오지 못했습니다.");

    await user.click(within(notices).getAllByRole("button", { name: "다시 시도" })[0]);
    await user.click(within(notices).getAllByRole("button", { name: "다시 시도" })[0]);

    await waitFor(() => {
      expect(screen.queryByLabelText("프로필 보조 정보 오류")).not.toBeInTheDocument();
    });
    expect(screen.getByText("header crews:마스터즈")).toBeInTheDocument();
    expect(screen.getByText("header followers:팔로워")).toBeInTheDocument();
  });
});

async function installSuccessfulProfileApiFallback(url: RequestInfo | URL) {
  if (url === "/profile") {
    return profileResponse();
  }

  if (url === "/crews/my") {
    return [
      { id: "crew-1", name: "마스터즈", description: null, imageUrl: null, _count: { members: 9 } },
    ];
  }

  if (url === "/follow/followers") {
    return [{ id: "follower-1", name: "팔로워", profileImage: null }];
  }

  if (url === "/posts?userId=runner-1&limit=12") {
    return [
      {
        id: "post-1",
        content: "게시글 탭 데이터",
        createdAt: "2026-05-07T00:00:00.000Z",
        user: profileUser(),
      },
    ];
  }

  if (url === "/workouts?userId=runner-1") {
    return [
      {
        id: "workout-1",
        distance: 5000,
        duration: 1500,
        pace: 300,
        date: "2026-05-07T00:00:00.000Z",
        memo: "워크아웃 탭 데이터",
      },
    ];
  }

  if (url === "/crews/crew-1/posts") {
    return { items: [], nextCursor: null };
  }

  throw new Error(`Unhandled API request: ${url.toString()}`);
}
