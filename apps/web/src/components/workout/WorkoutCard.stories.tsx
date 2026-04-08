import type { Meta, StoryObj } from "@storybook/react-vite";

import WorkoutCard from "@/components/workout/WorkoutCard";

const meta = {
  title: "Surfaces/Workout/WorkoutCard",
  component: WorkoutCard,
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof WorkoutCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PublicRun: Story = {
  args: {
    currentUserId: "story-user-1",
    showShareToggle: false,
    workout: {
      id: "workout-1",
      distance: 12.6,
      duration: 4104,
      pace: 326,
      date: "2026-04-08T05:40:00.000Z",
      memo: "초반은 가볍게, 마지막 3km는 마라톤 목표 페이스로 끌어올렸습니다.",
      visibility: "PUBLIC",
      userId: "story-user-1",
      encodedPolyline: "_p~iF~ps|U_ulLnnqC_mqNvxq`@",
    },
  },
};

export const FollowersOnly: Story = {
  args: {
    showShareToggle: false,
    workout: {
      id: "workout-2",
      distance: 6.2,
      duration: 1898,
      pace: 306,
      date: "2026-04-05T18:10:00.000Z",
      memo: null,
      visibility: "FOLLOWERS",
      encodedPolyline: "_p~iF~ps|U_ulLnnqC_mqNvxq`@",
    },
  },
};
