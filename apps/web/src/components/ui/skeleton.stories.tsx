import type { Meta, StoryObj } from "@storybook/react-vite";

import { Skeleton } from "@/components/ui/skeleton";

const meta = {
  title: "Primitives/Skeleton",
  component: Skeleton,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FeedItem: Story = {
  render: () => (
    <div className="w-[360px] space-y-3 rounded-xl border bg-card p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  ),
};
