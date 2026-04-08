import type { Meta, StoryObj } from "@storybook/react-vite";

import CrewMemberList from "@/components/crew/CrewMemberList";
import { storybookCrewMembers, storybookUser } from "@/storybook/storybook-fixtures";

const meta = {
  title: "Surfaces/Crew/CrewMemberList",
  component: CrewMemberList,
  parameters: { layout: "padded" },
} satisfies Meta<typeof CrewMemberList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OwnerActions: Story = {
  args: {
    crewId: "crew-1",
    members: [...storybookCrewMembers],
    currentUserId: storybookUser.id,
    currentUserRole: "OWNER",
    onUpdate: () => undefined,
  },
};

export const MemberView: Story = {
  args: {
    crewId: "crew-1",
    members: [...storybookCrewMembers],
    currentUserId: "user-2",
    currentUserRole: "MEMBER",
    onUpdate: () => undefined,
  },
};
