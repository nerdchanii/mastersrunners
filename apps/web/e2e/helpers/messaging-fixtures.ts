import type { Page } from "@playwright/test";

import { mockUser } from "./mock-auth";

export const API_BASE = "http://localhost:4000/api/v1";

export const messagingFixtureIds = {
  activityConversationId: "conv-activity-1",
  activityId: "activity-1",
  crewConversationId: "conv-crew-1",
  crewId: "crew-1",
  directConversationId: "conv-direct-1",
};

export const messagingFixtureUsers = {
  crewOwner: {
    id: "user-2",
    name: "러닝맨",
    profileImage: null,
  },
  runningMate: {
    id: "user-3",
    name: "러닝메이트",
    profileImage: null,
  },
  viewer: mockUser,
} as const;

interface FixtureUser {
  id: string;
  name: string;
  profileImage: string | null;
}

interface FixtureConversationParticipant {
  joinedAt?: string;
  lastReadAt: string | null;
  user: FixtureUser;
  userId: string;
}

interface FixtureMessageSummary {
  content: string;
  createdAt: string;
  id: string;
  senderId: string;
}

interface FixtureMessage extends FixtureMessageSummary {
  conversationId: string;
  deletedAt: string | null;
  sender: FixtureUser;
}

interface FixtureConversationSummary {
  id: string;
  messages: FixtureMessageSummary[];
  participants: FixtureConversationParticipant[];
  type: "DIRECT";
  unreadCount: number;
  updatedAt: string;
}

interface FixtureDirectConversationDetail {
  conversation: Omit<FixtureConversationSummary, "messages" | "unreadCount">;
  messages: FixtureMessage[];
  nextCursor: string | null;
}

interface FixtureChatConversation {
  activityId: string | null;
  crewId: string | null;
  id: string;
  name: string | null;
  participants: FixtureConversationParticipant[];
  type: "ACTIVITY" | "CREW";
}

interface FixtureChatResponse {
  conversation: FixtureChatConversation;
  messages: FixtureMessage[];
  nextCursor: string | null;
}

interface FixtureCrewMember {
  id: string;
  joinedAt: string;
  role: "ADMIN" | "MEMBER" | "OWNER";
  status: "ACTIVE" | "PENDING";
  user: FixtureUser;
  userId: string;
}

interface FixtureCrew {
  _count: { members: number };
  createdAt: string;
  creator: FixtureUser;
  description: string;
  id: string;
  imageUrl: string | null;
  isPublic: boolean;
  maxMembers: number | null;
  members: FixtureCrewMember[];
  name: string;
}

interface FixtureActivityAttendance {
  checkedAt: string | null;
  checkedBy: string | null;
  id: string;
  method: "MANUAL" | "QR" | null;
  rsvpAt: string | null;
  status: "CHECKED_IN" | "NO_SHOW" | "RSVP";
  user: FixtureUser;
  userId: string;
}

interface FixtureActivity {
  activityDate: string;
  activityType: "OFFICIAL" | "POP_UP";
  attendances: FixtureActivityAttendance[];
  chatConversationId: string | null;
  completedAt: string | null;
  createdAt: string;
  createdBy: string;
  crewId: string;
  description: string;
  id: string;
  latitude: number | null;
  location: string;
  longitude: number | null;
  qrCode: string;
  status: "COMPLETED" | "SCHEDULED";
  title: string;
  workoutTypeId: string | null;
}

interface CrewChatScenario {
  activitiesResponse: { items: unknown[]; nextCursor: string | null };
  attendanceStats: { activities: unknown[]; memberStats: unknown[]; overallRate: number };
  chatResponse: FixtureChatResponse;
  crew: FixtureCrew;
  crewId: string;
}

interface ActivityChatScenario {
  activity: FixtureActivity;
  activityId: string;
  chatResponse: FixtureChatResponse;
  crew: FixtureCrew;
  crewId: string;
}

interface DirectMessagesScenario {
  conversationDetailResponse: FixtureDirectConversationDetail;
  conversationId: string;
  conversationsResponse: { data: FixtureConversationSummary[]; nextCursor: string | null };
  unreadNotificationsCount: number;
}

