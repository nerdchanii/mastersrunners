export type CrewHubTab = "activities" | "board" | "members" | "manage" | "pending";

export interface CrewHubRouteState {
  activeTab: CrewHubTab;
  isActivityCreateRoute: boolean;
  isBoardCreateRoute: boolean;
  routedBoardId?: string;
  routedPostId?: string;
}

export function crewHubPath(crewId: string, tab: CrewHubTab): string {
  if (tab === "activities") {
    return `/crews/${crewId}/activities`;
  }

  return `/crews/${crewId}/${tab}`;
}

export function crewActivityCreatePath(crewId: string): string {
  return `/crews/${crewId}/activities/new`;
}

export function crewBoardCreatePath(crewId: string): string {
  return `/crews/${crewId}/board/new`;
}

export function crewBoardPostPath(crewId: string, boardId: string, postId: string): string {
  return `/crews/${crewId}/board/${boardId}/posts/${postId}`;
}

export function isCrewHubSurfacePath(pathname: string): boolean {
  return /^\/crews\/[^/]+(?:\/(?:activities(?:\/new)?|board(?:\/new|\/[^/]+\/posts\/[^/]+)?|members|manage|pending))?\/?$/.test(
    pathname,
  );
}

export function resolveCrewHubRoute(
  pathname: string,
  crewId: string,
  canManage: boolean,
): CrewHubRouteState {
  const baseState: CrewHubRouteState = {
    activeTab: "activities",
    isActivityCreateRoute: false,
    isBoardCreateRoute: false,
  };
  const prefix = `/crews/${crewId}`;

  if (!pathname.startsWith(prefix)) {
    return baseState;
  }

  const suffix = pathname.slice(prefix.length).replace(/^\/+|\/+$/g, "");
  if (!suffix) {
    return baseState;
  }

  const parts = suffix.split("/");
  if (parts[0] === "activities") {
    return {
      activeTab: "activities",
      isActivityCreateRoute: parts[1] === "new",
      isBoardCreateRoute: false,
    };
  }

  if (parts[0] === "board") {
    if (parts[1] === "new") {
      return {
        activeTab: "board",
        isActivityCreateRoute: false,
        isBoardCreateRoute: true,
      };
    }

    if (parts.length >= 4 && parts[2] === "posts") {
      return {
        activeTab: "board",
        isActivityCreateRoute: false,
        isBoardCreateRoute: false,
        routedBoardId: parts[1],
        routedPostId: parts[3],
      };
    }

    return {
      activeTab: "board",
      isActivityCreateRoute: false,
      isBoardCreateRoute: false,
    };
  }

  if (parts[0] === "members") {
    return {
      activeTab: "members",
      isActivityCreateRoute: false,
      isBoardCreateRoute: false,
    };
  }

  if (parts[0] === "manage" && canManage) {
    return {
      activeTab: "manage",
      isActivityCreateRoute: false,
      isBoardCreateRoute: false,
    };
  }

  if (parts[0] === "pending" && canManage) {
    return {
      activeTab: "pending",
      isActivityCreateRoute: false,
      isBoardCreateRoute: false,
    };
  }

  return baseState;
}
