import type { Meta, StoryObj } from "@storybook/react-vite";

import TeamLeaderboard from "@/components/challenge/TeamLeaderboard";

const meta = {
  title: "Surfaces/Challenge/TeamLeaderboard",
  component: TeamLeaderboard,
  parameters: { layout: "padded" },
} satisfies Meta<typeof TeamLeaderboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    challengeId: "challenge-1",
  },
};

export const Empty: Story = {
  args: {
    challengeId: "challenge-1",
  },
  parameters: {
    storybook: {
      apiScenario: "empty",
    },
  },
};
