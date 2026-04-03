import { expect, test } from "@playwright/test";

import { mockUser, mockWorkoutDetail, setupAuth } from "./helpers/mock-auth";

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
                elevationGain: 125,
                avgHeartRate: 152,
                avgCadence: 174,
                workoutType: { name: "조깅" },
                route: { encodedPolyline: "_p~iF~ps|U_ulLnnqC_mqNvxq`@" },
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

    await page.route(`${API_BASE}/workouts/workout-1`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockWorkoutDetail),
      });
    });

    await page.route(`${API_BASE}/workout-social/workout/workout-1/comments*`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [], total: 0 }),
      });
    });
  });

  test("이미지 첨부 게시글은 상세 페이지에서도 이미지를 유지한다", async ({ page }) => {
    await page.goto("/posts/post-1");

    await expect(page.getByTestId("post-detail-document")).toBeVisible();

    const images = page.locator('img[alt^="게시글 이미지"]');
    await expect(images).toHaveCount(2);
    await expect(images.nth(0)).toHaveAttribute("src", /ordered-first\.jpg/);
    await expect(images.nth(1)).toHaveAttribute("src", /ordered-second\.jpg/);
    await expect(page.getByTestId("post-detail-workouts")).toBeVisible();
    await expect(page.getByTestId("post-workout-preview-workout-1")).toBeVisible();
    await expect(page.getByText("훈련 리포트")).toBeVisible();
    await expect(page.getByText("상승 125m")).toBeVisible();
    await expect(page.getByTestId("post-detail-comments")).toBeVisible();
    await expect(page.getByRole("button", { name: "공유" })).toBeVisible();
  });

  test("연결된 훈련 preview를 누르면 워크아웃 분석 리포트로 이동한다", async ({ page }) => {
    await page.goto("/posts/post-1");

    await page.getByTestId("post-workout-preview-workout-1").click();

    await expect(page).toHaveURL(/\/workouts\/workout-1$/);
    await expect(page.getByTestId("workout-detail-analytics")).toBeVisible();
    await expect(page.locator(".leaflet-container")).toHaveCount(1);
  });
});
