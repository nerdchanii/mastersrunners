import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "@/components/ui/button";
import {
  Dialog,
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

export const Playground: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>삭제 확인 열기</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>게시글을 삭제할까요?</DialogTitle>
          <DialogDescription>삭제 후에는 복구할 수 없습니다.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">취소</Button>
          <Button variant="destructive">삭제</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
