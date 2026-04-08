import type { Meta, StoryObj } from "@storybook/react-vite";

import CrewAttendance from "@/components/crew/CrewAttendance";

const meta = {
  title: "Surfaces/Crew/CrewAttendance",
  component: CrewAttendance,
  parameters: { layout: "padded" },
} satisfies Meta<typeof CrewAttendance>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Admin: Story = {
  args: {
    crewId: "crew-1",
    activityId: "activity-1",
    isAdmin: true,
    isMember: true,
  },
};

export const Member: Story = {
  args: {
    crewId: "crew-1",
    activityId: "activity-1",
    isAdmin: false,
    isMember: true,
  },
};
