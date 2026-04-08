import type { Meta, StoryObj } from "@storybook/react-vite";

import { WorkoutAttachmentPreview } from "@/components/workout/WorkoutAttachmentPreview";
import { storybookWorkout } from "@/storybook/storybook-fixtures";

const meta = {
  title: "Surfaces/Workout/WorkoutAttachmentPreview",
  component: WorkoutAttachmentPreview,
  parameters: { layout: "padded" },
} satisfies Meta<typeof WorkoutAttachmentPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignedIn: Story = {
  args: {
    workout: {
      id: storybookWorkout.id,
      distance: storybookWorkout.distance,
      duration: storybookWorkout.duration,
      pace: storybookWorkout.pace,
      date: storybookWorkout.date,
      elevationGain: 86,
      avgHeartRate: 154,
      avgCadence: 174,
      workoutType: { name: "템포런" },
      route: { encodedPolyline: storybookWorkout.encodedPolyline },
    },
  },
  globals: {
    authMode: "signed-in",
  },
};

export const Guest: Story = {
  args: {
    workout: {
      id: storybookWorkout.id,
      distance: storybookWorkout.distance,
      duration: storybookWorkout.duration,
      pace: storybookWorkout.pace,
      date: storybookWorkout.date,
      elevationGain: 86,
      avgHeartRate: 154,
      avgCadence: 174,
      workoutType: { name: "템포런" },
      route: { encodedPolyline: storybookWorkout.encodedPolyline },
    },
  },
  globals: {
    authMode: "guest",
  },
};
