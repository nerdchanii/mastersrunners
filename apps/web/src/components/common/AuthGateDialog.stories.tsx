import type { Meta, StoryObj } from "@storybook/react-vite";

import { AuthGateDialog } from "@/components/common/AuthGateDialog";

const meta = {
  title: "Common/AuthGateDialog",
  component: AuthGateDialog,
  parameters: {
    layout: "padded",
    storybook: {
      route: "/posts/post-1",
    },
  },
  args: {
    open: true,
    onOpenChange: () => undefined,
    title: "참여하려면 로그인이 필요해요",
    description: "좋아요와 댓글은 로그인 후 이용할 수 있습니다.",
    nextPath: "/posts/post-1",
  },
} satisfies Meta<typeof AuthGateDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
