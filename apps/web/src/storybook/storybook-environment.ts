import { API_BASE } from "@/lib/api-client";

import {
  storybookAllCrewMembers,
  storybookChallengeLeaderboard,
  storybookChallengeTeams,
  storybookComments,
  storybookConversations,
  storybookCrew,
  storybookCrewActivities,
  storybookCrewAttendance,
  storybookCrewAttendanceHistoryByUser,
  storybookCrewAttendanceStats,
  storybookCrewBoardPostDetail,
  storybookCrewBoardPosts,
  storybookCrewBoards,
  storybookCrewChat,
  storybookCrewMembers,
  storybookCrewPosts,
  storybookCrewTags,
  storybookFreeBoardPosts,
  storybookNotifications,
  storybookPublicRuntimeConfig,
  storybookUser,
} from "./storybook-fixtures";

export interface StorybookParameters {
  apiScenario?: "default" | "empty" | "error" | "unauthorized";
  featureOverrides?: Partial<typeof storybookPublicRuntimeConfig.features>;
  route?: string;
}

type StorybookAuthMode = "guest" | "signed-in";

let mocksInstalled = false;

class StorybookIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "0px";
  readonly thresholds = [0];

  constructor(private callback: IntersectionObserverCallback) {}

  disconnect() {}

  observe(target: Element) {
    this.callback(
      [
        {
          boundingClientRect: target.getBoundingClientRect(),
          intersectionRatio: 1,
          intersectionRect: target.getBoundingClientRect(),
          isIntersecting: true,
          rootBounds: null,
          target,
          time: Date.now(),
        },
      ],
      this,
    );
  }

  takeRecords() {
    return [];
  }

  unobserve() {}
}

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json",
    },
    ...init,
  });
}

function getStorybookSearchParams(path: string) {
  return new URL(path, "http://localhost").searchParams;
}

function filterAttendanceActivities(range: string | null, type: string | null) {
  const now = new Date("2026-04-18T00:00:00.000Z").getTime();
  const rangeDays =
    range === "30d"
      ? 30
      : range === "10w"
        ? 70
        : range === "12w"
          ? 84
          : range === "monthly"
            ? null
            : range === "90d"
              ? 90
              : range === "180d"
                ? 180
                : null;

  return storybookCrewAttendanceStats.activities.filter((activity) => {
    const activityTime = new Date(activity.activityDate).getTime();
    const monthlyStart = new Date("2026-04-01T00:00:00.000Z").getTime();
    const matchesRange =
      range === "monthly"
        ? activityTime >= monthlyStart && activityTime <= now
        : rangeDays == null
          ? true
          : now - activityTime <= rangeDays * 24 * 60 * 60 * 1000;
    const matchesType = !type || type === "ALL" ? true : activity.activityType === type;
    return matchesRange && matchesType;
  });
}

function buildStorybookAttendanceStats(path: string) {
  const params = getStorybookSearchParams(path);
  const range = params.get("range");
  const type = params.get("type");
  const sort = params.get("sort");
  const order = params.get("order") === "asc" ? "asc" : "desc";
  const activities = filterAttendanceActivities(range, type);
  const totalEligible = activities.reduce((sum, item) => sum + item.total, 0);
  const totalCheckedIn = activities.reduce((sum, item) => sum + item.checkedIn, 0);
  const totalNoShow = activities.reduce((sum, item) => sum + item.noShow, 0);
  const overallRate = totalEligible === 0 ? 0 : Math.round((totalCheckedIn / totalEligible) * 100);
  const members = [...storybookCrewAttendanceStats.members].sort((left, right) => {
    const direction = order === "asc" ? 1 : -1;
    if (sort === "noShow") return (left.noShow - right.noShow) * direction;
    if (sort === "lastActivity") {
      return (
        (new Date(left.lastActivityAt ?? 0).getTime() -
          new Date(right.lastActivityAt ?? 0).getTime()) *
        direction
      );
    }
    if (sort === "rate") return (left.rate - right.rate) * direction;
    return (left.checkedIn - right.checkedIn) * direction;
  });

  return {
    summary: {
      overallRate,
      activityCount: activities.length,
      totalEligible,
      totalCheckedIn,
      totalNoShow,
    },
    activities,
    members,
  };
}

