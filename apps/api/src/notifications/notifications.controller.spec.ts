import { EventEmitter } from "node:events";

import { of } from "rxjs";

import { NotificationsController } from "./notifications.controller.js";

describe("NotificationsController", () => {
  it("keeps SSE cleanup bound to request close only", () => {
    const close = jest.fn();
    const mockSseService = {
      addConnection: jest.fn().mockReturnValue({
        close,
        stream: of({ type: "heartbeat", data: "" }),
      }),
    };
    const controller = new NotificationsController({} as never, mockSseService as never);
    const req = new EventEmitter() as EventEmitter & { user: { userId: string } };
    req.user = { userId: "user-1" };

    const stream = controller.sse(req as never);

    expect(stream).toBeDefined();
    expect(mockSseService.addConnection).toHaveBeenCalledWith("user-1");

    req.emit("end");
    expect(close).not.toHaveBeenCalled();

    req.emit("close");
    expect(close).toHaveBeenCalledTimes(1);
  });
});
