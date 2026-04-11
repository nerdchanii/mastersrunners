import type { Meta, StoryObj } from "@storybook/react-vite";

import CrewAttendanceStats from "@/components/crew/CrewAttendanceStats";
import { storybookCrewAttendanceStats } from "@/storybook/storybook-fixtures";

const crewAttendanceStats = {
  ...storybookCrewAttendanceStats,
  activities: [...storybookCrewAttendanceStats.activities],
  memberStats: [...storybookCrewAttendanceStats.memberStats],
};

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
    initialData: crewAttendanceStats,
  },
};

export const Empty: Story = {
  args: {
    crewId: "crew-1",
    initialData: null,
  },
};

export const Loading: Story = {
  args: {
    crewId: "crew-1",
    initialLoading: true,
    initialData: crewAttendanceStats,
  },
};
