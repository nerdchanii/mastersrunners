import { expect, test } from "@playwright/test";

import { setupMockChatRealtime } from "./helpers/chat-realtime-mock";
import {
  buildCrewChatScenario,
  buildDirectConversationScenario,
  setupMessagingRoutes,
} from "./helpers/messaging-fixtures";
import { mockUser, setupAuth } from "./helpers/mock-auth";

function buildMessageWindow(
  conversationId: string,
  totalCount: number,
  firstUnreadIndex: number | null,
) {
  return Array.from({ length: totalCount }, (_, index) => {
    const ordinal = index + 1;
    const isOwn = ordinal % 3 === 0;

    return {
      id: `msg-${ordinal}`,
      conversationId,
      senderId: isOwn ? mockUser.id : "user-3",
      sender: {
        id: isOwn ? mockUser.id : "user-3",
        name: isOwn ? mockUser.name : "러닝메이트",
        profileImage: null,
      },
      content:
        firstUnreadIndex !== null && ordinal === firstUnreadIndex
          ? `안 읽은 메시지 ${ordinal}`
          : `메시지 ${ordinal}`,
      createdAt: new Date(Date.UTC(2026, 1, 20, 10, ordinal)).toISOString(),
      deletedAt: null,
    };
  });
}

test.describe("채팅 windowing + realtime", () => {
  test("unread가 있으면 unread divider와 first unread anchor 근처에서 시작한다", async ({
    page,
  }) => {
    const scenario = buildDirectConversationScenario();
    const messages = buildMessageWindow(scenario.conversationId, 80, 41);

    scenario.conversationDetailResponse.messages = messages;
    scenario.conversationDetailResponse.firstUnreadMessageId = "msg-41";
    scenario.conversationDetailResponse.olderCursor = "msg-1";
    scenario.conversationDetailResponse.newerCursor = null;

    await setupAuth(page);
    await setupMessagingRoutes(page, { directMessages: scenario });

    await page.goto(`/messages/${scenario.conversationId}`);

    await expect(page.getByText("안 읽은 메시지", { exact: true })).toBeVisible();
    await expect(page.getByText("안 읽은 메시지 41")).toBeVisible();
  });

  test("unread가 없으면 pending indicator 없이 최신 메시지 근처에서 안정적으로 시작한다", async ({
    page,
  }) => {
    const scenario = buildDirectConversationScenario();
    const messages = buildMessageWindow(scenario.conversationId, 12, null);

    scenario.conversationDetailResponse.messages = messages;
    scenario.conversationDetailResponse.firstUnreadMessageId = null;
    scenario.conversationDetailResponse.olderCursor = null;
    scenario.conversationDetailResponse.newerCursor = null;

    await setupAuth(page);
    await setupMessagingRoutes(page, { directMessages: scenario });

    await page.goto(`/messages/${scenario.conversationId}`);

    await expect(page.getByText("안 읽은 메시지")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /새 메시지|다음 메시지 보기/ })).toHaveCount(0);
    await expect(page.getByText("메시지 12")).toBeVisible();
  });

  test("방 안에서 메시지를 보내면 한 번만 보이고 입력창은 비워진다", async ({ page }) => {
    const scenario = buildDirectConversationScenario();
    const realtime = await setupMockChatRealtime(page);

    await setupAuth(page);
    await setupMessagingRoutes(page, { directMessages: scenario });

    await page.goto(`/messages/${scenario.conversationId}`);
    await realtime.waitForSubscription(scenario.conversationId);

    const textarea = page.getByPlaceholder("메시지를 입력하세요");
    await textarea.fill("답장 테스트");
    await page.getByRole("button", { name: "전송" }).click();

    await expect(textarea).toHaveValue("");
    await expect(page.locator("[data-message-id]").filter({ hasText: "답장 테스트" })).toHaveCount(
      1,
    );
  });

  test("방 안에서 바닥 근처에 있을 때 새 메시지가 오면 바로 append된다", async ({ page }) => {
    const realtime = await setupMockChatRealtime(page);
    const scenario = buildCrewChatScenario();

    await setupAuth(page);
    await setupMessagingRoutes(page, { crewChat: scenario });

    await page.goto(`/messages/crew/${scenario.crewId}`);
    await realtime.waitForSubscription(scenario.chatResponse.conversation.id);

    await realtime.emitChatMessage({
      id: "msg-live-bottom",
      conversationId: scenario.chatResponse.conversation.id,
      senderId: "user-2",
      sender: {
        id: "user-2",
        name: "러닝맨",
        profileImage: null,
      },
      content: "실시간 새 메시지",
      createdAt: "2026-02-19T10:20:00.000Z",
      deletedAt: null,
    });

    await expect(page.getByText("실시간 새 메시지")).toBeVisible();
    await expect(page.getByRole("button", { name: /새 메시지|다음 메시지 보기/ })).toHaveCount(0);
  });

  test("방 안에서 위를 읽고 있을 때 새 메시지가 오면 자동 점프하지 않고 indicator로 대기한다", async ({
    page,
  }) => {
    const realtime = await setupMockChatRealtime(page);
    const scenario = buildCrewChatScenario({
      messages: buildMessageWindow("conv-crew-1", 60, null).map((message) => ({
        ...message,
        conversationId: "conv-crew-1",
      })),
    });

    await setupAuth(page);
    await setupMessagingRoutes(page, { crewChat: scenario });

    await page.goto(`/messages/crew/${scenario.crewId}`);
    await realtime.waitForSubscription(scenario.chatResponse.conversation.id);

    await page
      .locator("section.relative")
      .first()
      .evaluate((node) => {
        const viewport = node.querySelector("div.overflow-y-auto");
        if (viewport instanceof HTMLDivElement) {
          viewport.scrollTop = 0;
          viewport.dispatchEvent(new Event("scroll"));
        }
      });

    await realtime.emitChatMessage({
      id: "msg-live-pending",
      conversationId: scenario.chatResponse.conversation.id,
      senderId: "user-2",
      sender: {
        id: "user-2",
        name: "러닝맨",
        profileImage: null,
      },
      content: "바닥 밖 신규 메시지",
      createdAt: "2026-02-19T11:20:00.000Z",
      deletedAt: null,
    });

    await expect(
      page.getByRole("button", { name: /새 메시지 1개|다음 메시지 보기/ }),
    ).toBeVisible();
    await expect(page.getByText("바닥 밖 신규 메시지")).toHaveCount(0);

    await page.getByRole("button", { name: /새 메시지 1개|다음 메시지 보기/ }).click();

    await expect(page.getByText("바닥 밖 신규 메시지")).toBeVisible();
  });

  test("방 밖 메시지 허브에서도 새 메시지를 받으면 목록 preview가 갱신된다", async ({ page }) => {
    const realtime = await setupMockChatRealtime(page);
    const scenario = buildDirectConversationScenario();

    await setupAuth(page);
    await setupMessagingRoutes(page, { directMessages: scenario });

    await page.goto("/messages");
    await realtime.waitForSocketConnection();
    await expect(
      page.getByTestId("messages-panel-sidebar").getByText("오늘도 달리시나요?"),
    ).toBeVisible();

    scenario.conversationsResponse.data[0] = {
      ...scenario.conversationsResponse.data[0],
      unreadCount: 4,
      updatedAt: "2026-02-20T10:45:00.000Z",
      messages: [
        {
          id: "msg-last-updated",
          senderId: "user-3",
          content: "허브에서도 바로 보여야 해요",
          createdAt: "2026-02-20T10:45:00.000Z",
        },
      ],
    };

    await realtime.emitChatMessage({
      id: "msg-last-updated",
      conversationId: scenario.conversationId,
      senderId: "user-3",
      sender: {
        id: "user-3",
        name: "러닝메이트",
        profileImage: null,
      },
      content: "허브에서도 바로 보여야 해요",
      createdAt: "2026-02-20T10:45:00.000Z",
      deletedAt: null,
    });

    await expect(
      page.getByTestId("messages-panel-sidebar").getByText("허브에서도 바로 보여야 해요"),
    ).toBeVisible();
  });
});
