import type { Page, WebSocketRoute } from "@playwright/test";

interface MockRealtimeMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  deletedAt: string | null;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    profileImage: string | null;
  };
}

export async function setupMockChatRealtime(page: Page) {
  const sockets = new Set<WebSocketRoute>();
  const subscribedConversationIds = new Set<string>();
  let sendBehavior: { kind: "success" } | { kind: "error"; message: string } = { kind: "success" };

  await page.routeWebSocket(/\/api\/v1\/socket\.io\/\?EIO=4&transport=websocket/, async (ws) => {
    sockets.add(ws);

    ws.send(
      '0{"sid":"playwright-socket","upgrades":[],"pingInterval":25000,"pingTimeout":20000,"maxPayload":1000000}',
    );

    ws.onMessage((message) => {
      const text = typeof message === "string" ? message : message.toString("utf8");

      if (text === "2") {
        ws.send("3");
        return;
      }

      if (text.startsWith("40/conversations")) {
        ws.send('40/conversations,{"sid":"playwright-namespace"}');
        return;
      }

      const eventMatch = text.match(/^42\/conversations,(\d*)(\[.*\])$/);
      if (eventMatch) {
        const [, ackId, payloadText] = eventMatch;
        const payload = JSON.parse(payloadText) as [string, { conversationId?: string }];
        const [event, data] = payload;
        if (event === "chat:subscribe" && data?.conversationId) {
          subscribedConversationIds.add(data.conversationId);
        }
        if (event === "chat:unsubscribe" && data?.conversationId) {
          subscribedConversationIds.delete(data.conversationId);
        }
        if (event === "chat:send") {
          const { content, conversationId } = data as {
            content?: string;
            conversationId?: string;
          };
          if (sendBehavior.kind === "error") {
            ws.send(
              `43/conversations,${ackId}${JSON.stringify([{ error: sendBehavior.message }])}`,
            );
            return;
          }

          const now = new Date().toISOString();
          const message = {
            id: `mock-sent-${Date.now()}`,
            conversationId: conversationId ?? "",
            senderId: "test-user-1",
            sender: {
              id: "test-user-1",
              name: "테스트러너",
              profileImage: null,
            },
            content: content ?? "",
            createdAt: now,
            deletedAt: null,
          };
          ws.send(`43/conversations,${ackId}${JSON.stringify([message])}`);
          ws.send(`42/conversations,${JSON.stringify(["chat:message", message])}`);
        }
      }
    });

    ws.onClose(() => {
      sockets.delete(ws);
    });
  });

  return {
    async waitForSocketConnection(timeoutMs = 5000) {
      const startedAt = Date.now();
      while (Date.now() - startedAt < timeoutMs) {
        if (sockets.size > 0) {
          return;
        }
        await page.waitForTimeout(50);
      }
      throw new Error("Timed out waiting for websocket connection");
    },
    async waitForSubscription(conversationId: string, timeoutMs = 5000) {
      const startedAt = Date.now();
      while (Date.now() - startedAt < timeoutMs) {
        if (subscribedConversationIds.has(conversationId)) {
          return;
        }
        await page.waitForTimeout(50);
      }
      throw new Error(`Timed out waiting for subscription: ${conversationId}`);
    },
    async emitChatMessage(message: MockRealtimeMessage) {
      const payload = `42/conversations,${JSON.stringify(["chat:message", message])}`;
      await Promise.all([...sockets].map((socket) => socket.send(payload)));
    },
    setSendError(message: string) {
      sendBehavior = { kind: "error", message };
    },
  };
}
