import type { Meta, StoryObj } from "@storybook/react-vite";

import ChallengeCard from "@/components/challenge/ChallengeCard";
import { storybookChallenge } from "@/storybook/storybook-fixtures";

const meta = {
  title: "Surfaces/Challenge/ChallengeCard",
  component: ChallengeCard,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChallengeCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    challenge: storybookChallenge,
  },
};
