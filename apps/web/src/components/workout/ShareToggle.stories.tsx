import type { Meta, StoryObj } from "@storybook/react-vite";

import ShareToggle from "@/components/workout/ShareToggle";

const meta = {
  title: "Surfaces/Workout/ShareToggle",
  component: ShareToggle,
  parameters: { layout: "padded" },
} satisfies Meta<typeof ShareToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    workoutId: "workout-1",
    initialVisibility: "FOLLOWERS",
  },
};
