import { expect, test } from "@playwright/test";

import { setupAuth } from "./helpers/mock-auth";

const API_BASE = "http://localhost:4000/api/v1";

test.describe("게시글 텍스트 작성", () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);

    await page.route(`${API_BASE}/workouts`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });
  });

  test("텍스트 한 입력창에서 해시태그와 멘션을 추출하고 미리보기까지 유지한다", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/posts/new");

    await page.getByRole("button", { name: "워크아웃 없이 진행" }).click();
    await page.getByRole("button", { name: "사진 없이 진행" }).click();

    const textarea = page.getByLabel("텍스트 작성");
    await textarea.fill("오늘은 @러너김 과 함께 #한강 #10K 달렸어요");

    await expect(page.locator("input#hashtags")).toHaveCount(0);
    await expect(page.getByText("자동 인식된 태그")).toBeVisible();
    await expect(page.getByText("@러너김").first()).toBeVisible();
    await expect(page.getByText("#한강").first()).toBeVisible();
    await expect(page.getByText("#10K").first()).toBeVisible();

    await page.getByRole("button", { name: "미리보기" }).click();

    await expect(page.getByText("@러너김").first()).toBeVisible();
    await expect(page.getByText("#한강").first()).toBeVisible();
    await expect(page.getByText("#10K").first()).toBeVisible();
    await expect(page.getByText("오늘은 @러너김 과 함께 #한강 #10K 달렸어요")).toBeVisible();
  });
});
