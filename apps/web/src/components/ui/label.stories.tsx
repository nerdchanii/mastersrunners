import type { Meta, StoryObj } from "@storybook/react-vite";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const meta = {
  title: "Primitives/Label",
  component: Label,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithField: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Checkbox id="policy" defaultChecked />
      <Label htmlFor="policy">공개 피드에 활동 공유</Label>
    </div>
  ),
};
