import { MessageEvent } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

import { NotificationsSseService } from "./notifications-sse.service.js";

describe("NotificationsSseService", () => {
  let service: NotificationsSseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationsSseService],
    }).compile();

    service = module.get<NotificationsSseService>(NotificationsSseService);
  });

  afterEach(() => {
    service.removeAllConnections();
  });

  it("should deliver notification events to a connected user", (done) => {
    const userId = "user-1";
    const data = { id: "notif-1", type: "LIKE" };

    service.addConnection(userId).stream.subscribe({
      next: (event: MessageEvent) => {
        if (event.type === "heartbeat") {
          return;
        }

        expect(event.type).toBe("notification");
        expect(event.data).toEqual(data);
        done();
      },
    });

    service.sendToUser(userId, data);
  });

  it("should allow concurrent connections for the same user", (done) => {
    const userId = "user-1";
    let firstCalls = 0;
    let secondCalls = 0;

    service.addConnection(userId).stream.subscribe({
      next: (event) => {
        if (event.type !== "notification") {
          return;
        }

        firstCalls++;
      },
    });

    service.addConnection(userId).stream.subscribe({
      next: (event) => {
        if (event.type !== "notification") {
          return;
        }

        secondCalls++;
      },
    });

    service.sendToUser(userId, { id: "notif-1" });

    setTimeout(() => {
      expect(firstCalls).toBe(1);
      expect(secondCalls).toBe(1);
      done();
    }, 25);
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

  it("should remove and complete every connection for a user", () => {
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
  });
});
