import { expect, test } from "@playwright/test";

import { setupMockChatRealtime } from "./helpers/chat-realtime-mock";
import {
  buildActivity,
  buildActivityChatScenario,
  buildCrewChatScenario,
  setupMessagingRoutes,
} from "./helpers/messaging-fixtures";
import { setupAuth } from "./helpers/mock-auth";

const crewChatScenario = buildCrewChatScenario();
const activityChatScenario = buildActivityChatScenario();
const { activityId: mockActivityId, crewId: mockCrewId } = activityChatScenario;
const mockConversationId = crewChatScenario.chatResponse.conversation.id;

test.describe("크루 그룹 채팅", () => {
  test.describe("크루 대화 진입", () => {
    test.beforeEach(async ({ page }) => {
      await setupAuth(page);
      await setupMessagingRoutes(page, { crewChat: crewChatScenario });
    });

    test("크루 상세에서 대화 아이콘이 보인다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}`);

      await expect(page.getByRole("link", { name: "크루 채팅 열기" })).toBeVisible();
    });

    test("아이콘을 누르면 크루 대화로 이동한다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}`);

      await page.getByRole("link", { name: "크루 채팅 열기" }).click();

      await expect(page).toHaveURL(`/messages/crew/${mockCrewId}`);
      await expect(page.getByText("안녕하세요, 러닝 크루 채팅방입니다!")).toBeVisible();
      await expect(page.getByText("내일 공원에서 만나요!")).toBeVisible();
    });

    test("참여자 수가 표시된다", async ({ page }) => {
      await page.goto(`/messages/crew/${mockCrewId}`);

      await expect(page.getByText("서울 러닝 크루")).toBeVisible();
      await expect(page.getByText("2명")).toBeVisible();
    });

    test("메시지 입력 필드와 전송 버튼이 있다", async ({ page }) => {
      await page.goto(`/messages/crew/${mockCrewId}`);

      await expect(page.getByPlaceholder("메시지를 입력하세요")).toBeVisible();
    });

    test("전송 실패 시 draft를 유지하고 오류를 보여준다", async ({ page }) => {
      const realtime = await setupMockChatRealtime(page);
      realtime.setSendError("메시지를 보내지 못했습니다.");

      await page.goto(`/messages/crew/${mockCrewId}`);
      await realtime.waitForSubscription(mockConversationId);

      const textarea = page.getByPlaceholder("메시지를 입력하세요");
      await textarea.fill("테스트 메시지");
      await textarea
        .locator("xpath=ancestor::div[contains(@class,'flex items-end gap-2')]//button")
        .click();

      await expect(textarea).toHaveValue("테스트 메시지");
      await expect(page.getByText("메시지를 보내지 못했습니다.").first()).toBeVisible();
    });
  });

  test.describe("활동 채팅 링크", () => {
    test.beforeEach(async ({ page }) => {
      await setupAuth(page);
      await setupMessagingRoutes(page, { activityChat: activityChatScenario });
    });

    test("RSVP 참석자에게 활동 채팅방 링크가 표시된다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}/activities/${mockActivityId}`);

      await expect(page.getByRole("button", { name: /^대화$/ })).toBeVisible();
    });
  });

  test.describe("활동 채팅 페이지", () => {
    test.beforeEach(async ({ page }) => {
      await setupAuth(page);
      await setupMessagingRoutes(page, { activityChat: activityChatScenario });
    });

    test("활동 채팅 페이지가 표시된다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}/activities/${mockActivityId}/chat`);

      await expect(page.getByRole("heading", { name: "월요일 아침 러닝" })).toBeVisible();
      await expect(page.getByText("서울 러닝 크루")).toBeVisible();
    });

    test("빈 채팅방에 안내 메시지가 표시된다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}/activities/${mockActivityId}/chat`);

      await expect(page.getByText("아직 대화가 없습니다.")).toBeVisible();
    });

    test("참석하지 않은 사용자는 설명 카드만 본다", async ({ page }) => {
      await setupMessagingRoutes(page, {
        activityChat: buildActivityChatScenario({
          activity: buildActivity({ attendances: [] }),
        }),
      });

      await page.goto(`/crews/${mockCrewId}/activities/${mockActivityId}/chat`);

      await expect(page.getByText("참석 후 대화를 볼 수 있습니다.")).toBeVisible();
      await expect(page.getByPlaceholder("메시지를 입력하세요")).toHaveCount(0);
    });
  });
});
