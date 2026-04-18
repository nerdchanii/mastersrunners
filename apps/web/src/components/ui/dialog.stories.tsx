import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const meta = {
  title: "Primitives/Dialog",
  component: Dialog,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DestructiveConfirm: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>내보내기 확인 열기</Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>멤버를 내보낼까요?</DialogTitle>
          <DialogDescription>
            이 작업 후에는 다시 초대하거나 재가입 요청을 받아야 합니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">취소</Button>
          </DialogClose>
          <Button variant="destructive">내보내기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const AuthGateTone: Story = {
  render: () => (
    <Dialog defaultOpen>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>크루 가입</DialogTitle>
          <DialogDescription>가입 후, 크루와 함께해요.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">나중에</Button>
          </DialogClose>
          <Button>로그인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
