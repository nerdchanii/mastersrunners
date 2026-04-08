import type { Meta, StoryObj } from "@storybook/react-vite";

import FeedCard from "@/components/feed/FeedCard";
import { storybookWorkout } from "@/storybook/storybook-fixtures";

const meta = {
  title: "Surfaces/Feed/FeedCard",
  component: FeedCard,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-xl bg-background py-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FeedCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    workout: storybookWorkout,
  },
};
