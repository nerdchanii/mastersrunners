import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const meta = {
  title: "Primitives/Checkbox",
  component: Checkbox,
  parameters: { layout: "padded" },
  args: { disabled: false },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

function CheckboxPreview(args: React.ComponentProps<typeof Checkbox>) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <Checkbox
        {...args}
        id="newsletter"
        checked={checked}
        onCheckedChange={(value) => setChecked(value === true)}
      />
      <Label htmlFor="newsletter">주간 러닝 요약 받기</Label>
    </div>
  );
}

export const Playground: Story = {
  render: (args) => <CheckboxPreview {...args} />,
};
