import { test, expect } from "@playwright/test";
import { setupAuth, mockUser } from "./helpers/mock-auth";

const API_BASE = "http://localhost:4000/api/v1";

const mockCrewId = "crew-1";
const mockActivityId = "activity-1";
const mockConversationId = "conv-1";

const mockChatResponse = {
  conversation: {
    id: mockConversationId,
    type: "CREW",
    name: null,
    crewId: mockCrewId,
    activityId: null,
    participants: [
      {
        userId: mockUser.id,
        lastReadAt: "2026-02-19T10:00:00Z",
        joinedAt: "2026-02-15T08:30:00Z",
        user: { id: mockUser.id, name: mockUser.name, profileImage: null },
      },
      {
        userId: "user-2",
        lastReadAt: "2026-02-19T09:50:00Z",
        joinedAt: "2026-02-15T08:30:00Z",
        user: { id: "user-2", name: "러닝맨", profileImage: null },
      },
    ],
  },
  messages: [
    {
      id: "msg-2",
      content: "내일 공원에서 만나요!",
      senderId: "user-2",
      sender: { id: "user-2", name: "러닝맨", profileImage: null },
      createdAt: "2026-02-19T10:05:00.000Z",
      deletedAt: null,
    },
    {
      id: "msg-1",
      content: "안녕하세요, 러닝 크루 채팅방입니다!",
      senderId: mockUser.id,
      sender: { id: mockUser.id, name: mockUser.name, profileImage: null },
      createdAt: "2026-02-19T10:00:00.000Z",
      deletedAt: null,
    },
  ],
  nextCursor: null,
};

const mockEmptyChatResponse = {
  conversation: {
    id: "conv-2",
    type: "ACTIVITY",
    name: null,
    crewId: mockCrewId,
    activityId: mockActivityId,
    participants: [
      {
        userId: mockUser.id,
        lastReadAt: null,
        joinedAt: "2026-02-19T08:30:00Z",
        user: { id: mockUser.id, name: mockUser.name, profileImage: null },
      },
    ],
  },
  messages: [],
  nextCursor: null,
};

const mockCrew = {
  id: mockCrewId,
  name: "서울 러닝 크루",
  description: "서울에서 러닝하는 크루",
  imageUrl: null,
  isPublic: true,
  maxMembers: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  creator: { id: mockUser.id, name: mockUser.name, profileImage: null },
  _count: { members: 2 },
  members: [
    {
      id: "member-1",
      userId: mockUser.id,
      role: "MEMBER",
      status: "ACTIVE",
      joinedAt: "2026-01-01T00:00:00.000Z",
      user: { id: mockUser.id, name: mockUser.name, profileImage: null },
    },
    {
      id: "member-2",
      userId: "user-2",
      role: "OWNER",
      status: "ACTIVE",
      joinedAt: "2026-01-01T00:00:00.000Z",
      user: { id: "user-2", name: "러닝맨", profileImage: null },
    },
  ],
};

const mockActivity = {
  id: mockActivityId,
  crewId: mockCrewId,
  title: "월요일 아침 러닝",
  description: "함께 달려요",
  activityDate: new Date(Date.now() + 86400000).toISOString(),
  location: "올림픽공원",
  latitude: null,
  longitude: null,
  createdBy: "user-2",
  createdAt: "2026-02-15T09:00:00.000Z",
  qrCode: "abc123",
  activityType: "OFFICIAL",
  status: "SCHEDULED",
  completedAt: null,
  workoutTypeId: null,
  chatConversationId: "conv-2",
  attendances: [
    {
      id: "att-1",
      userId: mockUser.id,
      status: "RSVP",
      method: null,
      rsvpAt: "2026-02-19T08:50:00.000Z",
      checkedAt: null,
      checkedBy: null,
      user: { id: mockUser.id, name: mockUser.name, profileImage: null },
    },
  ],
};

