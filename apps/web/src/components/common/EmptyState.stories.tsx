import type { Meta, StoryObj } from "@storybook/react-vite";
import { Footprints, Search } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";

const meta = {
  title: "Primitives/EmptyState",
  component: EmptyState,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof EmptyState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FeedGap: Story = {
  args: {
    icon: Footprints,
    title: "아직 러닝 기록이 없어요",
    description: "오늘 첫 워크아웃을 올리고 피드를 채워보세요.",
    actionLabel: "워크아웃 추가",
    onAction: () => undefined,
    className: "w-[340px] rounded-3xl border border-dashed border-border/70 bg-card",
  },
};

export const SearchMiss: Story = {
  args: {
    icon: Search,
    title: "조건에 맞는 러너를 찾지 못했어요",
    description: "지역이나 해시태그를 조금 더 넓혀 다시 찾아보세요.",
    className: "w-[340px] rounded-3xl bg-muted/40",
  },
};
