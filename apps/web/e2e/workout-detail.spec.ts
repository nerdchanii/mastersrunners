import { expect, test } from "@playwright/test";

import { mockWorkoutDetail, setupAuth } from "./helpers/mock-auth";

const API_BASE = "http://localhost:4000/api/v1";

test.describe("워크아웃 상세 페이지", () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);

    // Mock workout detail API
    await page.route(`${API_BASE}/workouts/${mockWorkoutDetail.id}`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockWorkoutDetail),
      });
    });

    // Mock comments
    await page.route(
      `${API_BASE}/workout-social/workout/${mockWorkoutDetail.id}/comments*`,
      (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: [], total: 0 }),
        });
      },
    );
  });

  test("기본 정보가 표시된다 (거리, 시간, 페이스)", async ({ page }) => {
    await page.goto(`/workouts/${mockWorkoutDetail.id}`);

    // 거리: "10.50 km" (StatItem)
    await expect(page.getByText(/10\.50.*km/)).toBeVisible();

    // 시간 label
    await expect(page.getByRole("paragraph").filter({ hasText: "시간" })).toBeVisible();

    // 페이스 label
    await expect(page.getByRole("paragraph").filter({ hasText: "페이스" })).toBeVisible();
  });

  test("워크아웃 타입과 신발 정보가 표시된다", async ({ page }) => {
    await page.goto(`/workouts/${mockWorkoutDetail.id}`);

    await expect(page.getByText("달리기").first()).toBeVisible();
    await expect(page.getByText(/Nike.*Vaporfly 3/)).toBeVisible();
  });

  test("지도, 분석 차트, 랩 테이블이 함께 표시된다", async ({ page }) => {
    await page.goto(`/workouts/${mockWorkoutDetail.id}`);

    await expect(page.locator(".leaflet-container")).toHaveCount(1);
    await expect(page.getByTestId("workout-detail-analytics")).toBeVisible();
    await expect(page.getByRole("heading", { name: "고도" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "심박" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "케이던스" })).toBeVisible();
    await expect(page.getByTestId("workout-laps-table")).toBeVisible();
  });

  test("GPS 경로가 없어도 랩 기록은 계속 표시된다", async ({ page }) => {
    await page.route(`${API_BASE}/workouts/route-less-workout`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ...mockWorkoutDetail,
          id: "route-less-workout",
          workoutRoutes: [],
        }),
      });
    });

    await page.route(`${API_BASE}/workout-social/workout/route-less-workout/comments*`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [], total: 0 }),
      });
    });

    await page.goto("/workouts/route-less-workout");

    await expect(page.getByTestId("workout-detail-map-empty")).toBeVisible();
    await expect(page.getByTestId("workout-laps-table")).toBeVisible();
    await expect(page.locator(".leaflet-container")).toHaveCount(0);
  });

  test("좋아요/댓글 count가 누락되어도 기본값으로 렌더링된다", async ({ page }) => {
    await page.route(`${API_BASE}/workouts/missing-social-counts`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ...mockWorkoutDetail,
          id: "missing-social-counts",
          liked: undefined,
          likeCount: undefined,
          commentCount: undefined,
        }),
      });
    });

    await page.route(
      `${API_BASE}/workout-social/workout/missing-social-counts/comments*`,
      (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: [], total: 0 }),
        });
      },
    );

    await page.goto("/workouts/missing-social-counts");

    await expect(page.getByText(/10\.50.*km/)).toBeVisible();
    await expect(page.getByText("댓글 0개").first()).toBeVisible();
  });

  test("원본 파일 정보는 기본 화면에서 노출하지 않는다", async ({ page }) => {
    await page.goto(`/workouts/${mockWorkoutDetail.id}`);

    await expect(page.getByText("morning_run.fit")).toHaveCount(0);
    await expect(page.getByText("FIT", { exact: true })).toHaveCount(0);
  });

  test("메모가 표시된다", async ({ page }) => {
    await page.goto(`/workouts/${mockWorkoutDetail.id}`);

    await expect(page.getByText(mockWorkoutDetail.memo!)).toBeVisible();
  });

  test("소유자에게 삭제 버튼이 표시된다", async ({ page }) => {
    await page.goto(`/workouts/${mockWorkoutDetail.id}`);

    await page.getByRole("button", { name: "더보기 메뉴 열기" }).click();

    await expect(page.getByRole("menuitem", { name: /삭제/ })).toBeVisible();
  });

  test("존재하지 않는 워크아웃이면 오류가 표시된다", async ({ page }) => {
    await page.route(`${API_BASE}/workouts/missing-workout`, (route) => {
      route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ message: "Workout not found" }),
      });
    });

    await page.goto("/workouts/missing-workout");

    await expect(
      page.getByText(/워크아웃을 불러오는데 실패했습니다|Workout not found/),
    ).toBeVisible();
  });

  test("에러 fallback에서 홈으로 이동하면 새 라우트로 복구된다", async ({ page }) => {
    await page.route(`${API_BASE}/workouts/broken-workout`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ...mockWorkoutDetail,
          id: "broken-workout",
          user: undefined,
        }),
      });
    });

    await page.route(`${API_BASE}/workout-social/workout/broken-workout/comments*`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [], total: 0 }),
      });
    });

    await page.route(`${API_BASE}/feed/posts*`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ items: [], nextCursor: null, hasMore: false }),
      });
    });

    await page.route(`${API_BASE}/feed/workouts*`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ items: [], nextCursor: null, hasMore: false }),
      });
    });

    await page.goto("/workouts/broken-workout");

    await expect(page.getByText("문제가 발생했습니다")).toBeVisible();

    await page.getByRole("button", { name: "홈으로" }).click();

    await expect(page).toHaveURL(/\/feed$/);
    await expect(page.getByText("표시할 피드가 없습니다.")).toBeVisible();
    await expect(page.getByText("문제가 발생했습니다")).toHaveCount(0);
  });

  test("에러 fallback에서 브라우저 뒤로가기를 하면 이전 화면으로 복구된다", async ({ page }) => {
    await page.route(`${API_BASE}/feed/posts*`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ items: [], nextCursor: null, hasMore: false }),
      });
    });

    await page.route(`${API_BASE}/feed/workouts*`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ items: [], nextCursor: null, hasMore: false }),
      });
    });

    await page.route(`${API_BASE}/workouts/broken-workout-back`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ...mockWorkoutDetail,
          id: "broken-workout-back",
          user: undefined,
        }),
      });
    });

    await page.route(
      `${API_BASE}/workout-social/workout/broken-workout-back/comments*`,
      (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: [], total: 0 }),
        });
      },
    );

    await page.goto("/feed");
    await expect(page.getByText("표시할 피드가 없습니다.")).toBeVisible();

    await page.goto("/workouts/broken-workout-back");
    await expect(page.getByText("문제가 발생했습니다")).toBeVisible();

    await page.goBack();

    await expect(page).toHaveURL(/\/feed$/);
    await expect(page.getByText("표시할 피드가 없습니다.")).toBeVisible();
    await expect(page.getByText("문제가 발생했습니다")).toHaveCount(0);
  });
});
