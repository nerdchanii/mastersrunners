import type { Meta, StoryObj } from "@storybook/react-vite";

import GroupChat from "@/components/crew/GroupChat";
import { storybookCrewChat } from "@/storybook/storybook-fixtures";

const meta = {
  title: "Surfaces/Crew/GroupChat",
  component: GroupChat,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof GroupChat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: "min-h-screen",
    chat: {
      ...storybookCrewChat,
      conversation: storybookCrewChat.conversation
        ? {
            ...storybookCrewChat.conversation,
            participants: [...storybookCrewChat.conversation.participants],
          }
        : null,
      messages: [...storybookCrewChat.messages],
      olderCursor: storybookCrewChat.olderCursor ?? null,
      newerCursor: storybookCrewChat.newerCursor ?? null,
      firstUnreadMessageId: storybookCrewChat.firstUnreadMessageId ?? null,
      loading: false,
      error: null,
      loadingOlder: false,
      loadingNewer: false,
      sending: false,
      sendError: null,
      pendingNewMessages: 0,
      anchorMessageId: null,
      anchorVersion: 0,
      bottomScrollVersion: 0,
      clearSendError: () => undefined,
      loadOlder: async () => undefined,
      loadNewer: async () => undefined,
      retry: () => undefined,
      sendMessage: async () => true,
      setNearBottom: () => undefined,
    },
  },
};

export const DraftMessage: Story = {
  args: {
    className: "min-h-screen",
    chat: {
      ...storybookCrewChat,
      conversation: storybookCrewChat.conversation
        ? {
            ...storybookCrewChat.conversation,
            participants: [...storybookCrewChat.conversation.participants],
          }
        : null,
      messages: [...storybookCrewChat.messages],
      olderCursor: storybookCrewChat.olderCursor ?? null,
      newerCursor: storybookCrewChat.newerCursor ?? null,
      firstUnreadMessageId: storybookCrewChat.firstUnreadMessageId ?? null,
      loading: false,
      error: null,
      loadingOlder: false,
      loadingNewer: false,
      sending: false,
      sendError: null,
      pendingNewMessages: 0,
      anchorMessageId: null,
      anchorVersion: 0,
      bottomScrollVersion: 0,
      clearSendError: () => undefined,
      loadOlder: async () => undefined,
      loadNewer: async () => undefined,
      retry: () => undefined,
      sendMessage: async () => true,
      setNearBottom: () => undefined,
    },
    initialMessage: "급수 지점은 잠실대교 아래로 맞출게요.",
  },
};

export const EmptyConversation: Story = {
  args: {
    className: "min-h-screen",
    chat: {
      conversation: null,
      messages: [],
      olderCursor: null,
      newerCursor: null,
      firstUnreadMessageId: null,
      loading: false,
      error: null,
      loadingOlder: false,
      loadingNewer: false,
      sending: false,
      sendError: null,
      pendingNewMessages: 0,
      anchorMessageId: null,
      anchorVersion: 0,
      bottomScrollVersion: 0,
      clearSendError: () => undefined,
      loadOlder: async () => undefined,
      loadNewer: async () => undefined,
      retry: () => undefined,
      sendMessage: async () => true,
      setNearBottom: () => undefined,
    },
  },
};
