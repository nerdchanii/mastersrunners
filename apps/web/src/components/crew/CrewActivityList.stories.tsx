import type { Meta, StoryObj } from "@storybook/react-vite";

import CrewActivityList from "@/components/crew/CrewActivityList";

const meta = {
  title: "Surfaces/Crew/CrewActivityList",
  component: CrewActivityList,
  parameters: { layout: "padded" },
} satisfies Meta<typeof CrewActivityList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MemberView: Story = {
  args: {
    crewId: "crew-1",
    isAdmin: true,
    isAuthenticated: true,
    isMember: true,
    canOpenActivityDetails: true,
    onRequireAuth: () => undefined,
  },
};

export const GuestView: Story = {
  args: {
    crewId: "crew-1",
    isAdmin: false,
    isAuthenticated: false,
    isMember: false,
    canOpenActivityDetails: false,
    onRequireAuth: () => undefined,
  },
  globals: {
    authMode: "guest",
  },
};
