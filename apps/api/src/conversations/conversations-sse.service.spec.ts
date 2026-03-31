import { MessageEvent } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

import { ConversationsSseService } from "./conversations-sse.service.js";

describe("ConversationsSseService", () => {
  let service: ConversationsSseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConversationsSseService],
    }).compile();

    service = module.get<ConversationsSseService>(ConversationsSseService);
  });

  afterEach(() => {
    // Clean up all connections
    service.removeAllConnections();
  });

  describe("addConnection", () => {
    it("should create a connection for a user", (done) => {
      const userId = "user-1";
      const connection = service.addConnection(userId);

      expect(connection).toBeDefined();
      connection.stream.subscribe({
        next: (event: MessageEvent) => {
          if (event.type === "heartbeat") {
            return;
          }

          done();
        },
      });

      // Send a test event
      service.sendToUser(userId, { test: "data" });
    });

    it("should allow concurrent connections for the same user", (done) => {
      const userId = "user-1";
      let firstCallCount = 0;
      let secondCallCount = 0;
      let completedCount = 0;

      const firstConnection = service.addConnection(userId);
      firstConnection.stream.subscribe({
        next: (event) => {
          if (event.type !== "new-message") {
            return;
          }

          firstCallCount++;
        },
        complete: () => {
          completedCount++;
        },
      });

      const secondConnection = service.addConnection(userId);
      secondConnection.stream.subscribe({
        next: (event) => {
          if (event.type !== "new-message") {
            return;
          }

          secondCallCount++;
        },
        complete: () => {
          completedCount++;
        },
      });

      service.sendToUser(userId, { test: "data" });

      setTimeout(() => {
        expect(firstCallCount).toBe(1);
        expect(secondCallCount).toBe(1);
        expect(completedCount).toBe(0);
        done();
      }, 50);
    });

    it("should clean up connection on unsubscribe", () => {
      const userId = "user-1";
      const connection = service.addConnection(userId);
      const subscription = connection.stream.subscribe();

      expect(service.hasConnection(userId)).toBe(true);

      subscription.unsubscribe();

      expect(service.hasConnection(userId)).toBe(false);
    });

    it("should keep the user connected until the last subscription unsubscribes", () => {
      const userId = "user-1";
      const firstSubscription = service.addConnection(userId).stream.subscribe();
      const secondSubscription = service.addConnection(userId).stream.subscribe();

      expect(service.hasConnection(userId)).toBe(true);

      firstSubscription.unsubscribe();
      expect(service.hasConnection(userId)).toBe(true);

      secondSubscription.unsubscribe();
      expect(service.hasConnection(userId)).toBe(false);
    });
  });

  describe("removeConnection", () => {
    it("should remove and complete every user connection", (done) => {
      const userId = "user-1";
      let completedCount = 0;

      service.addConnection(userId).stream.subscribe({
        complete: () => {
          completedCount++;
        },
      });
      service.addConnection(userId).stream.subscribe({
        complete: () => {
          completedCount++;
        },
      });

      service.removeConnection(userId);

      expect(service.hasConnection(userId)).toBe(false);
      expect(completedCount).toBe(2);
      done();
    });

    it("should be idempotent when user has no connection", () => {
      expect(() => {
        service.removeConnection("non-existent-user");
      }).not.toThrow();
    });
  });

  describe("sendToUser", () => {
    it("should send message event to connected user", (done) => {
      const userId = "user-1";
      const testData = {
        id: "msg-1",
        conversationId: "conv-1",
        content: "Hello",
      };

      const connection = service.addConnection(userId);
      connection.stream.subscribe({
        next: (event: MessageEvent) => {
          if (event.type === "heartbeat") {
            return;
          }

          expect(event.type).toBe("new-message");
          expect(event.data).toEqual(testData);
          done();
        },
      });

      service.sendToUser(userId, testData);
    });

    it("should not throw when sending to disconnected user", () => {
      expect(() => {
        service.sendToUser("non-existent-user", { test: "data" });
      }).not.toThrow();
    });

    it("should send to multiple users independently", (done) => {
      const user1 = "user-1";
      const user2 = "user-2";
      const data1 = { for: "user-1" };
      const data2 = { for: "user-2" };

      let user1Received = false;
      let user2Received = false;

      service.addConnection(user1).stream.subscribe({
        next: (event: MessageEvent) => {
          if (event.type !== "new-message") {
            return;
          }

          expect(event.data).toEqual(data1);
          user1Received = true;
          if (user1Received && user2Received) done();
        },
      });

      service.addConnection(user2).stream.subscribe({
        next: (event: MessageEvent) => {
          if (event.type !== "new-message") {
            return;
          }

          expect(event.data).toEqual(data2);
          user2Received = true;
          if (user1Received && user2Received) done();
        },
      });

      service.sendToUser(user1, data1);
      service.sendToUser(user2, data2);
    });
  });

  describe("hasConnection", () => {
    it("should return true for connected user", () => {
      const userId = "user-1";
      service.addConnection(userId);
      expect(service.hasConnection(userId)).toBe(true);
    });

    it("should return false for disconnected user", () => {
      expect(service.hasConnection("non-existent")).toBe(false);
    });
  });

  describe("removeAllConnections", () => {
    it("should remove all connections", () => {
      service.addConnection("user-1");
      service.addConnection("user-2");
      service.addConnection("user-3");

      expect(service.hasConnection("user-1")).toBe(true);
      expect(service.hasConnection("user-2")).toBe(true);
      expect(service.hasConnection("user-3")).toBe(true);

      service.removeAllConnections();

      expect(service.hasConnection("user-1")).toBe(false);
      expect(service.hasConnection("user-2")).toBe(false);
      expect(service.hasConnection("user-3")).toBe(false);
    });
  });
});
