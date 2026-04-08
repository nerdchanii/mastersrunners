import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const meta = {
  title: "Primitives/Select",
  component: Select,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

function SelectPreview() {
  const [value, setValue] = useState("tempo");

  return (
    <div className="w-[240px]">
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger>
          <SelectValue placeholder="훈련 유형 선택" />
        </SelectTrigger>
        <SelectContent>
          <SelectLabel>러닝 타입</SelectLabel>
          <SelectItem value="easy">이지런</SelectItem>
          <SelectItem value="tempo">템포런</SelectItem>
          <SelectItem value="long">롱런</SelectItem>
          <SelectSeparator />
          <SelectItem value="rest">휴식</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export const Playground: Story = {
  render: () => <SelectPreview />,
};
