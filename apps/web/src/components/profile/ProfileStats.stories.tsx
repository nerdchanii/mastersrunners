import type { Meta, StoryObj } from "@storybook/react-vite";

import { ProfileStats } from "@/components/profile/ProfileStats";
import { storybookProfileStats } from "@/storybook/storybook-fixtures";

const meta = {
  title: "Surfaces/Profile/ProfileStats",
  component: ProfileStats,
  parameters: { layout: "padded" },
  args: {
    ...storybookProfileStats,
  },
} satisfies Meta<typeof ProfileStats>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const PublicRunner: Story = {
  args: {
    postCount: 17,
    followerCount: 128,
    followingCount: 84,
    crewCount: 6,
  },
};
