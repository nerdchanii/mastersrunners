import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import ActivityMessagePage from "./index";

const groupChatSpy = vi.fn();

vi.mock("@/components/crew/GroupChat", () => ({
  default: (props: unknown) => {
    groupChatSpy(props);
    return <div>activity-chat-room</div>;
  },
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

vi.mock("@/hooks/useChatBackToMessages", () => ({
  useChatBackToMessages: () => vi.fn(),
}));

const { useCrewActivity, useRsvp } = await import("@/hooks/useCrewActivities");
const { useCrew } = await import("@/hooks/useCrews");
const { useActivityChat } = await import("@/hooks/useGroupChat");

function renderPage(entry = "/messages/crew/crew-1/activity/activity-1") {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/messages" element={<Outlet context={{ selectedConversation: null }} />}>
          <Route path="crew/:crewId/activity/:activityId" element={<ActivityMessagePage />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("ActivityMessagePage", () => {
  const baseChatController = {
    conversation: { id: "conv-1", participants: [] },
    messages: [],
    olderCursor: null,
    newerCursor: null,
    firstUnreadMessageId: null,
    loading: false,
    error: null,
    errorStatus: null,
    loadingOlder: false,
    loadingNewer: false,
    sending: false,
    sendError: null,
    pendingNewMessages: 0,
    anchorMessageId: null,
    anchorVersion: 0,
    bottomScrollVersion: 0,
    clearSendError: vi.fn(),
    loadOlder: vi.fn(),
    loadNewer: vi.fn(),
    retry: vi.fn(),
    sendMessage: vi.fn(),
    setNearBottom: vi.fn(),
  };

  it("shows a locked entry CTA before RSVP", async () => {
    groupChatSpy.mockReset();
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
      ...baseChatController,
      conversation: null,
    } as never);
    vi.mocked(useRsvp).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);

    renderPage();

    expect(screen.getByText("활동 채팅은 참석 신청 후 입장할 수 있습니다.")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "활동 참여하고 채팅방 참여하기" }));

    expect(screen.getByText("활동 참여 후 바로 채팅방에 입장합니다.")).toBeInTheDocument();
  });

  it("renders the chat room for RSVP members", () => {
    groupChatSpy.mockReset();
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
      ...baseChatController,
    } as never);
    vi.mocked(useRsvp).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);

    renderPage();

    expect(screen.getByText("activity-chat-room")).toBeInTheDocument();
    expect(groupChatSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        chat: expect.objectContaining({
          conversation: expect.objectContaining({ id: "conv-1" }),
          messages: [],
          olderCursor: null,
          newerCursor: null,
          firstUnreadMessageId: null,
        }),
      }),
    );
  });
});
