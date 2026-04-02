import type { ExecutionContext } from "@nestjs/common";
import { ForbiddenException, UnauthorizedException } from "@nestjs/common";

import { FeedbackOpsAuthService } from "../ops-auth/feedback-ops-auth.service";
import { FeedbackRepository } from "../repositories/feedback.repository";

import { FeedbackOpsGuard } from "./feedback-ops.guard";

describe("FeedbackOpsGuard", () => {
  const mockAuthService = {
    verifyAssertion: jest.fn(),
  };
  const mockRepository = {
    findActiveOperatorIdentity: jest.fn(),
  };

  let guard: FeedbackOpsGuard;

  beforeEach(() => {
    jest.clearAllMocks();
    guard = new FeedbackOpsGuard(
      mockAuthService as unknown as FeedbackOpsAuthService,
      mockRepository as unknown as FeedbackRepository,
    );
  });

  function createExecutionContext(headers: Record<string, string | undefined>) {
    const request = {
      get: (name: string) => headers[name.toLowerCase()],
    } as any;

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  }

  it("rejects requests without an Access assertion", async () => {
    await expect(guard.canActivate(createExecutionContext({}))).rejects.toThrow(
      UnauthorizedException,
    );
    expect(mockAuthService.verifyAssertion).not.toHaveBeenCalled();
  });

  it("rejects requests without an active operator identity", async () => {
    mockAuthService.verifyAssertion.mockResolvedValue({ email: "nerdchanii@gmail.com" });
    mockRepository.findActiveOperatorIdentity.mockResolvedValue(null);

    await expect(
      guard.canActivate(createExecutionContext({ "cf-access-jwt-assertion": "token" })),
    ).rejects.toThrow(ForbiddenException);
  });

  it("stores operator info on the request when the assertion is valid", async () => {
    const context = createExecutionContext({ "cf-access-jwt-assertion": "token" });

    mockAuthService.verifyAssertion.mockResolvedValue({ email: "nerdchanii@gmail.com" });
    mockRepository.findActiveOperatorIdentity.mockResolvedValue({
      email: "nerdchanii@gmail.com",
      note: "solo operator",
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect((context.switchToHttp().getRequest() as any).operator).toEqual({
      email: "nerdchanii@gmail.com",
      note: "solo operator",
    });
  });
});
