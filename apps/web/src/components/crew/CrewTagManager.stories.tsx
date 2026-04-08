import type { Meta, StoryObj } from "@storybook/react-vite";

import CrewTagManager from "@/components/crew/CrewTagManager";
import { storybookCrewMembers } from "@/storybook/storybook-fixtures";

const meta = {
  title: "Surfaces/Crew/CrewTagManager",
  component: CrewTagManager,
  parameters: { layout: "padded" },
} satisfies Meta<typeof CrewTagManager>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Admin: Story = {
  args: {
    crewId: "crew-1",
    isAdmin: true,
    members: [...storybookCrewMembers],
  },
};

export const ReadOnly: Story = {
  args: {
    crewId: "crew-1",
    isAdmin: false,
    members: [...storybookCrewMembers],
  },
};
