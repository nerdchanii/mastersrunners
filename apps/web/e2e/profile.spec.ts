import { test, expect } from "@playwright/test";
import { setupAuth, mockUser, mockProfileStats } from "./helpers/mock-auth";

const API_BASE = "http://localhost:4000/api/v1";

test.describe("프로필 페이지", () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);

    // Mock GET /profile (own profile API - returns user + stats + followersCount + followingCount)
    await page.route(`${API_BASE}/profile`, (route) => {
      if (route.request().method() === "GET" && !route.request().url().includes("/profile/")) {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            user: mockUser,
            stats: { totalWorkouts: 156, totalDistance: 1520000, totalDuration: 432000, averagePace: 284 },
            followersCount: mockProfileStats.followerCount,
            followingCount: mockProfileStats.followingCount,
          }),
        });
      } else {
        route.continue();
      }
    });

    // Mock tab data
    await page.route(`${API_BASE}/posts?userId=${mockUser.id}&limit=12`, (route) => {
      route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    });
    await page.route(`${API_BASE}/workouts?userId=${mockUser.id}&limit=20`, (route) => {
      route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    });
    await page.route(`${API_BASE}/crews?my=true`, (route) => {
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [] }) });
    });
  });

  test("프로필 페이지에 커버 이미지 영역이 표시된다 (그라데이션 fallback)", async ({ page }) => {
    await page.goto("/profile");
    await page.waitForSelector("[class*='rounded-xl']");

    // 커버 영역 (gradient fallback since no backgroundImage)
    const coverGradient = page.locator("[class*='from-blue-500']");
    await expect(coverGradient).toBeVisible();
  });

  test("프로필 사진이 커버 이미지 하단에 겹쳐서 표시된다", async ({ page }) => {
    await page.goto("/profile");

    // Avatar with ring (overlapping cover)
    const avatar = page.locator("[class*='ring-4'][class*='ring-card']").first();
    await expect(avatar).toBeVisible();
  });

  test("이름과 bio가 표시된다", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.getByText(mockUser.name)).toBeVisible();
    await expect(page.getByText(mockUser.bio!)).toBeVisible();
  });

  test("팔로워/팔로잉 카운트가 표시된다", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.getByText(String(mockProfileStats.followerCount))).toBeVisible();
    await expect(page.getByText(String(mockProfileStats.followingCount))).toBeVisible();
  });

  test("본인 프로필에 '프로필 수정' 버튼이 표시된다", async ({ page }) => {
    await page.goto("/profile");
    const editButton = page.getByRole("link", { name: /프로필 수정/i });
    await expect(editButton).toBeVisible();
    await expect(editButton).toHaveAttribute("href", "/settings/profile");
  });
});
