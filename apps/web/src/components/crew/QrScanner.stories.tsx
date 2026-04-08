import type { Meta, StoryObj } from "@storybook/react-vite";

import { QrScanner } from "@/components/crew/QrScanner";

const meta = {
  title: "Surfaces/Crew/QrScanner",
  component: QrScanner,
  parameters: { layout: "padded" },
} satisfies Meta<typeof QrScanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  args: {
    onScan: () => undefined,
    onError: () => undefined,
  },
};
