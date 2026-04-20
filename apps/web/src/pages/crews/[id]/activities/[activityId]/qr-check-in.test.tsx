import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import QrCheckInPage from "./qr-check-in";

const crewAttendanceMock = vi.fn((_props: unknown) => <div>operator-qr-screen</div>);

vi.mock("@/components/crew/CrewAttendance", () => ({
  default: (props: unknown) => crewAttendanceMock(props),
}));

vi.mock("@/components/crew/QrScanner", () => ({
  QrScanner: () => <div>qr-scanner</div>,
}));

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    user: { id: "user-1", name: "김러너" },
  }),
}));

vi.mock("@/hooks/useCrews", () => ({
  useCrew: vi.fn(),
}));

vi.mock("@/hooks/useCrewActivities", () => ({
  useCrewActivity: vi.fn(),
  useCheckIn: vi.fn(),
  useQrCheckIn: vi.fn(),
}));

const { useCheckIn, useCrewActivity, useQrCheckIn } = await import("@/hooks/useCrewActivities");
const { useCrew } = await import("@/hooks/useCrews");

describe("QrCheckInPage", () => {
  beforeEach(() => {
    crewAttendanceMock.mockClear();
  });

  it("renders operator attendance management screen when manager opens the page without qr code", () => {
    vi.mocked(useCrewActivity).mockReturnValue({
      data: {
        id: "activity-1",
        title: "목요 인터벌",
        activityDate: "2026-04-20T10:00:00.000Z",
        crewId: "crew-1",
        createdBy: "user-1",
        activityType: "OFFICIAL",
        status: "SCHEDULED",
        attendances: [],
      },
    } as never);
    vi.mocked(useCrew).mockReturnValue({
      data: {
        id: "crew-1",
        name: "한강 러닝 크루",
        description: null,
        imageUrl: null,
        isPublic: true,
        createdAt: "2026-04-20T08:00:00.000Z",
        creator: { id: "user-9", name: "한울", profileImage: null },
        _count: { members: 3 },
        members: [
          {
            id: "member-1",
            role: "ADMIN",
            joinedAt: "2026-04-01T00:00:00.000Z",
            user: { id: "user-1", name: "김러너", profileImage: null },
          },
        ],
      },
    } as never);
    vi.mocked(useQrCheckIn).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    } as never);
    vi.mocked(useCheckIn).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);

    render(
      <MemoryRouter initialEntries={["/crews/crew-1/activities/activity-1/qr-check-in"]}>
        <Routes>
          <Route path="/crews/:id/activities/:activityId/qr-check-in" element={<QrCheckInPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("operator-qr-screen")).toBeInTheDocument();
    expect(crewAttendanceMock).toHaveBeenCalledWith(
      expect.objectContaining({
        activityTitle: "목요 인터벌",
        crewName: "한강 러닝 크루",
        activityDateLabel: expect.stringContaining("4월"),
      }),
    );
  });

  it("keeps the member qr flow when the code query exists", () => {
    vi.mocked(useCrewActivity).mockReturnValue({
      data: {
        id: "activity-1",
        title: "목요 인터벌",
        activityDate: "2026-04-20T10:00:00.000Z",
        crewId: "crew-1",
        createdBy: "user-2",
        activityType: "OFFICIAL",
        status: "SCHEDULED",
        attendances: [{ userId: "user-1", status: "RSVP" }],
      },
    } as never);
    vi.mocked(useCrew).mockReturnValue({
      data: {
        id: "crew-1",
        name: "한강 러닝 크루",
        description: null,
        imageUrl: null,
        isPublic: true,
        createdAt: "2026-04-20T08:00:00.000Z",
        creator: { id: "user-2", name: "한울", profileImage: null },
        _count: { members: 3 },
        members: [],
      },
    } as never);
    vi.mocked(useQrCheckIn).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    } as never);
    vi.mocked(useCheckIn).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);

    render(
      <MemoryRouter initialEntries={["/crews/crew-1/activities/activity-1/qr-check-in?code=abc"]}>
        <Routes>
          <Route path="/crews/:id/activities/:activityId/qr-check-in" element={<QrCheckInPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("button", { name: /qr 코드로 체크인/i })).toBeInTheDocument();
    expect(screen.queryByText("operator-qr-screen")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "목요 인터벌" })).toBeInTheDocument();
    expect(screen.getByText("한강 러닝 크루 · 4월 20일(월)")).toBeInTheDocument();
    expect(screen.getByText("QR 체크인")).toBeInTheDocument();
  });

  it("keeps showing the operator screen even when the operator already checked in", () => {
    vi.mocked(useCrewActivity).mockReturnValue({
      data: {
        id: "activity-1",
        title: "목요 인터벌",
        activityDate: "2026-04-20T10:00:00.000Z",
        crewId: "crew-1",
        createdBy: "user-2",
        activityType: "OFFICIAL",
        status: "SCHEDULED",
        attendances: [{ userId: "user-1", status: "CHECKED_IN" }],
      },
    } as never);
    vi.mocked(useCrew).mockReturnValue({
      data: {
        id: "crew-1",
        name: "한강 러닝 크루",
        description: null,
        imageUrl: null,
        isPublic: true,
        createdAt: "2026-04-20T08:00:00.000Z",
        creator: { id: "user-2", name: "한울", profileImage: null },
        _count: { members: 3 },
        members: [
          {
            id: "member-1",
            role: "OWNER",
            joinedAt: "2026-04-01T00:00:00.000Z",
            user: { id: "user-1", name: "김러너", profileImage: null },
          },
        ],
      },
    } as never);
    vi.mocked(useQrCheckIn).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    } as never);
    vi.mocked(useCheckIn).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);

    render(
      <MemoryRouter initialEntries={["/crews/crew-1/activities/activity-1/qr-check-in"]}>
        <Routes>
          <Route path="/crews/:id/activities/:activityId/qr-check-in" element={<QrCheckInPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("operator-qr-screen")).toBeInTheDocument();
    expect(screen.queryByText("체크인 완료!")).not.toBeInTheDocument();
  });
});
