import { expect, test } from "@playwright/test";

import {
  API_BASE,
  buildActivityChatScenario,
  buildActivityConversationSummary,
  buildCrewChatScenario,
  buildCrewConversationSummary,
  buildDirectConversationScenario,
  setupMessagingRoutes,
} from "./helpers/messaging-fixtures";
import { setupAuth } from "./helpers/mock-auth";

const directMessagesScenario = buildDirectConversationScenario();
const { conversationId } = directMessagesScenario;
const mixedHubScenario = buildDirectConversationScenario({
  conversations: [
    buildActivityConversationSummary(),
    buildCrewConversationSummary(),
    ...directMessagesScenario.conversationsResponse.data,
  ],
});

test.describe("메시지 UX", () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await setupMessagingRoutes(page, { directMessages: directMessagesScenario });
  });

  test("메시지 화면에서는 헤더 unread 뱃지가 숨겨진다", async ({ page }) => {
    await page.goto("/messages");

    await expect(page.getByRole("heading", { name: "메시지" })).toBeVisible();
    await expect(page.locator('header a[href="/messages"]')).not.toContainText("3");
    await expect(page.getByText("러닝메이트")).toBeVisible();
  });

  test("메시지 허브가 DM, 크루, 활동 방 이름을 구분해서 보여준다", async ({ page }) => {
    await setupMessagingRoutes(page, { directMessages: mixedHubScenario });

    await page.goto("/messages");

    await expect(page.getByText("서울 러닝 크루 / 월요일 아침 러닝")).toBeVisible();
    await expect(page.getByText("서울 러닝 크루", { exact: true })).toBeVisible();
    await expect(page.getByText("러닝메이트")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /서울 러닝 크루 \/ 월요일 아침 러닝.*활동 채팅/ }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /서울 러닝 크루.*크루 단체톡/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /러닝메이트.*1:1 메시지/ })).toBeVisible();
  });

  test("메시지 허브 검색이 사용자와 그룹 방 이름을 모두 찾는다", async ({ page }) => {
    await setupMessagingRoutes(page, { directMessages: mixedHubScenario });

    await page.goto("/messages");

    const searchInput = page.getByPlaceholder("이름, 크루명, 활동명으로 찾기");

    await searchInput.fill("월요일");
    await expect(page.getByText("서울 러닝 크루 / 월요일 아침 러닝")).toBeVisible();
    await expect(page.getByText("러닝메이트")).toHaveCount(0);

    await searchInput.fill("러닝메이트");
    await expect(page.getByText("러닝메이트")).toBeVisible();
    await expect(page.getByText("서울 러닝 크루 / 월요일 아침 러닝")).toHaveCount(0);
  });

  test("메시지 허브의 그룹 방은 각 크루와 활동 화면으로 연결된다", async ({ page }) => {
    await setupMessagingRoutes(page, {
      activityChat: buildActivityChatScenario(),
      crewChat: buildCrewChatScenario(),
      directMessages: mixedHubScenario,
    });

    await page.goto("/messages");

    await page
      .getByRole("button", { name: /서울 러닝 크루 \/ 월요일 아침 러닝.*활동 채팅/ })
      .click();
    await expect(page).toHaveURL(/\/crews\/crew-1\/activities\/activity-1\/chat$/);

    await page.goto("/messages");

    await page.getByRole("button", { name: /서울 러닝 크루.*크루 단체톡/ }).click();
    await expect(page).toHaveURL(/\/crews\/crew-1$/);
  });

  test("DM 전송 실패 시 draft를 유지하고 inline 오류를 보여준다", async ({ page }) => {
    await page.route(`${API_BASE}/conversations/${conversationId}/messages`, (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "메시지 전송에 실패했습니다." }),
      });
    });

    await page.goto(`/messages/${conversationId}`);

    const textarea = page.getByPlaceholder("메시지를 입력하세요 (Shift+Enter로 줄바꿈)");
    await textarea.fill("답장 테스트");
    await page.getByRole("button", { name: "전송" }).click();

    await expect(textarea).toHaveValue("답장 테스트");
    await expect(page.getByText("메시지 전송에 실패했습니다.")).toBeVisible();
  });
});

test.describe("메시지 UX 모바일", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await setupMessagingRoutes(page, { directMessages: directMessagesScenario });
  });

  test("메시지 화면에서는 하단 네비 unread 뱃지가 숨겨진다", async ({ page }) => {
    await page.goto("/messages");

    await expect(page.locator('nav.fixed a[href="/messages"]')).not.toContainText("3");
    await expect(page.getByText("러닝메이트")).toBeVisible();
  });
});
