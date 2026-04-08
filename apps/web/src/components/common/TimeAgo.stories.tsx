import type { Meta, StoryObj } from "@storybook/react-vite";

import { TimeAgo } from "@/components/common/TimeAgo";

const meta = {
  title: "Common/TimeAgo",
  component: TimeAgo,
  parameters: { layout: "padded" },
} satisfies Meta<typeof TimeAgo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MinutesAgo: Story = {
  args: {
    date: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
};
