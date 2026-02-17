import { test, expect } from "@playwright/test";

test("홈페이지 로드", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/마스터즈 러너스|Masters Runners/i);
});
