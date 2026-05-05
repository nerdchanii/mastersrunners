import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import CrewActivityDetailPage from "./index";

vi.mock("leaflet", () => ({
  Icon: {
    Default: {
      prototype: {},
      mergeOptions: vi.fn(),
    },
  },
}));

vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Marker: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Popup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TileLayer: () => null,
}));

vi.mock("qrcode.react", () => ({
  QRCodeSVG: () => <div>qr-code-svg</div>,
}));

vi.mock("@/components/common/ConfirmDialog", () => ({
  ConfirmDialog: () => null,
}));

vi.mock("@/components/crew/crew-activity-icons", () => ({
  getCrewActivityIcon: () => ({ node: <span>icon</span> }),
}));

vi.mock("./use-crew-activity-detail-view-model", () => ({
  useCrewActivityDetailViewModel: vi.fn(),
}));

const { useCrewActivityDetailViewModel } = await import("./use-crew-activity-detail-view-model");

function renderPage() {
  render(
    <MemoryRouter initialEntries={["/crews/crew-1/activities/activity-1"]}>
      <Routes>
        <Route path="/crews/:id/activities/:activityId" element={<CrewActivityDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("CrewActivityDetailPage", () => {
  it("shows rsvp actions and locked chat CTA for members who have not joined", async () => {
    vi.mocked(useCrewActivityDetailViewModel).mockReturnValue({
      activity: {
        id: "activity-1",
        title: "목요 인터벌",
        description: "서울숲 인터벌",
        activityDate: "2026-04-20T10:00:00.000Z",
        location: "서울숲",
        latitude: null,
        longitude: null,
        activityType: "OFFICIAL",
        activityIcon: "🏃",
        status: "SCHEDULED",
        createdAt: "2026-04-20T09:00:00.000Z",
      },
      activityId: "activity-1",
      adminCheckInMut: { isPending: false },
      canManage: false,
      cancelActivityMut: { isPending: false },
      cancelRsvp: { isPending: false },
      checkedInCount: 1,
      checkIn: { isPending: false },
      completeActivity: { isPending: false },
      creator: null,
      crewId: "crew-1",
      deleteActivity: { isPending: false },
      error: null,
      goBackToCrew: vi.fn(),
      goToChat: vi.fn(),
      goToEdit: vi.fn(),
      goToQrCheckIn: vi.fn(),
      handleAdminCheckIn: vi.fn(),
      handleCancelActivity: vi.fn(),
      handleCancelRsvp: vi.fn(),
      handleCheckIn: vi.fn(),
      handleCompleteActivity: vi.fn(),
      handleDelete: vi.fn(),
      handleDownloadQR: vi.fn(),
      handleRsvp: vi.fn(),
      isActivityActive: true,
      isActivityLoading: false,
      isAdmin: false,
      myAttendance: null,
      myStatus: undefined,
      noShowCount: 0,
      rsvp: { isPending: false },
      rsvpCount: 3,
      scheduledDate: new Date("2026-04-20T10:00:00.000Z"),
      setShowCancelDialog: vi.fn(),
      setShowCompleteDialog: vi.fn(),
      setShowDeleteDialog: vi.fn(),
      showCancelDialog: false,
      showCompleteDialog: false,
      showDeleteDialog: false,
      totalActive: 3,
      visibleAttendances: [],
      crewName: "한강 러닝 크루",
      activityDateLabel: "4월 20일(월)",
      canViewPendingRoster: false,
      checkedInAttendances: [],
      pendingAttendances: [],
      activityShareUrl: "http://localhost:3001/crews/crew-1/activities/activity-1",
    } as never);

    renderPage();

    expect(screen.getByRole("button", { name: "참석 신청" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "활동 채팅" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "활동 공유" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "참석 현황" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "활동 취소" })).not.toBeInTheDocument();
    expect(screen.getByText("icon")).toBeInTheDocument();
  });

  it("shows operator management through menu and qr as the primary action", async () => {
    const user = userEvent.setup();
    const goToEdit = vi.fn();
    const setShowCancelDialog = vi.fn();

    vi.mocked(useCrewActivityDetailViewModel).mockReturnValue({
      activity: {
        id: "activity-1",
        title: "목요 인터벌",
        description: null,
        activityDate: "2026-04-20T10:00:00.000Z",
        location: null,
        latitude: null,
        longitude: null,
        activityType: "OFFICIAL",
        activityIcon: "🏃",
        status: "SCHEDULED",
        createdAt: "2026-04-20T09:00:00.000Z",
      },
      activityId: "activity-1",
      adminCheckInMut: { isPending: false },
      canManage: true,
      cancelActivityMut: { isPending: false },
      cancelRsvp: { isPending: false },
      checkedInCount: 1,
      checkIn: { isPending: false },
      completeActivity: { isPending: false },
      creator: null,
      crewId: "crew-1",
      deleteActivity: { isPending: false },
      error: null,
      goBackToCrew: vi.fn(),
      goToChat: vi.fn(),
      goToEdit,
      goToQrCheckIn: vi.fn(),
      handleAdminCheckIn: vi.fn(),
      handleCancelActivity: vi.fn(),
      handleCancelRsvp: vi.fn(),
      handleCheckIn: vi.fn(),
      handleCompleteActivity: vi.fn(),
      handleDelete: vi.fn(),
      handleDownloadQR: vi.fn(),
      handleRsvp: vi.fn(),
      isActivityActive: true,
      isActivityLoading: false,
      isAdmin: true,
      myAttendance: null,
      myStatus: "RSVP",
      noShowCount: 0,
      rsvp: { isPending: false },
      rsvpCount: 3,
      scheduledDate: new Date("2026-04-20T10:00:00.000Z"),
      setShowCancelDialog,
      setShowCompleteDialog: vi.fn(),
      setShowDeleteDialog: vi.fn(),
      showCancelDialog: false,
      showCompleteDialog: false,
      showDeleteDialog: false,
      totalActive: 3,
      visibleAttendances: [],
      crewName: "한강 러닝 크루",
      activityDateLabel: "4월 20일(월)",
      canViewPendingRoster: true,
      checkedInAttendances: [
        {
          id: "attendance-checked",
          userId: "user-2",
          status: "CHECKED_IN",
          rsvpAt: "2026-04-20T08:00:00.000Z",
          checkedAt: "2026-04-20T09:30:00.000Z",
          user: { id: "user-2", name: "김러너", profileImage: null },
        },
      ],
      pendingAttendances: [
        {
          id: "attendance-pending",
          userId: "user-3",
          status: "RSVP",
          rsvpAt: "2026-04-20T08:10:00.000Z",
          checkedAt: null,
          user: { id: "user-3", name: "이페이서", profileImage: null },
        },
      ],
      activityShareUrl: "http://localhost:3001/crews/crew-1/activities/activity-1",
    } as never);

    renderPage();

    expect(screen.getByRole("button", { name: "QR 체크인" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "활동 채팅" })).toBeInTheDocument();
    const rosterTrigger = screen.getByRole("button", { name: "참석 현황" });
    expect(within(rosterTrigger).queryByText(/완료/)).not.toBeInTheDocument();
    expect(screen.queryByText("참석 신청됨")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "활동 메뉴" }));

    expect(screen.getByRole("menuitem", { name: "수정" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "활동 취소" })).toBeInTheDocument();
  });

  it("shows chat as a secondary action and visible cancel text after rsvp", () => {
    vi.mocked(useCrewActivityDetailViewModel).mockReturnValue({
      activity: {
        id: "activity-1",
        title: "목요 인터벌",
        description: "서울숲 인터벌",
        activityDate: "2026-04-20T10:00:00.000Z",
        location: "서울숲",
        latitude: null,
        longitude: null,
        activityType: "OFFICIAL",
        activityIcon: "🏃",
        status: "SCHEDULED",
        createdAt: "2026-04-20T09:00:00.000Z",
      },
      activityId: "activity-1",
      adminCheckInMut: { isPending: false },
      canManage: false,
      cancelActivityMut: { isPending: false },
      cancelRsvp: { isPending: false },
      checkedInCount: 1,
      checkIn: { isPending: false },
      completeActivity: { isPending: false },
      creator: null,
      crewId: "crew-1",
      deleteActivity: { isPending: false },
      error: null,
      goBackToCrew: vi.fn(),
      goToChat: vi.fn(),
      goToEdit: vi.fn(),
      goToQrCheckIn: vi.fn(),
      handleAdminCheckIn: vi.fn(),
      handleCancelActivity: vi.fn(),
      handleCancelRsvp: vi.fn(),
      handleCheckIn: vi.fn(),
      handleCompleteActivity: vi.fn(),
      handleDelete: vi.fn(),
      handleDownloadQR: vi.fn(),
      handleRsvp: vi.fn(),
      isActivityActive: true,
      isActivityLoading: false,
      isAdmin: false,
      myAttendance: { id: "attendance-1", userId: "user-1", status: "RSVP" },
      myStatus: "RSVP",
      noShowCount: 0,
      rsvp: { isPending: false },
      rsvpCount: 3,
      scheduledDate: new Date("2026-04-20T10:00:00.000Z"),
      setShowCancelDialog: vi.fn(),
      setShowCompleteDialog: vi.fn(),
      setShowDeleteDialog: vi.fn(),
      showCancelDialog: false,
      showCompleteDialog: false,
      showDeleteDialog: false,
      totalActive: 3,
      visibleAttendances: [],
      crewName: "한강 러닝 크루",
      activityDateLabel: "4월 20일(월)",
      canViewPendingRoster: true,
      checkedInAttendances: [],
      pendingAttendances: [],
      activityShareUrl: "http://localhost:3001/crews/crew-1/activities/activity-1",
    } as never);

    renderPage();

    expect(screen.queryByRole("button", { name: "참석 신청" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "활동 채팅" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "참석 현황" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "참석 취소" })).toBeInTheDocument();
  });

  it("shows roster tabs inside the attendance sheet", async () => {
    const user = userEvent.setup();

    vi.mocked(useCrewActivityDetailViewModel).mockReturnValue({
      activity: {
        id: "activity-1",
        title: "목요 인터벌",
        description: "서울숲 인터벌",
        activityDate: "2026-04-20T10:00:00.000Z",
        location: "서울숲",
        latitude: null,
        longitude: null,
        activityType: "OFFICIAL",
        activityIcon: "🏃",
        status: "SCHEDULED",
        createdAt: "2026-04-20T09:00:00.000Z",
      },
      activityId: "activity-1",
      adminCheckInMut: { isPending: false },
      canManage: false,
      cancelActivityMut: { isPending: false },
      cancelRsvp: { isPending: false },
      checkedInCount: 1,
      checkIn: { isPending: false },
      completeActivity: { isPending: false },
      creator: null,
      crewId: "crew-1",
      deleteActivity: { isPending: false },
      error: null,
      goBackToCrew: vi.fn(),
      goToChat: vi.fn(),
      goToEdit: vi.fn(),
      goToQrCheckIn: vi.fn(),
      handleAdminCheckIn: vi.fn(),
      handleCancelActivity: vi.fn(),
      handleCancelRsvp: vi.fn(),
      handleCheckIn: vi.fn(),
      handleCompleteActivity: vi.fn(),
      handleDelete: vi.fn(),
      handleDownloadQR: vi.fn(),
      handleRsvp: vi.fn(),
      isActivityActive: true,
      isActivityLoading: false,
      isAdmin: false,
      myAttendance: { id: "attendance-1", userId: "user-1", status: "RSVP" },
      myStatus: "RSVP",
      noShowCount: 0,
      rsvp: { isPending: false },
      rsvpCount: 2,
      scheduledDate: new Date("2026-04-20T10:00:00.000Z"),
      setShowCancelDialog: vi.fn(),
      setShowCompleteDialog: vi.fn(),
      setShowDeleteDialog: vi.fn(),
      showCancelDialog: false,
      showCompleteDialog: false,
      showDeleteDialog: false,
      totalActive: 2,
      visibleAttendances: [],
      crewName: "한강 러닝 크루",
      activityDateLabel: "4월 20일(월)",
      canViewPendingRoster: true,
      checkedInAttendances: [
        {
          id: "attendance-checked",
          userId: "user-2",
          status: "CHECKED_IN",
          rsvpAt: "2026-04-20T08:00:00.000Z",
          checkedAt: "2026-04-20T09:30:00.000Z",
          user: { id: "user-2", name: "김러너", profileImage: null },
        },
      ],
      pendingAttendances: [
        {
          id: "attendance-pending",
          userId: "user-3",
          status: "RSVP",
          rsvpAt: "2026-04-20T08:10:00.000Z",
          checkedAt: null,
          user: { id: "user-3", name: "이페이서", profileImage: null },
        },
      ],
      activityShareUrl: "http://localhost:3001/crews/crew-1/activities/activity-1",
    } as never);

    renderPage();

    await user.click(screen.getByRole("button", { name: "참석 현황" }));

    expect(screen.getByRole("tab", { name: "체크인 완료" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "도착 전" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "도착 전" })).toHaveAttribute("data-state", "active");
    expect(screen.getByText("이페이서")).toBeInTheDocument();
  });

  it("does not repeat the check-in meta copy and date card in the detail body", () => {
    vi.mocked(useCrewActivityDetailViewModel).mockReturnValue({
      activity: {
        id: "activity-1",
        title: "목요 인터벌",
        description: "서울숲 인터벌",
        activityDate: "2026-04-20T10:00:00.000Z",
        location: "서울숲",
        latitude: null,
        longitude: null,
        activityType: "OFFICIAL",
        activityIcon: "🏃",
        status: "SCHEDULED",
        createdAt: "2026-04-20T09:00:00.000Z",
      },
      activityId: "activity-1",
      adminCheckInMut: { isPending: false },
      canManage: true,
      cancelActivityMut: { isPending: false },
      cancelRsvp: { isPending: false },
      checkedInCount: 1,
      checkIn: { isPending: false },
      completeActivity: { isPending: false },
      creator: null,
      crewId: "crew-1",
      deleteActivity: { isPending: false },
      error: null,
      goBackToCrew: vi.fn(),
      goToChat: vi.fn(),
      goToEdit: vi.fn(),
      goToQrCheckIn: vi.fn(),
      handleAdminCheckIn: vi.fn(),
      handleCancelActivity: vi.fn(),
      handleCancelRsvp: vi.fn(),
      handleCheckIn: vi.fn(),
      handleCompleteActivity: vi.fn(),
      handleDelete: vi.fn(),
      handleDownloadQR: vi.fn(),
      handleRsvp: vi.fn(),
      isActivityActive: true,
      isActivityLoading: false,
      isAdmin: true,
      myAttendance: { id: "attendance-1", userId: "user-1", status: "RSVP" },
      myStatus: "RSVP",
      noShowCount: 0,
      rsvp: { isPending: false },
      rsvpCount: 2,
      scheduledDate: new Date("2026-04-20T10:00:00.000Z"),
      setShowCancelDialog: vi.fn(),
      setShowCompleteDialog: vi.fn(),
      setShowDeleteDialog: vi.fn(),
      showCancelDialog: false,
      showCompleteDialog: false,
      showDeleteDialog: false,
      totalActive: 2,
      visibleAttendances: [],
      crewName: "한강 러닝 크루",
      activityDateLabel: "4월 20일(월)",
      canViewPendingRoster: true,
      checkedInAttendances: [],
      pendingAttendances: [],
      activityShareUrl: "http://localhost:3001/crews/crew-1/activities/activity-1",
    } as never);

    renderPage();

    expect(screen.queryByText("출석 체크")).not.toBeInTheDocument();
    expect(screen.queryByText("일시")).not.toBeInTheDocument();
  });
});
