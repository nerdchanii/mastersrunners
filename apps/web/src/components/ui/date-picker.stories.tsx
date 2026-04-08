import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { DatePickerField } from "@/components/ui/date-picker";

const meta = {
  title: "Primitives/DatePicker",
  component: DatePickerField,
  parameters: { layout: "padded" },
} satisfies Meta<typeof DatePickerField>;

export default meta;
type Story = StoryObj<typeof meta>;

function DatePickerPreview() {
  const [value, setValue] = useState("2026-04-08");

  return (
    <div className="w-[320px]">
      <DatePickerField value={value} onChange={setValue} />
    </div>
  );
}

export const Playground: Story = {
  args: {
    value: "2026-04-08",
    onChange: () => undefined,
  },
  render: () => <DatePickerPreview />,
};
