import type { Meta, StoryObj } from "@storybook/react-vite";

import { InfiniteScroll } from "@/components/common/InfiniteScroll";

const meta = {
  title: "Common/InfiniteScroll",
  component: InfiniteScroll,
  parameters: { layout: "padded" },
} satisfies Meta<typeof InfiniteScroll>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    hasMore: true,
    loading: false,
    onLoadMore: () => undefined,
    children: (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-lg border p-3 text-sm">
            피드 카드 {index + 1}
          </div>
        ))}
      </div>
    ),
  },
};
