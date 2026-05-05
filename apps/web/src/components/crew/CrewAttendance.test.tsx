import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { AuthProvider } from "@/lib/auth-context";

import CrewAttendance from "./CrewAttendance";

vi.mock("@/lib/api-client", () => ({
  api: {
    fetch: vi.fn(),
  },
}));

describe("CrewAttendance", () => {
  it("renders a qr-first operator screen with attendance sections and no self check-in CTA", async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider
        initialUser={{
          id: "user-1",
          email: "runner@example.com",
          name: "김러너",
          profileImage: null,
          backgroundImage: null,
          bio: null,
          isPrivate: false,
          workoutSharingDefault: "PUBLIC",
          region: "서울",
          subRegion: "성동구",
          pb5kSeconds: null,
          pb10kSeconds: null,
          pbHalfMarathonSeconds: null,
          pbMarathonSeconds: null,
          createdAt: "2026-04-20T10:00:00.000Z",
        }}
        disableSessionSync
      >
        <MemoryRouter>
          <CrewAttendance
            crewId="crew-1"
            activityId="activity-1"
            canManageAttendance
            currentUserId="user-1"
            activityTitle="목요 인터벌"
            crewName="한강 러닝 크루"
            activityDateLabel="4월 20일(월)"
            roster={[
              {
                id: "attendance-1",
                userId: "user-1",
                status: "RSVP",
                rsvpAt: "2026-04-20T09:50:00.000Z",
                checkedAt: null,
                user: { id: "user-1", name: "김러너", profileImage: null },
              },
              {
                id: "attendance-2",
                userId: "user-2",
                status: "CHECKED_IN",
                rsvpAt: "2026-04-20T09:40:00.000Z",
                checkedAt: "2026-04-20T09:59:00.000Z",
                user: { id: "user-2", name: "이페이서", profileImage: null },
              },
            ]}
          />
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(screen.getByText("목요 인터벌")).toBeInTheDocument();
    expect(screen.getByText("한강 러닝 크루 · 4월 20일(월)")).toBeInTheDocument();
    expect(screen.getByText("QR 체크인")).toBeInTheDocument();
    expect(screen.getAllByText("체크인 완료").length).toBeGreaterThan(0);
    expect(screen.getAllByText("도착 전").length).toBeGreaterThan(0);
    expect(screen.getAllByText("이페이서").length).toBeGreaterThan(0);
    expect(screen.getAllByText("김러너").length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: /내 출석/i })).not.toBeInTheDocument();

    const attendanceTrigger = screen.getByRole("button", { name: "참석 현황" });
    expect(within(attendanceTrigger).getByText("참석 현황")).toBeInTheDocument();

    await user.click(attendanceTrigger);

    expect(screen.getByRole("heading", { name: "참석 현황" })).toBeInTheDocument();
    expect(screen.getAllByText("체크인 완료").length).toBeGreaterThan(0);
    expect(screen.getAllByText("도착 전").length).toBeGreaterThan(0);
  });
});
