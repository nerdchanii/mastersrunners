import { expect, test } from "@playwright/test";

import { setupGuestPublicEntry } from "./helpers/public-entry-fixtures";

test.describe("ux contract", () => {
  test.beforeEach(async ({ page }) => {
    await setupGuestPublicEntry(page);
  });

  test("guest feed는 샘플/설명형 라벨 없이 실제 제품처럼 보인다", async ({ page }) => {
    await page.goto("/feed");

    await expect(
      page.getByText("한강 반대편 둔치. 가볍게 시작하면 템포는 따라붙는다."),
    ).toBeVisible();
    await expect(page.getByText("샘플 공개 피드")).toHaveCount(0);
    await expect(page.getByText(/공개 샘플 게시글/)).toHaveCount(0);
    await expect(page.getByText("먼저 둘러보세요")).toHaveCount(0);
  });

  test("guest auth dialog는 닫으면 현재 route를 유지하고 Back 이후에도 맥락이 남는다", async ({
    page,
  }) => {
    await page.goto("/feed");
    await page.goto("/posts/post-1");

    await page.getByRole("button", { name: "좋아요" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page).toHaveURL(/\/posts\/post-1$/);

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page).toHaveURL(/\/posts\/post-1$/);

    await page.goBack();
    await expect(page).toHaveURL(/\/feed$/);
    await expect(
      page.getByText("한강 반대편 둔치. 가볍게 시작하면 템포는 따라붙는다."),
    ).toBeVisible();
  });
});