function buildStorybookAttendanceHistory(path: string) {
  const params = getStorybookSearchParams(path);
  const range = params.get("range");
  const type = params.get("type");
  const userId = path.split("/")[4];
  const history =
    storybookCrewAttendanceHistoryByUser[
      userId as keyof typeof storybookCrewAttendanceHistoryByUser
    ] ?? null;

  if (!history) return null;

  const filteredHistory = history.history.filter((item) => {
    const matchesType = !type || type === "ALL" ? true : item.activityType === type;
    if (!matchesType) return false;
    if (!range || range === "all") return true;

    const now = new Date("2026-04-18T00:00:00.000Z").getTime();
    const days =
      range === "30d"
        ? 30
        : range === "10w"
          ? 70
          : range === "12w"
            ? 84
            : range === "90d"
              ? 90
              : 180;
    return now - new Date(item.activityDate).getTime() <= days * 24 * 60 * 60 * 1000;
  });

  return {
    member: history.member,
    history: filteredHistory,
  };
}

function buildStorybookCrewDetail() {
  return {
    id: storybookCrew.id,
    name: storybookCrew.name,
    description: storybookCrew.description,
    imageUrl: storybookCrew.imageUrl,
    isPublic: true,
    createdAt: "2026-03-01T08:00:00.000Z",
    creator: {
      id: storybookUser.id,
      name: storybookUser.name,
      profileImage: storybookUser.profileImage,
    },
    _count: { members: storybookCrew.memberCount },
    members: storybookCrewMembers,
  };
}

function buildStorybookActivityDetail(path: string) {
  const activityId = path.split("/")[4];
  const activity = storybookCrewActivities.items.find((item) => item.id === activityId);

  if (!activity) {
    return null;
  }

  return {
    ...activity,
    attendances: activity.attendances.map((attendance) => {
      const member = storybookAllCrewMembers.find((item) => item.userId === attendance.userId);
      return {
        ...attendance,
        user: member?.user ?? null,
      };
    }),
  };
}

function resolveStorybookResponse(
  path: string,
  method: string,
  authMode: StorybookAuthMode,
  scenario: StorybookParameters["apiScenario"],
  featureOverrides?: StorybookParameters["featureOverrides"],
  body?: string | null,
) {
  if (scenario === "error") {
    return jsonResponse({ message: "Storybook mock error" }, { status: 500 });
  }

  if (scenario === "unauthorized") {
    return jsonResponse({ message: "로그인이 필요합니다" }, { status: 401 });
  }

  if (path === "/config/public") {
    return jsonResponse({
      ...storybookPublicRuntimeConfig,
      features: {
        ...storybookPublicRuntimeConfig.features,
        ...featureOverrides,
      },
    });
  }

  if (path === "/auth/providers") {
    return jsonResponse(storybookPublicRuntimeConfig.authProviders);
  }

  if (path === "/notifications/unread-count") {
    return jsonResponse({
      count: authMode === "signed-in" && scenario !== "empty" ? 3 : 0,
    });
  }

  if (path.startsWith("/notifications")) {
    return jsonResponse({
      items: scenario === "empty" ? [] : storybookNotifications,
      nextCursor: null,
      total: scenario === "empty" ? 0 : storybookNotifications.length,
    });
  }

  if (path.startsWith("/conversations") && method === "GET") {
    return jsonResponse({
      data: scenario === "empty" ? [] : storybookConversations,
      nextCursor: null,
    });
  }

  if (path.includes("/comments") && method === "GET") {
    return jsonResponse({
      data: scenario === "empty" ? [] : storybookComments,
      cursor: null,
      hasMore: false,
    });
  }

  if (path.includes("/comments") && method !== "GET") {
    return jsonResponse({ ok: true });
  }

  if (path.includes("/likes") || path.includes("/read")) {
    return jsonResponse({ ok: true });
  }

  if (path === "/conversations" && method === "POST") {
    return jsonResponse({ id: storybookConversations[0]?.id ?? "conversation-1" });
  }

  if (path.match(/^\/crews\/[^/]+$/) && method === "GET") {
    return jsonResponse(buildStorybookCrewDetail());
  }

  if (path.match(/^\/crews\/[^/]+\/activities(\?.*)?$/)) {
    return jsonResponse(
      scenario === "empty" ? { items: [], nextCursor: null } : storybookCrewActivities,
    );
  }

  if (path.match(/^\/crews\/[^/]+\/activities\/[^/]+$/) && method === "GET") {
    return jsonResponse(scenario === "empty" ? null : buildStorybookActivityDetail(path));
  }

  if (path.match(/^\/crews\/[^/]+\/attendance-stats(\?.*)?$/)) {
    return jsonResponse(scenario === "empty" ? null : buildStorybookAttendanceStats(path));
  }

  if (path.match(/^\/crews\/[^/]+\/members\/[^/]+\/attendance-history(\?.*)?$/)) {
    return jsonResponse(scenario === "empty" ? null : buildStorybookAttendanceHistory(path));
  }

  if (path.match(/^\/crews\/[^/]+\/boards$/)) {
    return jsonResponse(scenario === "empty" ? [] : storybookCrewBoards);
  }

  if (path.match(/^\/crews\/[^/]+\/boards\/[^/]+\/posts$/)) {
    const boardId = path.split("/")[4];
    const boardPosts =
      boardId === "board-1"
        ? storybookCrewBoardPosts
        : boardId === "board-2"
          ? storybookFreeBoardPosts
          : { items: [], nextCursor: null };
    return jsonResponse(scenario === "empty" ? { items: [], nextCursor: null } : boardPosts);
  }

  if (path.match(/^\/crews\/[^/]+\/boards\/[^/]+\/posts\/[^/]+$/) && method === "GET") {
    return jsonResponse(scenario === "empty" ? null : storybookCrewBoardPostDetail);
  }

  if (path.match(/^\/crews\/[^/]+\/posts(\?.*)?$/)) {
    return jsonResponse(
      scenario === "empty" ? { items: [], nextCursor: null } : storybookCrewPosts,
    );
  }

  if (
    path.match(/^\/crews\/[^/]+\/chat$/) ||
    path.match(/^\/crews\/[^/]+\/activities\/[^/]+\/chat$/)
  ) {
    return jsonResponse(
      scenario === "empty"
        ? {
            conversation: null,
            messages: [],
            olderCursor: null,
            newerCursor: null,
            firstUnreadMessageId: null,
          }
        : storybookCrewChat,
    );
  }

  if (path.includes("/tags")) {
    return jsonResponse(scenario === "empty" ? [] : storybookCrewTags);
  }

  if (path.includes("/members") && path.includes("/crews/")) {
    return jsonResponse(scenario === "empty" ? [] : storybookAllCrewMembers);
  }

  if (path.match(/^\/crews\/[^/]+\/activities\/[^/]+\/attendance$/) && method === "GET") {
    return jsonResponse(scenario === "empty" ? [] : storybookCrewAttendance);
  }

  if (path.includes("/attendance") && method !== "GET") {
    return jsonResponse({ ok: true });
  }

  if (path.includes("/teams") && path.includes("/challenges/")) {
    return jsonResponse(scenario === "empty" ? [] : storybookChallengeTeams);
  }

  if (path.includes("/leaderboard")) {
    return jsonResponse(scenario === "empty" ? [] : storybookChallengeLeaderboard);
  }

  if (path.match(/^\/workouts\/[^/]+$/) && method === "PATCH") {
    try {
      const parsedBody = body ? JSON.parse(body) : null;
      return jsonResponse({
        visibility: parsedBody?.visibility ?? "PUBLIC",
      });
    } catch {
      return jsonResponse({ visibility: "PUBLIC" });
    }
  }

  if (path === "/auth/me") {
    if (authMode === "guest") {
      return jsonResponse({ message: "로그인이 필요합니다" }, { status: 401 });
    }
    return jsonResponse(storybookUser);
  }

  if (method === "PATCH" || method === "POST" || method === "DELETE") {
    return jsonResponse({ ok: true });
  }

  return jsonResponse({});
}

