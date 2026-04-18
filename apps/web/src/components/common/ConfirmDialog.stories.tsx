import type { Meta, StoryObj } from "@storybook/react-vite";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";

const meta = {
  title: "Common/ConfirmDialog",
  component: ConfirmDialog,
  parameters: { layout: "padded" },
  args: {
    open: true,
    onOpenChange: () => undefined,
    onConfirm: () => undefined,
  },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LeaveCrew: Story = {
  args: {
    title: "크루를 탈퇴할까요?",
    description: "게시판과 채팅은 바로 볼 수 없게 됩니다.",
    confirmLabel: "탈퇴",
    variant: "destructive",
  },
};

export const RemoveMember: Story = {
  args: {
    title: "멤버를 내보낼까요?",
    description: "다시 초대하거나 재가입 요청을 받아야 합니다.",
    confirmLabel: "내보내기",
    cancelLabel: "유지",
    variant: "destructive",
  },
};

export const LoadingState: Story = {
  args: {
    title: "태그를 삭제할까요?",
    description: "태그에 묶인 멤버 표시는 함께 사라집니다.",
    confirmLabel: "태그 삭제",
    variant: "destructive",
    loading: true,
  },
};
