import type { Meta, StoryObj } from "@storybook/react-vite";
import { Flame, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";

const meta = {
  title: "Primitives/Badge",
  component: Badge,
  parameters: {
    layout: "padded",
  },
  args: {
    children: "성수 러닝",
    variant: "default",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "outline", "ghost", "destructive", "link"],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>기본</Badge>
      <Badge variant="secondary">보조</Badge>
      <Badge variant="outline">아웃라인</Badge>
      <Badge variant="ghost">고스트</Badge>
      <Badge variant="destructive">주의</Badge>
      <Badge variant="link">링크형</Badge>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>
        <Flame />
        인터벌
      </Badge>
      <Badge variant="secondary">
        <MapPin />
        서울숲
      </Badge>
    </div>
  ),
};
