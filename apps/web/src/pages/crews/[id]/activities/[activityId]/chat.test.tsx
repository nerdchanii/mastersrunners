import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import ActivityChatPage from "./chat";

vi.mock("@/components/crew/GroupChat", () => ({
  default: () => <div>activity-chat-room</div>,
}));

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    user: { id: "user-1", name: "김러너" },
  }),
}));

vi.mock("@/hooks/useCrewActivities", () => ({
  useCrewActivity: vi.fn(),
  useRsvp: vi.fn(),
}));

vi.mock("@/hooks/useCrews", () => ({
  useCrew: vi.fn(),
}));

vi.mock("@/hooks/useGroupChat", () => ({
  useActivityChat: vi.fn(),
}));

const { useCrewActivity, useRsvp } = await import("@/hooks/useCrewActivities");
const { useCrew } = await import("@/hooks/useCrews");
const { useActivityChat } = await import("@/hooks/useGroupChat");

describe("ActivityChatPage", () => {
  it("shows a locked entry CTA before RSVP", async () => {
    vi.mocked(useCrewActivity).mockReturnValue({
      data: {
        id: "activity-1",
        title: "목요 인터벌",
        createdBy: "user-2",
        activityType: "OFFICIAL",
        attendances: [],
      },
    } as never);
    vi.mocked(useCrew).mockReturnValue({
      data: {
        members: [{ user: { id: "user-1" }, role: "MEMBER" }],
      },
    } as never);
    vi.mocked(useActivityChat).mockReturnValue({
      data: { conversation: null, messages: [], nextCursor: null },
      isLoading: false,
    } as never);
    vi.mocked(useRsvp).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);

    render(
      <MemoryRouter initialEntries={["/crews/crew-1/activities/activity-1/chat"]}>
        <Routes>
          <Route path="/crews/:id/activities/:activityId/chat" element={<ActivityChatPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("활동 채팅은 참석 신청 후 입장할 수 있습니다.")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "활동 참여하고 채팅방 참여하기" }));

    expect(screen.getByText("활동 참여 후 바로 채팅방에 입장합니다.")).toBeInTheDocument();
  });

  it("renders the chat room for RSVP members", () => {
    vi.mocked(useCrewActivity).mockReturnValue({
      data: {
        id: "activity-1",
        title: "목요 인터벌",
        createdBy: "user-2",
        activityType: "OFFICIAL",
        attendances: [{ userId: "user-1", status: "RSVP" }],
      },
    } as never);
    vi.mocked(useCrew).mockReturnValue({
      data: {
        members: [{ user: { id: "user-1" }, role: "MEMBER" }],
      },
    } as never);
    vi.mocked(useActivityChat).mockReturnValue({
      data: { conversation: { id: "conv-1", participants: [] }, messages: [], nextCursor: null },
      isLoading: false,
    } as never);
    vi.mocked(useRsvp).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);

    render(
      <MemoryRouter initialEntries={["/crews/crew-1/activities/activity-1/chat"]}>
        <Routes>
          <Route path="/crews/:id/activities/:activityId/chat" element={<ActivityChatPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("activity-chat-room")).toBeInTheDocument();
  });
});
