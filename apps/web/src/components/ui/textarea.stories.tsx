import type { Meta, StoryObj } from "@storybook/react-vite";

import { Textarea } from "@/components/ui/textarea";

const meta = {
  title: "Primitives/Textarea",
  component: Textarea,
  parameters: { layout: "padded" },
  args: {
    placeholder: "오늘 러닝 메모를 남겨보세요",
    defaultValue: "호흡이 안정적이어서 후반부에 조금 더 밀어봤습니다.",
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <div className="w-[360px]">
      <Textarea {...args} />
    </div>
  ),
};
