import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const meta = {
  title: "Primitives/Switch",
  component: Switch,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

function SwitchPreview() {
  const [checked, setChecked] = useState(true);

  return (
    <div className="flex items-center gap-3">
      <Switch checked={checked} onCheckedChange={setChecked} />
      <Label>활동 자동 공개</Label>
    </div>
  );
}

export const Playground: Story = {
  render: () => <SwitchPreview />,
};
