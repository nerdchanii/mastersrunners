import type { Meta, StoryObj } from "@storybook/react-vite";

import LeaderboardTable from "@/components/challenge/LeaderboardTable";
import { storybookUser } from "@/storybook/storybook-fixtures";

const meta = {
  title: "Surfaces/Challenge/LeaderboardTable",
  component: LeaderboardTable,
  parameters: { layout: "padded" },
} satisfies Meta<typeof LeaderboardTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    goalType: "DISTANCE",
    goalValue: 120,
    entries: [
      {
        rank: 1,
        progress: 93.2,
        user: {
          id: "user-2",
          name: "이페이서",
          profileImage: null,
        },
      },
      {
        rank: 2,
        progress: 88.5,
        user: {
          id: storybookUser.id,
          name: storybookUser.name,
          profileImage: storybookUser.profileImage,
        },
      },
    ],
  },
  globals: {
    authMode: "signed-in",
  },
};

export const Loading: Story = {
  args: {
    goalType: "DISTANCE",
    goalValue: 120,
    entries: [],
    isLoading: true,
  },
};
