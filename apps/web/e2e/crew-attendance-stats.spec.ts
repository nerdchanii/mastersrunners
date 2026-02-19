import { test, expect } from "@playwright/test";
import { setupAuth, mockUser } from "./helpers/mock-auth";

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
  ],
};

const mockCrewStats = {
  activities: [
    {
      id: "act-1",
      title: "월요일 아침 러닝",
      activityDate: "2026-02-10T09:00:00.000Z",
      activityType: "OFFICIAL",
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
      total: 2,
      checkedIn: 2,
      noShow: 0,
      rate: 100,
    },
  ],
  memberStats: [
    {
      userId: mockUser.id,
      user: { id: mockUser.id, name: mockUser.name, profileImage: null },
      total: 2,
      checkedIn: 2,
      noShow: 0,
      rate: 100,
    },
    {
      userId: "user-2",
      user: { id: "user-2", name: "러닝맨", profileImage: null },
      total: 2,
      checkedIn: 1,
      noShow: 1,
      rate: 50,
    },
  ],
  overallRate: 80,
};

function setupRoutes(page: import("@playwright/test").Page) {
  return Promise.all([
    page.route(`${API_BASE}/crews/${mockCrewId}`, (route) => {
      if (route.request().url().includes("/attendance-stats") || route.request().url().includes("/activities"))
        return route.fallback();
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

  test("통계 탭이 표시된다", async ({ page }) => {
    await page.goto(`/crews/${mockCrewId}`);

    await expect(page.getByRole("tab", { name: "통계" })).toBeVisible();
  });

  test("통계 탭 클릭 시 전체 출석률이 표시된다", async ({ page }) => {
    await page.goto(`/crews/${mockCrewId}`);

    await page.getByRole("tab", { name: "통계" }).click();

    await expect(page.getByText("전체 출석률")).toBeVisible();
    await expect(page.getByText("80%")).toBeVisible();
    await expect(page.getByText(/2개 활동 기준/)).toBeVisible();
  });

  test("멤버별 출석률 랭킹이 표시된다", async ({ page }) => {
    await page.goto(`/crews/${mockCrewId}`);

    await page.getByRole("tab", { name: "통계" }).click();

    await expect(page.getByText("멤버별 출석률")).toBeVisible();
    await expect(page.getByText("100%")).toBeVisible();
    await expect(page.getByText("50%")).toBeVisible();
    await expect(page.getByText("2회 출석")).toBeVisible();
    await expect(page.getByText("1회 불참")).toBeVisible();
  });

  test("활동별 출석 현황 차트가 표시된다", async ({ page }) => {
    await page.goto(`/crews/${mockCrewId}`);

    await page.getByRole("tab", { name: "통계" }).click();

    await expect(page.getByText("활동별 출석 현황")).toBeVisible();
  });

  test("활동 타입 필터가 동작한다", async ({ page }) => {
    await page.goto(`/crews/${mockCrewId}`);

    await page.getByRole("tab", { name: "통계" }).click();

    // Filter badges should be visible
    await expect(page.getByText("전체", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("공식", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("번개", { exact: true }).first()).toBeVisible();

    // Click official filter
    await page.getByText("공식", { exact: true }).first().click();
    // Should still show stats (mock returns same data regardless of filter)
    await expect(page.getByText("전체 출석률")).toBeVisible();
  });
});
