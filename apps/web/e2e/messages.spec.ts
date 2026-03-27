import { expect, test } from "@playwright/test";

import {
  API_BASE,
  buildDirectConversationScenario,
  setupMessagingRoutes,
} from "./helpers/messaging-fixtures";
import { setupAuth } from "./helpers/mock-auth";

const directMessagesScenario = buildDirectConversationScenario();
const { conversationId } = directMessagesScenario;

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