interface MessagingRoutesScenario {
  activityChat?: ActivityChatScenario;
  crewChat?: CrewChatScenario;
  directMessages?: DirectMessagesScenario;
}

function json(value: unknown, status = 200) {
  return {
    body: JSON.stringify(value),
    contentType: "application/json",
    status,
  };
}

export function buildMessage(overrides: Partial<FixtureMessage> = {}): FixtureMessage {
  return {
    content: "오늘도 달리시나요?",
    conversationId: messagingFixtureIds.directConversationId,
    createdAt: "2026-02-20T10:05:00.000Z",
    deletedAt: null,
    id: "msg-1",
    sender: messagingFixtureUsers.runningMate,
    senderId: messagingFixtureUsers.runningMate.id,
    ...overrides,
  };
}

export function buildDirectConversation(
  overrides: Partial<FixtureConversationSummary> = {},
): FixtureConversationSummary {
  const id = overrides.id ?? messagingFixtureIds.directConversationId;

  return {
    id,
    messages: [
      {
        content: "오늘도 달리시나요?",
        createdAt: "2026-02-20T10:05:00.000Z",
        id: "msg-last",
        senderId: messagingFixtureUsers.runningMate.id,
      },
    ],
    participants: [
      {
        lastReadAt: "2026-02-20T10:00:00.000Z",
        user: messagingFixtureUsers.viewer,
        userId: messagingFixtureUsers.viewer.id,
      },
      {
        lastReadAt: null,
        user: messagingFixtureUsers.runningMate,
        userId: messagingFixtureUsers.runningMate.id,
      },
    ],
    type: "DIRECT",
    unreadCount: 3,
    updatedAt: "2026-02-20T10:05:00.000Z",
    ...overrides,
  };
}

export function buildCrewConversation(
  overrides: Partial<FixtureChatConversation> = {},
): FixtureChatConversation {
  return {
    activityId: null,
    crewId: messagingFixtureIds.crewId,
    id: messagingFixtureIds.crewConversationId,
    name: null,
    participants: [
      {
        joinedAt: "2026-02-15T08:30:00Z",
        lastReadAt: "2026-02-19T10:00:00Z",
        user: messagingFixtureUsers.viewer,
        userId: messagingFixtureUsers.viewer.id,
      },
      {
        joinedAt: "2026-02-15T08:30:00Z",
        lastReadAt: "2026-02-19T09:50:00Z",
        user: messagingFixtureUsers.crewOwner,
        userId: messagingFixtureUsers.crewOwner.id,
      },
    ],
    type: "CREW",
    ...overrides,
  };
}

export function buildActivityConversation(
  overrides: Partial<FixtureChatConversation> = {},
): FixtureChatConversation {
  return {
    activityId: messagingFixtureIds.activityId,
    crewId: messagingFixtureIds.crewId,
    id: messagingFixtureIds.activityConversationId,
    name: null,
    participants: [
      {
        joinedAt: "2026-02-19T08:30:00Z",
        lastReadAt: null,
        user: messagingFixtureUsers.viewer,
        userId: messagingFixtureUsers.viewer.id,
      },
    ],
    type: "ACTIVITY",
    ...overrides,
  };
}

export function buildCrew(
  overrides: Partial<FixtureCrew> = {},
  viewerRole: FixtureCrewMember["role"] = "MEMBER",
): FixtureCrew {
  const id = overrides.id ?? messagingFixtureIds.crewId;
  const name = overrides.name ?? "서울 러닝 크루";

  return {
    _count: { members: 2 },
    createdAt: "2026-01-01T00:00:00.000Z",
    creator: messagingFixtureUsers.viewer,
    description: "서울에서 러닝하는 크루",
    id,
    imageUrl: null,
    isPublic: true,
    maxMembers: null,
    members: [
      {
        id: "member-viewer",
        joinedAt: "2026-01-01T00:00:00.000Z",
        role: viewerRole,
        status: "ACTIVE",
        user: messagingFixtureUsers.viewer,
        userId: messagingFixtureUsers.viewer.id,
      },
      {
        id: "member-owner",
        joinedAt: "2026-01-01T00:00:00.000Z",
        role: "OWNER",
        status: "ACTIVE",
        user: messagingFixtureUsers.crewOwner,
        userId: messagingFixtureUsers.crewOwner.id,
      },
    ],
    name,
    ...overrides,
  };
}

