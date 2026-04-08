import type { Meta, StoryObj } from "@storybook/react-vite";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";

const meta = {
  title: "Common/ConfirmDialog",
  component: ConfirmDialog,
  parameters: { layout: "padded" },
  args: {
    open: true,
    onOpenChange: () => undefined,
    title: "크루에서 내보낼까요?",
    description: "이 작업은 되돌릴 수 없습니다.",
    onConfirm: () => undefined,
    variant: "destructive",
  },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
