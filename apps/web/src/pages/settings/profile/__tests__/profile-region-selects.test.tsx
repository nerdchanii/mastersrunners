import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import EditProfilePage from "../index";

const {
  authMock,
  logoutMock,
  navigateMock,
  refreshUserMock,
  setThemeMock,
  toastMock,
  updateProfileMock,
} = vi.hoisted(() => ({
  authMock: {
    isAuthenticated: true,
    isLoading: false,
    user: {
      id: "user-1",
      email: "runner@example.com",
      name: "김러너",
      profileImage: null,
      backgroundImage: null,
      bio: "",
      isPrivate: false,
      workoutSharingDefault: "PUBLIC",
      region: "서울",
      subRegion: "강남",
      pb5kSeconds: null,
      pb10kSeconds: null,
      pbHalfMarathonSeconds: null,
      pbMarathonSeconds: null,
      createdAt: "2026-05-08T00:00:00.000Z",
    },
  },
  logoutMock: vi.fn(),
  navigateMock: vi.fn(),
  refreshUserMock: vi.fn(),
  setThemeMock: vi.fn(),
  toastMock: {
    error: vi.fn(),
    success: vi.fn(),
  },
  updateProfileMock: vi.fn(),
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
    ...authMock,
    logout: logoutMock,
    refreshUser: refreshUserMock,
  }),
}));

vi.mock("@/lib/theme-context", () => ({
  useTheme: () => ({
    theme: "system",
    setTheme: setThemeMock,
  }),
}));

vi.mock("@/hooks/useAccount", () => ({
  useDeleteAccount: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock("@/hooks/useProfile", () => ({
  useUpdateProfile: () => ({
    mutateAsync: updateProfileMock,
    isPending: false,
  }),
}));

describe("EditProfilePage region selects", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    logoutMock.mockReset();
    refreshUserMock.mockReset();
    setThemeMock.mockReset();
    toastMock.error.mockReset();
    toastMock.success.mockReset();
    updateProfileMock.mockReset();
    updateProfileMock.mockResolvedValue(undefined);
    authMock.user.region = "서울";
    authMock.user.subRegion = "강남";
  });

  it("renders region fields as selects and clears sub-region when the region changes", async () => {
    const user = userEvent.setup();

    render(<EditProfilePage />);

    const regionSelect = screen.getByRole("combobox", { name: "거점 지역" });
    const subRegionSelect = screen.getByRole("combobox", { name: "세부 지역" });

    expect(regionSelect).toHaveValue("서울특별시");
    expect(subRegionSelect).toHaveValue("강남구");

    await user.selectOptions(regionSelect, "부산광역시");

    expect(subRegionSelect).toHaveValue("");
  });

  it("submits empty optional region fields as null", async () => {
    const user = userEvent.setup();

    render(<EditProfilePage />);

    await user.selectOptions(screen.getByRole("combobox", { name: "거점 지역" }), "");

    await user.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => {
      expect(updateProfileMock).toHaveBeenCalledWith(
        expect.objectContaining({
          region: null,
          subRegion: null,
        }),
      );
    });
  });

  it("hydrates legacy saved values into canonical selectable values before submit", async () => {
    const user = userEvent.setup();

    render(<EditProfilePage />);

    expect(screen.getByRole("combobox", { name: "거점 지역" })).toHaveValue("서울특별시");
    expect(screen.getByRole("combobox", { name: "세부 지역" })).toHaveValue("강남구");

    await user.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => {
      expect(updateProfileMock).toHaveBeenCalledWith(
        expect.objectContaining({
          region: "서울특별시",
          subRegion: "강남구",
        }),
      );
    });
  });
});
