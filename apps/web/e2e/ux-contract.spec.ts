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
    await expect(page.getByRole("button", { name: "공유" })).toHaveCount(0);
  });

  test("guest preview tag는 죽은 링크가 아니라 제자리 인증 게이트로 이어진다", async ({ page }) => {
    await page.goto("/feed");

    await page.getByRole("button", { name: "조깅 태그 더 보기" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page).toHaveURL(/\/feed$/);
  });

  test("guest preview의 참여 액션은 제자리 auth gate로 열리고 Back으로 순서대로 닫힌다", async ({
    page,
  }) => {
    await page.goto("/feed");

    await page.getByRole("button", { name: "좋아요" }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("dialog").getByText("좋아요 남기기")).toBeVisible();
    await expect(page).toHaveURL(/\/feed$/);

    await page.goBack();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page).toHaveURL(/\/feed$/);

    await page.getByRole("button", { name: "댓글 남기기" }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("dialog").getByText("댓글 남기기")).toBeVisible();

    await page.goBack();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page).toHaveURL(/\/feed$/);
  });

  test("guest auth dialog는 브라우저 Back으로 먼저 닫히고 그 다음에 underlying route를 떠난다", async ({
    page,
  }) => {
    await page.goto("/feed");
    await page.goto("/posts/post-1");

    await page.getByRole("button", { name: "좋아요" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page).toHaveURL(/\/posts\/post-1$/);

    await page.goBack();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page).toHaveURL(/\/posts\/post-1$/);

    await page.goBack();
    await expect(page).toHaveURL(/\/feed$/);
    await expect(
      page.getByText("한강 반대편 둔치. 가볍게 시작하면 템포는 따라붙는다."),
    ).toBeVisible();
  });

  test("guest auth dialog CTA는 synthetic history를 남기지 않고 이전 route 맥락으로 돌아간다", async ({
    page,
  }) => {
    await page.goto("/feed");
    await page.goto("/posts/post-1");

    await page.getByRole("button", { name: "좋아요" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.getByRole("link", { name: "로그인" }).click();
    await expect(page).toHaveURL(/\/login\?intent=login&next=%2Fposts%2Fpost-1$/);

    await page.goBack();
    await expect(page).toHaveURL(/\/posts\/post-1$/);

    await page.goBack();
    await expect(page).toHaveURL(/\/feed$/);
  });
});
