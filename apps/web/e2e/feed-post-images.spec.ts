import { expect, test } from "@playwright/test";

import { setupAuth } from "./helpers/mock-auth";

const API_BASE = "http://localhost:4000/api/v1";

test.describe("피드 게시글 이미지", () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);

    await page.route(`${API_BASE}/feed/posts?limit=10`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [
            {
              id: "post-1",
              content: "피드 이미지 회귀 테스트",
              visibility: "PUBLIC",
              hashtags: [],
              createdAt: "2026-04-01T07:00:00.000Z",
              user: { id: "user-1", name: "Feed User", profileImage: null },
              _count: { likes: 0, comments: 0 },
              isLiked: false,
              images: [
                { id: "image-2", url: "https://example.com/feed-second.jpg", order: 2 },
                { id: "image-1", url: "https://example.com/feed-first.jpg", order: 1 },
              ],
              workouts: [],
            },
          ],
          nextCursor: null,
          hasMore: false,
        }),
      });
    });

    await page.route(`${API_BASE}/feed/workouts?limit=10&excludeLinked=true`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [],
          nextCursor: null,
          hasMore: false,
        }),
      });
    });
  });

  test("persisted post image URLs render as usable src values on /feed", async ({ page }) => {
    await page.goto("/feed");

    const images = page.locator('img[alt^="게시글 이미지"]');
    await expect(images).toHaveCount(2);
    await expect(images.nth(0)).toHaveAttribute("src", /feed-first\.jpg/);
    await expect(images.nth(1)).toHaveAttribute("src", /feed-second\.jpg/);
  });
});
