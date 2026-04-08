import type { Meta, StoryObj } from "@storybook/react-vite";

import CrewAttendanceStats from "@/components/crew/CrewAttendanceStats";

const meta = {
  title: "Surfaces/Crew/CrewAttendanceStats",
  component: CrewAttendanceStats,
  parameters: { layout: "padded" },
} satisfies Meta<typeof CrewAttendanceStats>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    crewId: "crew-1",
  },
};
