import type { ExecutionContext } from "@nestjs/common";
import { UnauthorizedException } from "@nestjs/common";

import { FeedbackOpsAuthService } from "../ops-auth/feedback-ops-auth.service";

import { FeedbackOpsGuard } from "./feedback-ops.guard";

describe("FeedbackOpsGuard", () => {
  const mockAuthService = {
    verifyAssertion: jest.fn(),
  };

  let guard: FeedbackOpsGuard;

  beforeEach(() => {
    jest.clearAllMocks();
    guard = new FeedbackOpsGuard(mockAuthService as unknown as FeedbackOpsAuthService);
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

  it("propagates Access verification failures", async () => {
    mockAuthService.verifyAssertion.mockRejectedValue(
      new UnauthorizedException("운영자 Access 토큰을 확인할 수 없습니다."),
    );

    await expect(
      guard.canActivate(createExecutionContext({ "cf-access-jwt-assertion": "token" })),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("stores operator info on the request when the assertion is valid", async () => {
    const context = createExecutionContext({ "cf-access-jwt-assertion": "token" });

    mockAuthService.verifyAssertion.mockResolvedValue({ email: "nerdchanii@gmail.com" });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect((context.switchToHttp().getRequest() as any).operator).toEqual({
      email: "nerdchanii@gmail.com",
      note: null,
    });
  });
});
