import type { Meta, StoryObj } from "@storybook/react-vite";

import { ScrollArea } from "@/components/ui/scroll-area";

const meta = {
  title: "Primitives/ScrollArea",
  component: ScrollArea,
  parameters: { layout: "padded" },
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <ScrollArea className="h-48 w-[320px] rounded-xl border p-4">
      <div className="space-y-3">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="rounded-lg border border-border/60 p-3 text-sm">
            서울숲 새벽 러닝 공지 #{index + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};
