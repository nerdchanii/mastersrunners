import { RequestMethod } from "@nestjs/common";
import { METHOD_METADATA, PATH_METADATA } from "@nestjs/common/constants";

import { HealthController } from "./health.controller.js";

describe("HealthController", () => {
  it("exposes both the legacy and prefixed health routes", () => {
    const controller = new HealthController();

    expect(Reflect.getMetadata(PATH_METADATA, controller.check)).toEqual([
      "health",
      "api/v1/health",
    ]);
    expect(Reflect.getMetadata(METHOD_METADATA, controller.check)).toBe(RequestMethod.GET);
  });

  it("returns an ok payload with an ISO timestamp", () => {
    const controller = new HealthController();

    const result = controller.check();

    expect(result.status).toBe("ok");
    expect(typeof result.timestamp).toBe("string");
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
  });
});
