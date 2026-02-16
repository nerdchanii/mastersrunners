import { Test, TestingModule } from "@nestjs/testing";
import { ConversationsSseService } from "./conversations-sse.service.js";
import { MessageEvent } from "@nestjs/common";

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
      const observable = service.addConnection(userId);

      expect(observable).toBeDefined();
      observable.subscribe({
        next: () => {
          // Should receive events
          done();
        },
      });

      // Send a test event
      service.sendToUser(userId, { test: "data" });
    });

    it("should replace existing connection for same user", (done) => {
      const userId = "user-1";
      let firstCallCount = 0;
      let secondCallCount = 0;

      const firstObs = service.addConnection(userId);
      firstObs.subscribe({
        next: () => {
          firstCallCount++;
        },
        complete: () => {
          // First connection should be completed when replaced
          expect(firstCallCount).toBe(0);
        },
      });

      // Add second connection for same user
      const secondObs = service.addConnection(userId);
      secondObs.subscribe({
        next: () => {
          secondCallCount++;
        },
      });

      // Send event - should only go to second connection
      service.sendToUser(userId, { test: "data" });

      setTimeout(() => {
        expect(firstCallCount).toBe(0);
        expect(secondCallCount).toBe(1);
        done();
      }, 50);
    });

    it("should clean up connection on unsubscribe", () => {
      const userId = "user-1";
      const observable = service.addConnection(userId);
      const subscription = observable.subscribe();

      expect(service.hasConnection(userId)).toBe(true);

      subscription.unsubscribe();

      expect(service.hasConnection(userId)).toBe(false);
    });
  });

  describe("removeConnection", () => {
    it("should remove and complete user connection", (done) => {
      const userId = "user-1";
      const observable = service.addConnection(userId);

      observable.subscribe({
        complete: () => {
          expect(service.hasConnection(userId)).toBe(false);
          done();
        },
      });

      service.removeConnection(userId);
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

      const observable = service.addConnection(userId);
      observable.subscribe({
        next: (event: MessageEvent) => {
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

      service.addConnection(user1).subscribe({
        next: (event: MessageEvent) => {
          expect(event.data).toEqual(data1);
          user1Received = true;
          if (user1Received && user2Received) done();
        },
      });

      service.addConnection(user2).subscribe({
        next: (event: MessageEvent) => {
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
