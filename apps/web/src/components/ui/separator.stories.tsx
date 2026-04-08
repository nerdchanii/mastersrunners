import type { Meta, StoryObj } from "@storybook/react-vite";

import { Separator } from "@/components/ui/separator";

const meta = {
  title: "Primitives/Separator",
  component: Separator,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div className="w-[320px] space-y-3">
      <div>피드</div>
      <Separator />
      <div>크루</div>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-12 items-center gap-4">
      <span>거리</span>
      <Separator orientation="vertical" />
      <span>페이스</span>
    </div>
  ),
};
