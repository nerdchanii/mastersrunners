import { expect, test } from "@playwright/test";

import { mockUser, setupAuth } from "./helpers/mock-auth";

const API_BASE = "http://localhost:4000/api/v1";

test.describe("게시글 상세", () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);

    await page.route(`${API_BASE}/posts/post-1`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "post-1",
          content: "한강 러닝 후 남긴 사진 기록입니다.",
          visibility: "PUBLIC",
          hashtags: ["러닝", "한강"],
          createdAt: "2026-04-01T07:00:00.000Z",
          user: { id: mockUser.id, name: mockUser.name, profileImage: null },
          images: [
            { id: "image-2", url: "https://example.com/ordered-second.jpg", order: 2 },
            { id: "image-1", url: "https://example.com/ordered-first.jpg", order: 1 },
          ],
          workouts: [
            {
              workout: {
                id: "workout-1",
                distance: 10000,
                duration: 3000,
                pace: 300,
                date: "2026-04-01T06:00:00.000Z",
                workoutType: { name: "조깅" },
              },
            },
          ],
          _count: { likes: 5, comments: 0 },
          isLiked: false,
        }),
      });
    });

    await page.route(`${API_BASE}/posts/post-1/comments?limit=50`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });
  });

  test("이미지 첨부 게시글은 상세 페이지에서도 이미지를 유지한다", async ({ page }) => {
    await page.goto("/posts/post-1");

    const images = page.locator('img[alt^="게시글 이미지"]');
    await expect(images).toHaveCount(2);
    await expect(images.nth(0)).toHaveAttribute("src", /ordered-first\.jpg/);
    await expect(images.nth(1)).toHaveAttribute("src", /ordered-second\.jpg/);
    await expect(page.getByText("첨부된 훈련 기록")).toBeVisible();
  });
});
