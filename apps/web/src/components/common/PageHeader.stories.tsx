import type { Meta, StoryObj } from "@storybook/react-vite";

import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";

const meta = {
  title: "Common/PageHeader",
  component: PageHeader,
  parameters: { layout: "padded" },
  args: {
    title: "내 크루",
    description: "참여 중인 크루와 최근 활동을 빠르게 확인합니다.",
    actions: <Button size="sm">새 크루 만들기</Button>,
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
