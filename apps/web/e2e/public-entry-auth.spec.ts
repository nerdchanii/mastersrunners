import { expect, test } from "@playwright/test";

import { setupGuestPublicEntry } from "./helpers/public-entry-fixtures";

const API_BASE = "http://localhost:4000/api/v1";

test.describe("public entry auth recovery", () => {
  test.beforeEach(async ({ page }) => {
    await setupGuestPublicEntry(page);
  });

  test("feed에서 crews로 이동한 뒤 뒤로가기가 다시 feed로 돌아온다", async ({ page }) => {
    await page.goto("/feed");

    await expect(
      page.getByText("한강 반대편 둔치. 가볍게 시작하면 템포는 따라붙는다."),
    ).toBeVisible();
    await expect(page.getByText("오늘은 천천히, 내일은 더 강하게.")).toBeVisible();
    await expect(page.getByRole("link", { name: "내 기록", exact: true })).toHaveCount(0);

    await page.getByRole("link", { name: "크루", exact: true }).click();
    await expect(page).toHaveURL(/\/crews$/);
    await expect(page.getByText("한강 러너스")).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/\/feed$/);
    await expect(
      page.getByText("한강 반대편 둔치. 가볍게 시작하면 템포는 따라붙는다."),
    ).toBeVisible();
  });

  test("공개 게시글의 훈련 preview는 guest에서 로그인 모달을 띄우고 URL을 유지한다", async ({
    page,
  }) => {
    await page.goto("/posts/post-1");

    await page.getByTestId("post-workout-preview-workout-1").click();

    await expect(page).toHaveURL(/\/posts\/post-1$/);
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("dialog").getByText("훈련 리포트 보기")).toBeVisible();
  });

  test("공개 crews에서 내 크루는 로그인 모달로 막고 URL은 유지한다", async ({ page }) => {
    await page.goto("/crews");

    await page.getByRole("tab", { name: "내 크루" }).click();

    await expect(page).toHaveURL(/\/crews$/);
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("dialog").getByText("내 크루 보기")).toBeVisible();
  });

  test("공개 post detail은 직접 접근되고 좋아요/댓글은 로그인 모달을 띄운다", async ({ page }) => {
    await page.goto("/posts/post-1");

    await expect(page).toHaveURL(/\/posts\/post-1$/);
    await expect(page.getByTestId("post-detail-document")).toBeVisible();

    await page.getByRole("button", { name: "좋아요" }).click();
    await expect(page).toHaveURL(/\/posts\/post-1$/);
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("dialog").getByText("좋아요 남기기")).toBeVisible();

    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "답글 달기" }).click();
    await expect(page).toHaveURL(/\/posts\/post-1$/);
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("dialog").getByText("댓글 남기기")).toBeVisible();
  });

  test("공개 crew detail의 가입과 활동 진입은 로그인 모달을 띄운다", async ({ page }) => {
    await page.goto("/crews/crew-1");

    await expect(page.getByText("한강 러너스")).toBeVisible();

    await page.getByRole("button", { name: "크루 가입" }).click();
    await expect(page).toHaveURL(/\/crews\/crew-1$/);
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("dialog").getByText("크루 참여")).toBeVisible();

    await page.keyboard.press("Escape");
    await page.getByText("토요일 한강 10K").click();

    await expect(page).toHaveURL(/\/crews\/crew-1$/);
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("invite 진입의 로그인 모달은 원래 crew invite URL을 next로 보존한다", async ({ page }) => {
    await page.goto("/crews/crew-1?invite=1");

    await page.getByRole("button", { name: "크루 가입" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("link", { name: "로그인" })).toHaveAttribute(
      "href",
      "/login?intent=login&next=%2Fcrews%2Fcrew-1%3Finvite%3D1",
    );
  });

  test("공개 프로필은 익명으로 읽히고 팔로우와 메시지는 로그인 모달로 막는다", async ({ page }) => {
    await page.goto("/profile/user-2");

    await expect(page.getByRole("heading", { name: "공개러너" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "게시글" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "워크아웃" })).toHaveCount(0);

    await page.getByRole("button", { name: "팔로우" }).click();
    await expect(page).toHaveURL(/\/profile\/user-2$/);
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("dialog").getByText("팔로우")).toBeVisible();

    await page.goto("/profile/user-2");
    await page.getByRole("button", { name: "메시지" }).click();
    await expect(page).toHaveURL(/\/profile\/user-2$/);
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("dialog").getByText("메시지 보내기")).toBeVisible();
  });

  test("protected deep link는 로그인 화면으로 가되 next 경로를 보존한다", async ({ page }) => {
    await page.goto("/crews/crew-1/activities/activity-1");

    await expect(page).toHaveURL(
      /\/login\?intent=login&next=%2Fcrews%2Fcrew-1%2Factivities%2Factivity-1$/,
    );
  });

  test("공개 post 댓글 로딩 실패는 auth wall이 아니라 generic error로 보인다", async ({ page }) => {
    await page.route(`${API_BASE}/posts/post-1/comments?limit=50`, (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "server error" }),
      });
    });

    await page.goto("/posts/post-1");

    await expect(
      page.getByText("댓글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."),
    ).toBeVisible();
    await expect(page.getByText("댓글은 로그인 뒤에 이어서 볼 수 있습니다.")).toHaveCount(0);
  });
});
