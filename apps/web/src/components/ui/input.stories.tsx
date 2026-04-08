import type { Meta, StoryObj } from "@storybook/react-vite";

import { Input } from "@/components/ui/input";

const meta = {
  title: "Primitives/Input",
  component: Input,
  parameters: {
    layout: "padded",
  },
  args: {
    type: "text",
    placeholder: "크루 이름을 입력하세요",
    disabled: false,
  },
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "number", "password", "search"],
    },
    disabled: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <div className="w-[320px]">
      <Input {...args} />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="w-[320px] space-y-3">
      <Input placeholder="일반 입력" />
      <Input placeholder="검색어를 입력하세요" type="search" />
      <Input placeholder="비활성화 상태" disabled />
    </div>
  ),
};
