import { expect, test } from "@playwright/test";

import {
  API_BASE,
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
  test.describe("크루 채팅 탭", () => {
    test.beforeEach(async ({ page }) => {
      await setupAuth(page);
      await setupMessagingRoutes(page, { crewChat: crewChatScenario });
    });

    test("채팅 탭이 멤버에게 표시된다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}`);

      await expect(page.getByRole("tab", { name: "채팅" })).toBeVisible();
    });

    test("채팅 탭에서 메시지가 표시된다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}`);

      await page.getByRole("tab", { name: "채팅" }).click();

      await expect(page.getByText("안녕하세요, 러닝 크루 채팅방입니다!")).toBeVisible();
      await expect(page.getByText("내일 공원에서 만나요!")).toBeVisible();
    });

    test("참여자 수가 표시된다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}`);

      await page.getByRole("tab", { name: "채팅" }).click();

      await expect(page.getByText("서울 러닝 크루 크루 채팅")).toBeVisible();
      await expect(page.getByText("(2명)")).toBeVisible();
    });

    test("메시지 입력 필드와 전송 버튼이 있다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}`);

      await page.getByRole("tab", { name: "채팅" }).click();

      await expect(page.getByPlaceholder("서울 러닝 크루 크루에 메시지 보내기")).toBeVisible();
    });

    test("전송 실패 시 draft를 유지하고 오류를 보여준다", async ({ page }) => {
      await page.route(`${API_BASE}/conversations/${mockConversationId}/messages`, (route) => {
        route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ message: "메시지 전송에 실패했습니다." }),
        });
      });

      await page.goto(`/crews/${mockCrewId}`);
      await page.getByRole("tab", { name: "채팅" }).click();

      const textarea = page.getByPlaceholder("서울 러닝 크루 크루에 메시지 보내기");
      await textarea.fill("테스트 메시지");
      await page
        .getByRole("button")
        .filter({ has: page.locator("svg") })
        .last()
        .click();

      await expect(textarea).toHaveValue("테스트 메시지");
      await expect(page.getByText("메시지 전송에 실패했습니다.").first()).toBeVisible();
    });
  });

  test.describe("활동 채팅 링크", () => {
    test.beforeEach(async ({ page }) => {
      await setupAuth(page);
      await setupMessagingRoutes(page, { activityChat: activityChatScenario });
    });

    test("RSVP 참석자에게 활동 채팅방 링크가 표시된다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}/activities/${mockActivityId}`);

      await expect(page.getByRole("button", { name: /활동 채팅방/ })).toBeVisible();
    });
  });

  test.describe("활동 채팅 페이지", () => {
    test.beforeEach(async ({ page }) => {
      await setupAuth(page);
      await setupMessagingRoutes(page, { activityChat: activityChatScenario });
    });

    test("활동 채팅 페이지가 표시된다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}/activities/${mockActivityId}/chat`);

      await expect(page.getByRole("heading", { name: "월요일 아침 러닝 활동 채팅" })).toBeVisible();
    });

    test("빈 채팅방에 안내 메시지가 표시된다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}/activities/${mockActivityId}/chat`);

      await expect(page.getByText("월요일 아침 러닝 활동에 첫 메시지를 남겨보세요.")).toBeVisible();
    });

    test("참석하지 않은 사용자는 설명 카드만 본다", async ({ page }) => {
      await setupMessagingRoutes(page, {
        activityChat: buildActivityChatScenario({
          activity: buildActivity({ attendances: [] }),
        }),
      });

      await page.goto(`/crews/${mockCrewId}/activities/${mockActivityId}/chat`);

      await expect(
        page.getByText("이 활동 채팅은 참석 신청 또는 체크인 후 사용할 수 있습니다."),
      ).toBeVisible();
      await expect(page.getByPlaceholder("월요일 아침 러닝 활동에 메시지 보내기")).toHaveCount(0);
    });
  });
});
