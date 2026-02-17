import { test, expect } from "@playwright/test";
import { setupAuth, mockWorkoutDetail } from "./helpers/mock-auth";

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
    await page.route(`${API_BASE}/workout-social/workout/${mockWorkoutDetail.id}/comments*`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [], total: 0 }),
      });
    });
  });

  test("기본 정보가 표시된다 (거리, 시간, 페이스)", async ({ page }) => {
    await page.goto(`/workouts/detail?id=${mockWorkoutDetail.id}`);

    // 거리: "10.50 km" (StatItem)
    await expect(page.getByText(/10\.50.*km/)).toBeVisible();

    // 시간 label
    await expect(page.getByRole("paragraph").filter({ hasText: "시간" })).toBeVisible();

    // 페이스 label
    await expect(page.getByRole("paragraph").filter({ hasText: "페이스" })).toBeVisible();
  });

  test("워크아웃 타입과 신발 정보가 표시된다", async ({ page }) => {
    await page.goto(`/workouts/detail?id=${mockWorkoutDetail.id}`);

    await expect(page.getByText("달리기")).toBeVisible();
    await expect(page.getByText(/Nike.*Vaporfly 3/)).toBeVisible();
  });

  test("GPS 경로 지도가 표시된다", async ({ page }) => {
    await page.goto(`/workouts/detail?id=${mockWorkoutDetail.id}`);

    // Leaflet map container
    const mapContainer = page.locator(".leaflet-container");
    await expect(mapContainer).toBeVisible();
  });

  test("고도 차트가 표시된다", async ({ page }) => {
    await page.goto(`/workouts/detail?id=${mockWorkoutDetail.id}`);

    // CardTitle with Mountain icon + "고도"
    const elevationCard = page.locator("text=고도").first();
    await expect(elevationCard).toBeVisible();
  });

  test("심박수 차트가 표시된다", async ({ page }) => {
    await page.goto(`/workouts/detail?id=${mockWorkoutDetail.id}`);

    await expect(page.getByText("심박수").first()).toBeVisible();
  });

  test("메트릭 카드가 표시된다 (칼로리, 고도, 심박수, 케이던스)", async ({ page }) => {
    await page.goto(`/workouts/detail?id=${mockWorkoutDetail.id}`);

    // 칼로리
    await expect(page.getByText("680")).toBeVisible();

    // 고도상승
    await expect(page.getByText("125")).toBeVisible();
  });

  test("랩 테이블이 표시된다", async ({ page }) => {
    await page.goto(`/workouts/detail?id=${mockWorkoutDetail.id}`);

    // 랩 수 확인 (5개 랩)
    const lapRows = page.locator("table tbody tr");
    await expect(lapRows).toHaveCount(5);
  });

  test("소스 파일 정보가 표시된다 (FIT 배지)", async ({ page }) => {
    await page.goto(`/workouts/detail?id=${mockWorkoutDetail.id}`);

    // FIT badge (exact match to avoid matching 'morning_run.fit')
    await expect(page.getByText("FIT", { exact: true })).toBeVisible();
    // filename
    await expect(page.getByText("morning_run.fit")).toBeVisible();
  });

  test("메모가 표시된다", async ({ page }) => {
    await page.goto(`/workouts/detail?id=${mockWorkoutDetail.id}`);

    await expect(page.getByText(mockWorkoutDetail.memo!)).toBeVisible();
  });

  test("소유자에게 삭제 버튼이 표시된다", async ({ page }) => {
    await page.goto(`/workouts/detail?id=${mockWorkoutDetail.id}`);

    await expect(page.getByRole("button", { name: /삭제/ })).toBeVisible();
  });

  test("워크아웃 ID가 없으면 안내 메시지가 표시된다", async ({ page }) => {
    await page.goto("/workouts/detail");

    await expect(page.getByText("워크아웃 ID가 필요합니다")).toBeVisible();
  });
});
