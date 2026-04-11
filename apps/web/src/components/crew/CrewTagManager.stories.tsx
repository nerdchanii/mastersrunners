import type { Meta, StoryObj } from "@storybook/react-vite";

import CrewTagManager from "@/components/crew/CrewTagManager";
import { storybookCrewMembers, storybookCrewTags } from "@/storybook/storybook-fixtures";

const crewMembers = [...storybookCrewMembers];
const crewTags = storybookCrewTags.map((tag) => ({
  ...tag,
  members: [...tag.members],
}));

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
    members: crewMembers,
    initialTags: crewTags,
  },
};

export const Assigning: Story = {
  args: {
    crewId: "crew-1",
    isAdmin: true,
    members: crewMembers,
    initialTags: crewTags,
    defaultSelectedTag: "tag-1",
  },
};

export const ReadOnly: Story = {
  args: {
    crewId: "crew-1",
    isAdmin: false,
    members: crewMembers,
    initialTags: crewTags,
  },
};

export const Empty: Story = {
  args: {
    crewId: "crew-1",
    isAdmin: true,
    members: crewMembers,
    initialTags: [],
  },
};
