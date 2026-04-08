import type { Meta, StoryObj } from "@storybook/react-vite";

import { WorkoutDetail } from "@/components/workout/WorkoutDetail";

const meta = {
  title: "Surfaces/Workout/WorkoutDetail",
  component: WorkoutDetail,
  parameters: { layout: "padded" },
} satisfies Meta<typeof WorkoutDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    distance: 12.4,
    duration: 4020,
    pace: 324,
    date: "2026-04-08T06:20:00.000Z",
    memo: "마지막 3km 구간에서 의도적으로 리듬을 올렸습니다.",
    visibility: "PUBLIC",
    workoutType: {
      id: "tempo",
      name: "템포런",
      category: "QUALITY",
    },
    shoe: {
      id: "shoe-1",
      brand: "Nike",
      model: "Zoom Fly 6",
    },
  },
};
