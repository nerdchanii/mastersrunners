import { test, expect } from "@playwright/test";
import { setupAuth } from "./helpers/mock-auth";

const API_BASE = "http://localhost:4000/api/v1";

test.describe("워크아웃 업로드 미리보기", () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);

    // Mock workout types
    await page.route(`${API_BASE}/workout-types`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { id: "wt-1", name: "달리기", category: "RUNNING" },
          { id: "wt-2", name: "트레일 러닝", category: "RUNNING" },
        ]),
      });
    });

    // Mock shoes
    await page.route(`${API_BASE}/shoes`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [] }),
      });
    });
  });

  test("새 워크아웃 페이지가 로드된다", async ({ page }) => {
    await page.goto("/workouts/new");
    await expect(page.getByText(/워크아웃|기록 추가|새 운동/i)).toBeVisible();
  });

  test("파일 업로드 영역이 존재한다", async ({ page }) => {
    await page.goto("/workouts/new");

    // 파일 input 확인
    const fileInput = page.locator("input[type='file']");
    await expect(fileInput.first()).toBeAttached();
  });
});