export function buildActivity(
  overrides: Partial<FixtureActivity> = {},
  viewerAttendance: Array<FixtureActivityAttendance> = [
    {
      checkedAt: null,
      checkedBy: null,
      id: "att-viewer",
      method: null,
      rsvpAt: "2026-02-19T08:50:00.000Z",
      status: "RSVP",
      user: messagingFixtureUsers.viewer,
      userId: messagingFixtureUsers.viewer.id,
    },
  ],
): FixtureActivity {
  return {
    activityDate: new Date(Date.now() + 86400000).toISOString(),
    activityType: "OFFICIAL",
    attendances: viewerAttendance,
    chatConversationId: messagingFixtureIds.activityConversationId,
    completedAt: null,
    createdAt: "2026-02-15T09:00:00.000Z",
    createdBy: messagingFixtureUsers.crewOwner.id,
    crewId: messagingFixtureIds.crewId,
    description: "함께 달려요",
    id: messagingFixtureIds.activityId,
    latitude: null,
    location: "올림픽공원",
    longitude: null,
    qrCode: "abc123",
    status: "SCHEDULED",
    title: "월요일 아침 러닝",
    workoutTypeId: null,
    ...overrides,
  };
}

export function buildDirectConversationScenario(
  overrides: {
    conversation?: Partial<FixtureConversationSummary>;
    detailConversation?: Partial<FixtureDirectConversationDetail["conversation"]>;
    messages?: FixtureMessage[];
    unreadNotificationsCount?: number;
  } = {},
): DirectMessagesScenario {
  const conversation = buildDirectConversation(overrides.conversation);
  const messages = overrides.messages ?? [
    buildMessage({
      conversationId: conversation.id,
    }),
  ];

  return {
    conversationDetailResponse: {
      conversation: {
        id: conversation.id,
        participants: overrides.detailConversation?.participants ?? conversation.participants,
        type: conversation.type,
        updatedAt: overrides.detailConversation?.updatedAt ?? conversation.updatedAt,
        ...overrides.detailConversation,
      },
      messages,
      nextCursor: null,
    },
    conversationId: conversation.id,
    conversationsResponse: {
      data: [conversation],
      nextCursor: null,
    },
    unreadNotificationsCount: overrides.unreadNotificationsCount ?? 2,
  };
}

export function buildCrewChatScenario(
  overrides: {
    chatConversation?: Partial<FixtureChatConversation>;
    crew?: Partial<FixtureCrew>;
    messages?: FixtureMessage[];
    viewerRole?: FixtureCrewMember["role"];
  } = {},
): CrewChatScenario {
  const crew = buildCrew(overrides.crew, overrides.viewerRole);
  const conversation = buildCrewConversation({
    crewId: crew.id,
    ...overrides.chatConversation,
  });

  return {
    activitiesResponse: { items: [], nextCursor: null },
    attendanceStats: { activities: [], memberStats: [], overallRate: 0 },
    chatResponse: {
      conversation,
      messages: overrides.messages ?? [
        buildMessage({
          content: "내일 공원에서 만나요!",
          conversationId: conversation.id,
          createdAt: "2026-02-19T10:05:00.000Z",
          id: "msg-2",
          sender: messagingFixtureUsers.crewOwner,
          senderId: messagingFixtureUsers.crewOwner.id,
        }),
        buildMessage({
          content: "안녕하세요, 러닝 크루 채팅방입니다!",
          conversationId: conversation.id,
          createdAt: "2026-02-19T10:00:00.000Z",
          id: "msg-1",
          sender: messagingFixtureUsers.viewer,
          senderId: messagingFixtureUsers.viewer.id,
        }),
      ],
      nextCursor: null,
    },
    crew,
    crewId: crew.id,
  };
}

