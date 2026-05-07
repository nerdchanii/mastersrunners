import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import OnboardingPage from "../index";

const { authMock, navigateMock, toastMock, updateOnboardingProfileMock } = vi.hoisted(() => ({
  authMock: {
    refreshUser: vi.fn(),
    user: {
      id: "user-1",
      email: "runner@example.com",
      name: "김러너",
      profileImage: null,
      backgroundImage: null,
      bio: "",
      isPrivate: false,
      workoutSharingDefault: "PUBLIC",
      region: "",
      subRegion: "",
      pb5kSeconds: null,
      pb10kSeconds: null,
      pbHalfMarathonSeconds: null,
      pbMarathonSeconds: null,
      createdAt: "2026-05-07T00:00:00.000Z",
    },
  },
  navigateMock: vi.fn(),
  toastMock: {
    error: vi.fn(),
    success: vi.fn(),
  },
  updateOnboardingProfileMock: vi.fn(),
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("sonner", () => ({
  toast: toastMock,
}));

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    refreshUser: authMock.refreshUser,
    user: authMock.user,
  }),
}));

vi.mock("../onboarding-api", () => ({
  updateOnboardingProfile: updateOnboardingProfileMock,
}));

function currentOnboardingStepQuery() {
  return new URLSearchParams(window.location.search).get("onboarding.step");
}

function storedOnboardingStep() {
  const state = window.history.state;

  if (typeof state !== "object" || state === null) {
    return null;
  }

  const funnelState = (state as Record<string, unknown>).__mastersFunnel;

  if (typeof funnelState !== "object" || funnelState === null) {
    return null;
  }

  const onboardingState = (funnelState as Record<string, unknown>).onboarding;

  if (typeof onboardingState !== "object" || onboardingState === null) {
    return null;
  }

  const step = (onboardingState as Record<string, unknown>).step;

  return typeof step === "string" ? step : null;
}

function renderOnboarding() {
  return render(<OnboardingPage />);
}

function expectStepLabelsVisible() {
  expect(screen.getAllByText("프로필").length).toBeGreaterThan(0);
  expect(screen.getAllByText("러너 정보").length).toBeGreaterThan(0);
  expect(screen.getAllByText("공개 설정").length).toBeGreaterThan(0);
}

async function advanceToRunnerStep(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "다음" }));
  expect(
    screen.getByText("거점과 기록을 가볍게 적어두면 추천이 더 자연스러워집니다."),
  ).toBeInTheDocument();
}

async function advanceToPrivacyStep(user: ReturnType<typeof userEvent.setup>) {
  await advanceToRunnerStep(user);
  await user.click(screen.getByRole("button", { name: "다음" }));
  expect(
    screen.getByText("먼저 보일 정도만 정하고, 세부는 나중에 바꿔도 됩니다."),
  ).toBeInTheDocument();
}

describe("OnboardingPage funnel migration", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/onboarding");
    navigateMock.mockReset();
    toastMock.error.mockReset();
    toastMock.success.mockReset();
    authMock.refreshUser.mockReset();
    updateOnboardingProfileMock.mockReset();
    updateOnboardingProfileMock.mockResolvedValue(undefined);
  });

  it("keeps next/back behavior and visible step labels aligned with the funnel step", async () => {
    const user = userEvent.setup();

    renderOnboarding();

    expectStepLabelsVisible();
    expect(screen.getByText("다른 러너에게 먼저 보여줄 이름을 정해주세요.")).toBeInTheDocument();

    await advanceToRunnerStep(user);

    await user.click(screen.getByRole("button", { name: "이전" }));

    expect(screen.getByText("다른 러너에게 먼저 보여줄 이름을 정해주세요.")).toBeInTheDocument();
    expect(currentOnboardingStepQuery()).toBe("profile");
  });

  it("uses browser Back to return from a later onboarding step before route exit", async () => {
    const user = userEvent.setup();
    window.history.replaceState({ route: "feed" }, "", "/feed");
    window.history.pushState({ route: "onboarding" }, "", "/onboarding");

    renderOnboarding();

    await advanceToPrivacyStep(user);
    expect(currentOnboardingStepQuery()).toBe("privacy");

    act(() => {
      window.history.back();
    });

    await waitFor(() => {
      expect(
        screen.getByText("거점과 기록을 가볍게 적어두면 추천이 더 자연스러워집니다."),
      ).toBeInTheDocument();
    });
    expect(window.location.pathname).toBe("/onboarding");
    expect(currentOnboardingStepQuery()).toBe("runner");
  });

  it("blocks profile advancement and reports a toast when the required nickname is empty", async () => {
    const user = userEvent.setup();

    renderOnboarding();

    await user.clear(screen.getByLabelText(/닉네임/));
    await user.click(screen.getByRole("button", { name: "다음" }));

    expect(toastMock.error).toHaveBeenCalledWith("닉네임을 입력해주세요.");
    expect(screen.getByText("다른 러너에게 먼저 보여줄 이름을 정해주세요.")).toBeInTheDocument();
    expect(
      screen.queryByText("거점과 기록을 가볍게 적어두면 추천이 더 자연스러워집니다."),
    ).not.toBeInTheDocument();
  });

  it("falls back to profile and normalizes query/state when a later step has no recoverable history context", () => {
    window.history.replaceState(null, "", "/onboarding?onboarding.step=privacy");

    renderOnboarding();

    expect(screen.getByText("다른 러너에게 먼저 보여줄 이름을 정해주세요.")).toBeInTheDocument();
    expect(currentOnboardingStepQuery()).toBe("profile");
    expect(storedOnboardingStep()).toBe("profile");
  });

  it("keeps skip navigation replacing the route with the feed", async () => {
    const user = userEvent.setup();

    renderOnboarding();

    await user.click(screen.getByRole("button", { name: "건너뛰기" }));

    expect(navigateMock).toHaveBeenCalledWith("/feed", { replace: true });
  });

  it("blocks final save when a PB value is invalid", async () => {
    const user = userEvent.setup();

    renderOnboarding();

    await advanceToRunnerStep(user);
    await user.type(screen.getByLabelText("5K"), "not-a-time");
    await user.click(screen.getByRole("button", { name: "다음" }));
    await user.click(screen.getByRole("button", { name: "시작하기" }));

    expect(toastMock.error).toHaveBeenCalledWith(
      "PB 시간은 mm:ss 또는 hh:mm:ss 형식으로 입력해주세요.",
    );
    expect(updateOnboardingProfileMock).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalledWith("/feed", { replace: true });
  });
});
