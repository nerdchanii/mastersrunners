import type { Meta, StoryObj } from "@storybook/react-vite";

import CrewBoardList from "@/components/crew/CrewBoardList";

const meta = {
  title: "Surfaces/Crew/CrewBoardList",
  component: CrewBoardList,
  parameters: { layout: "padded" },
} satisfies Meta<typeof CrewBoardList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    crewId: "crew-1",
    canOpenBoardPosts: true,
    isAuthenticated: true,
    isMember: true,
    isAdmin: true,
    onRequireAuth: () => undefined,
  },
};

export const AuthGate: Story = {
  args: {
    crewId: "crew-1",
    canOpenBoardPosts: false,
    isAuthenticated: false,
    isMember: false,
    isAdmin: false,
    onRequireAuth: () => undefined,
  },
  globals: {
    authMode: "guest",
  },
};
