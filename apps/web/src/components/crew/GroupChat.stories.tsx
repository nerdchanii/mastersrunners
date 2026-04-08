import type { Meta, StoryObj } from "@storybook/react-vite";

import GroupChat from "@/components/crew/GroupChat";
import { storybookCrewChat } from "@/storybook/storybook-fixtures";

const meta = {
  title: "Surfaces/Crew/GroupChat",
  component: GroupChat,
  parameters: { layout: "padded" },
} satisfies Meta<typeof GroupChat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    crewId: "crew-1",
    data: {
      ...storybookCrewChat,
      conversation: storybookCrewChat.conversation
        ? {
            ...storybookCrewChat.conversation,
            participants: [...storybookCrewChat.conversation.participants],
          }
        : null,
      messages: [...storybookCrewChat.messages],
    },
    isLoading: false,
    title: "크루 채팅",
    subtitle: "내일 아침 러닝 집결지 조율",
  },
};

export const EmptyConversation: Story = {
  args: {
    crewId: "crew-1",
    data: {
      conversation: null,
      messages: [],
      nextCursor: null,
    },
    isLoading: false,
    title: "크루 채팅",
  },
};
