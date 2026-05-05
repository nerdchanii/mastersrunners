import { expect, test } from "@playwright/test";

import { mockUser, setupAuth } from "./helpers/mock-auth";

const API_BASE = "http://localhost:4000/api/v1";
const mockCrewId = "crew-1";

const mockCrew = {
  id: mockCrewId,
  name: "서울 러닝 크루",
  description: "서울에서 러닝하는 크루",
  imageUrl: null,
  isPublic: true,
  maxMembers: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  creator: { id: mockUser.id, name: mockUser.name, profileImage: null },
  _count: { members: 3 },
  members: [
    {
      id: "member-1",
      userId: mockUser.id,
      role: "OWNER",
      status: "ACTIVE",
      joinedAt: "2026-01-01T00:00:00.000Z",
      user: { id: mockUser.id, name: mockUser.name, profileImage: null },
    },
    {
      id: "member-2",
      userId: "user-2",
      role: "MEMBER",
      status: "ACTIVE",
      joinedAt: "2026-01-02T00:00:00.000Z",
      user: { id: "user-2", name: "러닝맨", profileImage: null },
    },
    {
      id: "member-3",
      userId: "user-3",
      role: "MEMBER",
      status: "ACTIVE",
      joinedAt: "2026-01-03T00:00:00.000Z",
      user: { id: "user-3", name: "노쇼왕", profileImage: null },
    },
  ],
};

const mockCrewStats = {
  summary: {
    overallRate: 80,
    activityCount: 2,
    totalEligible: 5,
    totalCheckedIn: 4,
    totalNoShow: 1,
  },
  activities: [
    {
      id: "act-1",
      title: "월요일 아침 러닝",
      activityDate: "2026-02-10T09:00:00.000Z",
      activityType: "OFFICIAL",
      activityIcon: "🏃",
      location: "서울숲 문화예술공원",
      total: 3,
      checkedIn: 2,
      noShow: 1,
      rate: 67,
    },
    {
      id: "act-2",
      title: "번개 러닝",
      activityDate: "2026-02-12T18:00:00.000Z",
      activityType: "POP_UP",
      activityIcon: null,
      location: "잠실 한강공원",
      total: 2,
      checkedIn: 2,
      noShow: 0,
      rate: 100,
    },
  ],
  members: [
    {
      userId: mockUser.id,
      user: { id: mockUser.id, name: mockUser.name, profileImage: null },
      totalEligible: 2,
      checkedIn: 2,
      noShow: 0,
      rate: 100,
      lastActivityAt: "2026-02-12T18:00:00.000Z",
      lastCheckedInAt: "2026-02-12T18:05:00.000Z",
    },
    {
      userId: "user-2",
      user: { id: "user-2", name: "러닝맨", profileImage: null },
      totalEligible: 2,
      checkedIn: 1,
      noShow: 1,
      rate: 50,
      lastActivityAt: "2026-02-10T09:00:00.000Z",
      lastCheckedInAt: "2026-02-03T09:00:00.000Z",
    },
  ],
};

const mockHistory = {
  member: mockCrewStats.members[1],
  history: [
    {
      id: "attendance-history-1",
      activityId: "act-1",
      title: "월요일 아침 러닝",
      activityDate: "2026-02-10T09:00:00.000Z",
      activityType: "OFFICIAL",
      activityIcon: "🏃",
      status: "NO_SHOW",
      checkedAt: null,
      rsvpAt: "2026-02-10T08:00:00.000Z",
    },
    {
      id: "attendance-history-2",
      activityId: "act-x",
      title: "화요일 새벽 러닝",
      activityDate: "2026-02-03T09:00:00.000Z",
      activityType: "OFFICIAL",
      activityIcon: "🏃",
      status: "CHECKED_IN",
      checkedAt: "2026-02-03T09:01:00.000Z",
      rsvpAt: "2026-02-03T08:00:00.000Z",
    },
  ],
};

function setupRoutes(page: import("@playwright/test").Page) {
  return Promise.all([
    page.route(`${API_BASE}/crews/${mockCrewId}`, (route) => {
      if (
        route.request().url().includes("/attendance-stats") ||
        route.request().url().includes("/attendance-history") ||
        route.request().url().includes("/activities")
      ) {
        return route.fallback();
      }
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockCrew),
      });
    }),
    page.route(`${API_BASE}/crews/${mockCrewId}/attendance-stats*`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockCrewStats),
      });
    }),
    page.route(`${API_BASE}/crews/${mockCrewId}/members/user-2/attendance-history*`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockHistory),
      });
    }),
    page.route(`${API_BASE}/crews/${mockCrewId}/activities*`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ items: [], nextCursor: null }),
      });
    }),
  ]);
}

test.describe("크루 출석 대시보드", () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await setupRoutes(page);
  });

  test("관리 탭에서 출석 운영 대시보드가 보인다", async ({ page }) => {
    await page.goto(`/crews/${mockCrewId}`);

    await page.getByRole("tab", { name: "관리" }).click();

    await expect(page.getByRole("heading", { name: "크루 출석부" })).toBeVisible();
    await expect(
      page.getByText("최근 참여 흐름과 멤버별 출석 이력을 한 화면에서 확인합니다."),
    ).toBeVisible();
    await expect(page.getByText("정기런")).toBeVisible();
    await expect(page.getByText("번개")).toBeVisible();
  });

  test("활동 탭과 멤버 탭이 분리되어 표시된다", async ({ page }) => {
    await page.goto(`/crews/${mockCrewId}`);

    await page.getByRole("tab", { name: "관리" }).click();

    await expect(page.getByText("활동별 출석 흐름")).toBeVisible();
    await expect(
      page.getByText("정기런과 번개를 같은 시간축 위에서 비교해 최근 참여 리듬을 읽습니다."),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "가장 최근 정기런" })).toBeVisible();
    await expect(page.getByText("서울숲 문화예술공원")).toBeVisible();

    await page.getByRole("tab", { name: "멤버별" }).click();

    await expect(page.getByRole("table", { name: "멤버별 출석 현황" })).toBeVisible();
    await expect(page.getByRole("table").getByText("러닝맨")).toBeVisible();
  });

  test("멤버 행 클릭 시 출석 상세 이력이 표시된다", async ({ page }) => {
    await page.goto(`/crews/${mockCrewId}`);

    await page.getByRole("tab", { name: "관리" }).click();
    await page.getByRole("tab", { name: "멤버별" }).click();
    await page.getByRole("row").filter({ hasText: "러닝맨" }).click();

    await expect(page.getByText("노쇼", { exact: true }).last()).toBeVisible();
    await expect(page.getByText("화요일 새벽 러닝")).toBeVisible();
  });
});