export function buildActivityChatScenario(
  overrides: {
    activity?: Partial<FixtureActivity>;
    chatConversation?: Partial<FixtureChatConversation>;
    crew?: Partial<FixtureCrew>;
    messages?: FixtureMessage[];
    viewerAttendance?: FixtureActivityAttendance[];
    viewerRole?: FixtureCrewMember["role"];
  } = {},
): ActivityChatScenario {
  const crew = buildCrew(overrides.crew, overrides.viewerRole);
  const activity = buildActivity(overrides.activity, overrides.viewerAttendance);
  const conversation = buildActivityConversation({
    activityId: activity.id,
    crewId: crew.id,
    id: activity.chatConversationId ?? messagingFixtureIds.activityConversationId,
    ...overrides.chatConversation,
  });

  return {
    activity,
    activityId: activity.id,
    chatResponse: {
      conversation,
      messages: overrides.messages ?? [],
      nextCursor: null,
    },
    crew,
    crewId: crew.id,
  };
}

export async function setupMessagingRoutes(page: Page, scenario: MessagingRoutesScenario) {
  const routes: Array<Promise<void>> = [];

  if (scenario.directMessages) {
    const direct = scenario.directMessages;

    routes.push(
      page.route(`${API_BASE}/notifications/unread-count`, (route) => {
        route.fulfill(json({ count: direct.unreadNotificationsCount }));
      }),
    );
    routes.push(
      page.route(`${API_BASE}/conversations/${direct.conversationId}/read`, (route) => {
        route.fulfill(json({}));
      }),
    );
    routes.push(
      page.route(`${API_BASE}/conversations/${direct.conversationId}*`, (route) => {
        route.fulfill(json(direct.conversationDetailResponse));
      }),
    );
    routes.push(
      page.route(`${API_BASE}/conversations*`, (route) => {
        if (route.request().url().includes("/conversations/")) {
          return route.fallback();
        }

        route.fulfill(json(direct.conversationsResponse));
      }),
    );
  }

  if (scenario.crewChat) {
    const crewChat = scenario.crewChat;

    routes.push(
      page.route(`${API_BASE}/crews/${crewChat.crewId}`, (route) => {
        const url = route.request().url();
        if (
          url.includes("/chat") ||
          url.includes("/activities") ||
          url.includes("/attendance-stats")
        ) {
          return route.fallback();
        }

        route.fulfill(json(crewChat.crew));
      }),
    );
    routes.push(
      page.route(`${API_BASE}/crews/${crewChat.crewId}/chat*`, (route) => {
        route.fulfill(json(crewChat.chatResponse));
      }),
    );
    routes.push(
      page.route(`${API_BASE}/crews/${crewChat.crewId}/activities*`, (route) => {
        route.fulfill(json(crewChat.activitiesResponse));
      }),
    );
    routes.push(
      page.route(`${API_BASE}/crews/${crewChat.crewId}/attendance-stats*`, (route) => {
        route.fulfill(json(crewChat.attendanceStats));
      }),
    );
  }

  if (scenario.activityChat) {
    const activityChat = scenario.activityChat;

    routes.push(
      page.route(
        `${API_BASE}/crews/${activityChat.crewId}/activities/${activityChat.activityId}/chat*`,
        (route) => {
          route.fulfill(json(activityChat.chatResponse));
        },
      ),
    );
    routes.push(
      page.route(
        `${API_BASE}/crews/${activityChat.crewId}/activities/${activityChat.activityId}`,
        (route) => {
          if (route.request().url().includes("/chat")) {
            return route.fallback();
          }

          route.fulfill(json(activityChat.activity));
        },
      ),
    );
    routes.push(
      page.route(`${API_BASE}/crews/${activityChat.crewId}`, (route) => {
        if (route.request().url().includes("/activities")) {
          return route.fallback();
        }

        route.fulfill(json(activityChat.crew));
      }),
    );
  }

  await Promise.all(routes);
}
