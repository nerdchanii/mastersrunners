import type { Meta, StoryObj } from "@storybook/react-vite";

import { WorkoutAnalysisMap } from "@/components/workout/WorkoutAnalysisMap";
import { storybookWorkoutTrack } from "@/storybook/storybook-fixtures";

const meta = {
  title: "Surfaces/Workout/WorkoutAnalysisMap",
  component: WorkoutAnalysisMap,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="mx-auto h-[460px] max-w-5xl overflow-hidden rounded-[28px] border border-border/60 bg-background">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof WorkoutAnalysisMap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    track: [...storybookWorkoutTrack],
    activePointIndex: 3,
    highlightedLapRange: {
      startIndex: 1,
      endIndex: 3,
    },
  },
};
