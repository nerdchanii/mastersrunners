import { test, expect } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const API_BASE = "http://localhost:4000/api/v1";

test.describe("파일 업로드 → 워크아웃 생성 E2E", () => {
  let accessToken: string;
  let refreshToken: string;

  test.beforeAll(async ({ request }) => {
    const res = await request.post(`${API_BASE}/auth/dev-login`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    accessToken = body.accessToken;
    refreshToken = body.refreshToken;
    expect(accessToken).toBeTruthy();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.evaluate(
      ({ at, rt }) => {
        window.localStorage.setItem("accessToken", at);
        window.localStorage.setItem("refreshToken", rt);
      },
      { at: accessToken, rt: refreshToken },
    );
  });

  test("FIT 파일 업로드 → 생성 → 상세 페이지에서 지도 표시", async ({ page }) => {
    await page.goto("/workouts/new");
    const fileSelectBtn = page.getByRole("button", { name: "파일 선택" });
    await expect(fileSelectBtn).toBeVisible();

    // Upload FIT file
    const fileInput = page.locator("input[type='file']");
    await fileInput.setInputFiles(path.resolve(__dirname, "../../../475463470588919809.fit"));

    // Wait for parse to complete
    await expect(page.getByText("분석 결과")).toBeVisible({ timeout: 30000 });
    await expect(page.getByText("저장됨")).toBeVisible();

    // Get the created workout ID from the API
    const workoutsRes = await page.request.get(`${API_BASE}/workouts`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const workouts = await workoutsRes.json();
    const latestWorkout = workouts[0];
    expect(latestWorkout).toBeTruthy();

    // Navigate to workout detail page
    await page.goto(`/workouts/detail?id=${latestWorkout.id}`);

    // Verify route map is displayed (Leaflet map container)
    await expect(page.locator(".leaflet-container")).toBeVisible({ timeout: 15000 });

    // Verify "경로" card header
    await expect(page.getByText("경로")).toBeVisible();
  });

  test("GPX 파일 업로드 → 생성 → 상세 페이지에서 지도 표시", async ({ page }) => {
    await page.goto("/workouts/new");
    const fileSelectBtn = page.getByRole("button", { name: "파일 선택" });
    await expect(fileSelectBtn).toBeVisible();

    // Upload GPX file
    const fileInput = page.locator("input[type='file']");
    await fileInput.setInputFiles(path.resolve(__dirname, "../../../475463470588919809.gpx"));

    await expect(page.getByText("분석 결과")).toBeVisible({ timeout: 30000 });
    await expect(page.getByText("저장됨")).toBeVisible();

    // Get created workout
    const workoutsRes = await page.request.get(`${API_BASE}/workouts`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const workouts = await workoutsRes.json();
    const latestWorkout = workouts[0];
    expect(latestWorkout).toBeTruthy();

    // Navigate to detail
    await page.goto(`/workouts/detail?id=${latestWorkout.id}`);

    // Verify route map
    await expect(page.locator(".leaflet-container")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("경로")).toBeVisible();
  });
});
