import type { Meta, StoryObj } from "@storybook/react-vite";

import { WorkoutLapSplitTable } from "@/components/workout/WorkoutLapSplitTable";
import { storybookWorkoutLaps } from "@/storybook/storybook-fixtures";

const meta = {
  title: "Surfaces/Workout/WorkoutLapSplitTable",
  component: WorkoutLapSplitTable,
  parameters: { layout: "padded" },
} satisfies Meta<typeof WorkoutLapSplitTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    laps: [...storybookWorkoutLaps],
    selectedLapNumber: 2,
    onSelectLap: () => undefined,
  },
};
