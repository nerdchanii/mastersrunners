import type { Meta, StoryObj } from "@storybook/react-vite";

import ChallengeTeams from "@/components/challenge/ChallengeTeams";

const meta = {
  title: "Surfaces/Challenge/ChallengeTeams",
  component: ChallengeTeams,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof ChallengeTeams>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Joined: Story = {
  args: {
    challengeId: "challenge-1",
    isJoined: true,
  },
  globals: {
    authMode: "signed-in",
  },
};

export const RequireJoin: Story = {
  args: {
    challengeId: "challenge-1",
    isJoined: false,
  },
  globals: {
    authMode: "signed-in",
  },
};
