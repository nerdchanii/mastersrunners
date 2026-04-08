import type { Meta, StoryObj } from "@storybook/react-vite";

import ProgressBar from "@/components/challenge/ProgressBar";

const meta = {
  title: "Surfaces/Challenge/ProgressBar",
  component: ProgressBar,
  parameters: { layout: "padded" },
  args: {
    current: 54.2,
    target: 120,
    unit: "KM",
  },
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