test.describe("크루 그룹 채팅", () => {
  test.describe("크루 채팅 탭", () => {
    test.beforeEach(async ({ page }) => {
      await setupAuth(page);
      await Promise.all([
        page.route(`${API_BASE}/crews/${mockCrewId}`, (route) => {
          if (route.request().url().includes("/chat") || route.request().url().includes("/activities") || route.request().url().includes("/attendance"))
            return route.fallback();
          route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(mockCrew),
          });
        }),
        page.route(`${API_BASE}/crews/${mockCrewId}/chat*`, (route) => {
          route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(mockChatResponse),
          });
        }),
        page.route(`${API_BASE}/crews/${mockCrewId}/activities*`, (route) => {
          route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ items: [], nextCursor: null }),
          });
        }),
        page.route(`${API_BASE}/crews/${mockCrewId}/attendance-stats*`, (route) => {
          route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ activities: [], memberStats: [], overallRate: 0 }),
          });
        }),
      ]);
    });

    test("채팅 탭이 멤버에게 표시된다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}`);

      await expect(page.getByRole("tab", { name: "채팅" })).toBeVisible();
    });

    test("채팅 탭에서 메시지가 표시된다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}`);

      await page.getByRole("tab", { name: "채팅" }).click();

      await expect(page.getByText("안녕하세요, 러닝 크루 채팅방입니다!")).toBeVisible();
      await expect(page.getByText("내일 공원에서 만나요!")).toBeVisible();
    });

    test("참여자 수가 표시된다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}`);

      await page.getByRole("tab", { name: "채팅" }).click();

      await expect(page.getByText("(2명)")).toBeVisible();
    });

    test("메시지 입력 필드와 전송 버튼이 있다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}`);

      await page.getByRole("tab", { name: "채팅" }).click();

      await expect(page.getByPlaceholder("메시지를 입력하세요...")).toBeVisible();
    });
  });

  test.describe("활동 채팅 링크", () => {
    test.beforeEach(async ({ page }) => {
      await setupAuth(page);
      await Promise.all([
        page.route(`${API_BASE}/crews/${mockCrewId}/activities/${mockActivityId}`, (route) => {
          if (route.request().url().includes("/chat")) return route.fallback();
          route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(mockActivity),
          });
        }),
        page.route(`${API_BASE}/crews/${mockCrewId}`, (route) => {
          if (route.request().url().includes("/activities") || route.request().url().includes("/chat"))
            return route.fallback();
          route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(mockCrew),
          });
        }),
      ]);
    });

    test("RSVP 참석자에게 활동 채팅방 링크가 표시된다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}/activities/${mockActivityId}`);

      await expect(page.getByRole("button", { name: /활동 채팅방/ })).toBeVisible();
    });
  });

  test.describe("활동 채팅 페이지", () => {
    test.beforeEach(async ({ page }) => {
      await setupAuth(page);
      await Promise.all([
        page.route(`${API_BASE}/crews/${mockCrewId}/activities/${mockActivityId}/chat*`, (route) => {
          route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(mockEmptyChatResponse),
          });
        }),
        page.route(`${API_BASE}/crews/${mockCrewId}/activities/${mockActivityId}`, (route) => {
          if (route.request().url().includes("/chat")) return route.fallback();
          route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(mockActivity),
          });
        }),
        page.route(`${API_BASE}/crews/${mockCrewId}`, (route) => {
          if (route.request().url().includes("/activities")) return route.fallback();
          route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(mockCrew),
          });
        }),
      ]);
    });

    test("활동 채팅 페이지가 표시된다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}/activities/${mockActivityId}/chat`);

      await expect(page.getByText("월요일 아침 러닝 채팅")).toBeVisible();
    });

    test("빈 채팅방에 안내 메시지가 표시된다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}/activities/${mockActivityId}/chat`);

      await expect(page.getByText("아직 메시지가 없습니다.")).toBeVisible();
    });
  });
});
