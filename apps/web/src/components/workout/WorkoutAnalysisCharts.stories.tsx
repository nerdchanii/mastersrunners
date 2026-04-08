import type { Meta, StoryObj } from "@storybook/react-vite";

import { WorkoutAnalysisCharts } from "@/components/workout/WorkoutAnalysisCharts";
import { storybookWorkoutTrack } from "@/storybook/storybook-fixtures";

const meta = {
  title: "Surfaces/Workout/WorkoutAnalysisCharts",
  component: WorkoutAnalysisCharts,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-5xl bg-background p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof WorkoutAnalysisCharts>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    track: [...storybookWorkoutTrack],
    activePointIndex: 2,
    highlightedLapRange: {
      startDistanceKm: 1,
      endDistanceKm: 3,
    },
    onSelectPoint: () => undefined,
  },
};
