import { expect, test } from "@playwright/test";

import { setupMockChatRealtime } from "./helpers/chat-realtime-mock";
import {
  buildActivityChatScenario,
  buildActivityConversationSummary,
  buildCrewChatScenario,
  buildCrewConversationSummary,
  buildDirectConversationScenario,
  setupMessagingRoutes,
} from "./helpers/messaging-fixtures";
import { mockUser, setupAuth } from "./helpers/mock-auth";

const directMessagesScenario = buildDirectConversationScenario();
const { conversationId } = directMessagesScenario;
const mixedHubScenario = buildDirectConversationScenario({
  conversations: [
    buildActivityConversationSummary(),
    buildCrewConversationSummary(),
    ...directMessagesScenario.conversationsResponse.data,
  ],
});
const API_BASE = "http://localhost:4000/api/v1";

test.describe("메시지 UX", () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await setupMessagingRoutes(page, { directMessages: directMessagesScenario });
  });

  test("메시지 화면에서는 헤더 unread 뱃지가 숨겨진다", async ({ page }) => {
    await page.goto("/messages");

    await expect(page.getByTestId("messages-panel-sidebar")).toBeVisible();
    await expect(page.getByTestId("messages-search-sidebar")).toBeVisible();
    await expect(page.locator('header a[href="/messages"]')).not.toContainText("3");
    await expect(page.getByTestId("messages-panel-sidebar").getByText("러닝메이트")).toBeVisible();
  });

  test("메시지 허브가 DM, 크루, 활동 방 이름을 구분해서 보여준다", async ({ page }) => {
    await setupMessagingRoutes(page, { directMessages: mixedHubScenario });

    await page.goto("/messages");

    const sidebar = page.getByTestId("messages-panel-sidebar");

    await expect(sidebar.getByText("월요일 아침 러닝")).toBeVisible();
    await expect(sidebar.getByText("서울 러닝 크루")).toHaveCount(2);
    await expect(sidebar.getByText("러닝메이트")).toBeVisible();
    await expect(sidebar.getByText("집합 장소를 다시 확인해주세요.")).toBeVisible();
    await expect(sidebar.getByText("크루 공지를 확인해주세요.")).toBeVisible();
  });

  test("메시지 허브 검색이 사용자와 그룹 방 이름을 모두 찾는다", async ({ page }) => {
    await setupMessagingRoutes(page, { directMessages: mixedHubScenario });

    await page.goto("/messages");

    const sidebar = page.getByTestId("messages-panel-sidebar");
    const searchInput = sidebar.getByTestId("messages-search-sidebar");

    await searchInput.fill("월요일");
    await expect(sidebar.getByText("월요일 아침 러닝")).toBeVisible();
    await expect(sidebar.getByText("러닝메이트")).toHaveCount(0);

    await searchInput.fill("러닝메이트");
    await expect(sidebar.getByText("러닝메이트")).toBeVisible();
    await expect(sidebar.getByText("월요일 아침 러닝")).toHaveCount(0);
  });

  test("메시지 허브의 그룹 방은 각 크루와 활동 화면으로 연결된다", async ({ page }) => {
    await setupMessagingRoutes(page, {
      activityChat: buildActivityChatScenario(),
      crewChat: buildCrewChatScenario(),
      directMessages: mixedHubScenario,
    });

    await page.goto("/messages");
    const sidebar = page.getByTestId("messages-panel-sidebar");

    await sidebar.getByTestId("conversation-row-conv-activity-1").click();
    await expect(page).toHaveURL(/\/crews\/crew-1\/activities\/activity-1\/chat$/);

    await page.goto("/messages");

    await sidebar.getByTestId("conversation-row-conv-crew-1").click();
    await expect(page).toHaveURL(/\/messages\/crew\/crew-1$/);
  });

  test("DM 전송 실패 시 draft를 유지하고 inline 오류를 보여준다", async ({ page }) => {
    const realtime = await setupMockChatRealtime(page);
    realtime.setSendError("메시지 전송에 실패했습니다.");

    await page.goto(`/messages/${conversationId}`);
    await realtime.waitForSubscription(conversationId);

    const textarea = page.getByPlaceholder("메시지를 입력하세요");
    await textarea.fill("답장 테스트");
    await page.getByRole("button", { name: "전송" }).click();

    await expect(textarea).toHaveValue("답장 테스트");
    await expect(page.getByText("메시지 전송에 실패했습니다.")).toBeVisible();
  });

  test("DM을 나간 뒤에도 프로필에서 다시 시작하면 빈 세션으로 열린다", async ({ page }) => {
    const hiddenDirectScenario = buildDirectConversationScenario({
      conversation: {
        id: "conv-direct-restart",
        messages: [],
        unreadCount: 0,
      },
      detailConversation: {
        id: "conv-direct-restart",
      },
      messages: [],
      conversations: [],
      unreadNotificationsCount: 0,
    });

    await setupMessagingRoutes(page, { directMessages: hiddenDirectScenario });
    await page.route(`${API_BASE}/profile/user-3`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          accessLevel: "FULL",
          user: {
            id: "user-3",
            email: "mate@example.com",
            name: "러닝메이트",
            profileImage: null,
            backgroundImage: null,
            bio: "같이 뛰어요",
            isPrivate: false,
          },
          stats: {
            postCount: 0,
            totalWorkouts: 0,
            totalDistance: 0,
            totalDuration: 0,
            averagePace: 0,
          },
          followersCount: 0,
          followingCount: 0,
          crewCount: 0,
          isFollowing: false,
          isPending: false,
          isPrivate: false,
        }),
      });
    });
    await page.route(`${API_BASE}/posts?userId=user-3&limit=12`, (route) => {
      route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    });
    await page.route(`${API_BASE}/crews?userId=user-3`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [] }),
      });
    });
    await page.route(`${API_BASE}/follow/status/user-3`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          isFollowing: false,
          isPending: false,
          isPrivate: false,
          followerPreview: [mockUser],
        }),
      });
    });

    await page.goto("/profile/user-3");
    await page.getByRole("button", { name: /메시지/i }).click();

    await expect(page).toHaveURL(/\/messages\/conv-direct-restart$/);
    await expect(page.getByPlaceholder("메시지를 입력하세요")).toBeVisible();
    await expect(page.getByText("오늘도 달리시나요?")).toHaveCount(0);
    await expect(page.getByText("대화를 찾을 수 없습니다")).toHaveCount(0);
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
    await expect(page.getByTestId("messages-panel").getByText("러닝메이트")).toBeVisible();
  });
});
