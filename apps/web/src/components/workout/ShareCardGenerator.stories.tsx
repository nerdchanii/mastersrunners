import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ShareCardGenerator } from "@/components/workout/ShareCardGenerator";

function ShareCardPreview() {
  const [open, setOpen] = useState(true);

  return (
    <div className="space-y-4">
      <Button variant="outline" onClick={() => setOpen(true)}>
        카드 다시 열기
      </Button>
      <ShareCardGenerator
        open={open}
        onOpenChange={setOpen}
        data={{
          distance: 12.4,
          duration: 4020,
          pace: 324,
          date: "2026-04-08T06:20:00.000Z",
          userName: "kimrunner",
        }}
      />
    </div>
  );
}

const meta = {
  title: "Surfaces/Workout/ShareCardGenerator",
  component: ShareCardGenerator,
  parameters: { layout: "padded" },
} satisfies Meta<typeof ShareCardGenerator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Opened: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    data: {
      distance: 12.4,
      duration: 4020,
      pace: 324,
      date: "2026-04-08T06:20:00.000Z",
      userName: "kimrunner",
    },
  },
  render: () => <ShareCardPreview />,
};
