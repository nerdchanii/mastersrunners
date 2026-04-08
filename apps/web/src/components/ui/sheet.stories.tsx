import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const meta = {
  title: "Primitives/Sheet",
  component: Sheet,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BottomSheet: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>작성 메뉴 열기</Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader>
          <SheetTitle>무엇을 올릴까요?</SheetTitle>
          <SheetDescription>게시글이나 워크아웃을 바로 추가할 수 있습니다.</SheetDescription>
        </SheetHeader>
        <div className="space-y-2 px-4 pb-4">
          <Button className="w-full">게시글 작성</Button>
          <Button className="w-full" variant="outline">
            워크아웃 추가
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  ),
};