function installBrowserMocks() {
  if (mocksInstalled || typeof window === "undefined") return;

  mocksInstalled = true;

  if (!("matchMedia" in window)) {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query: string) => ({
        matches: query.includes("dark"),
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }),
    });
  }

  Object.defineProperty(window, "IntersectionObserver", {
    configurable: true,
    writable: true,
    value: StorybookIntersectionObserver,
  });

  if (!navigator.share) {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      writable: true,
      value: async () => undefined,
    });
  }

  if (!navigator.canShare) {
    Object.defineProperty(navigator, "canShare", {
      configurable: true,
      writable: true,
      value: () => true,
    });
  }

  if (!URL.createObjectURL) {
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      writable: true,
      value: () => "blob:storybook-mock",
    });
  }
}

export function configureStorybookEnvironment(
  authMode: StorybookAuthMode,
  parameters?: StorybookParameters,
) {
  installBrowserMocks();

  const scenario = parameters?.apiScenario ?? "default";
  const originalFetch = globalThis.fetch.bind(globalThis);

  globalThis.fetch = async (input, init) => {
    const url =
      typeof input === "string" ? input : input instanceof Request ? input.url : String(input);

    if (!url.startsWith(API_BASE)) {
      return originalFetch(input as RequestInfo | URL, init);
    }

    const method = (init?.method ??
      (input instanceof Request ? input.method : undefined) ??
      "GET") as string;
    const path = url.slice(API_BASE.length);
    const requestBody =
      typeof init?.body === "string" ? init.body : input instanceof Request ? null : null;

    return resolveStorybookResponse(
      path,
      method.toUpperCase(),
      authMode,
      scenario,
      parameters?.featureOverrides,
      requestBody,
    );
  };
}
