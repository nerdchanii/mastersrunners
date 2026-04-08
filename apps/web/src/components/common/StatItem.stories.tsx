import type { Meta, StoryObj } from "@storybook/react-vite";

import { StatItem } from "@/components/common/StatItem";

const meta = {
  title: "Common/StatItem",
  component: StatItem,
  parameters: { layout: "padded" },
  args: {
    value: "12.4",
    label: "km",
    size: "default",
  },
} satisfies Meta<typeof StatItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
