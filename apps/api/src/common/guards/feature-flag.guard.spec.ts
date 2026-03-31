import type { ExecutionContext } from "@nestjs/common";
import { NotFoundException } from "@nestjs/common";
import type { Reflector } from "@nestjs/core";

import type { FeatureFlagsService } from "../../config/feature-flags.service.js";

import { FeatureFlagGuard } from "./feature-flag.guard.js";

describe("FeatureFlagGuard", () => {
  const reflector = {
    getAllAndOverride: jest.fn(),
  } as unknown as Reflector;
  const featureFlags = {
    isFeatureEnabled: jest.fn(),
  } as unknown as FeatureFlagsService;
  const context = {
    getClass: jest.fn(() => class MockController {}),
    getHandler: jest.fn(() => () => undefined),
  } as unknown as ExecutionContext;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("allows requests when no feature metadata is present", () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);

    const guard = new FeatureFlagGuard(reflector, featureFlags);

    expect(guard.canActivate(context)).toBe(true);
  });

  it("allows requests when the feature is enabled", () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue("events");
    (featureFlags.isFeatureEnabled as jest.Mock).mockReturnValue(true);

    const guard = new FeatureFlagGuard(reflector, featureFlags);

    expect(guard.canActivate(context)).toBe(true);
  });

  it("returns not found when the feature is disabled", () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue("challenges");
    (featureFlags.isFeatureEnabled as jest.Mock).mockReturnValue(false);

    const guard = new FeatureFlagGuard(reflector, featureFlags);

    expect(() => guard.canActivate(context)).toThrow(NotFoundException);
  });
});
