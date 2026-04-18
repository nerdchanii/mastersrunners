import type { Meta, StoryObj } from "@storybook/react-vite";
import { Dumbbell, SquarePen } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
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

function ComposerActionsSheet({ defaultOpen = false }: { defaultOpen?: boolean }) {
  return (
    <Sheet defaultOpen={defaultOpen}>
      <SheetTrigger asChild>
        <Button>작성 메뉴 열기</Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader>
          <SheetTitle>무엇을 올릴까요?</SheetTitle>
          <SheetDescription>게시글과 운동 기록 중 바로 시작할 흐름을 선택하세요.</SheetDescription>
        </SheetHeader>
        <div className="mt-6 grid gap-3">
          <SheetClose asChild>
            <button
              type="button"
              className="flex items-center justify-between rounded-2xl border border-border/60 px-4 py-4 text-left transition-colors hover:bg-accent/40"
            >
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">새 게시글</p>
                <p className="text-xs text-muted-foreground">
                  사진, 해시태그, 훈련 기록을 함께 남깁니다.
                </p>
              </div>
              <SquarePen className="size-5 text-muted-foreground" />
            </button>
          </SheetClose>

          <SheetClose asChild>
            <button
              type="button"
              className="flex items-center justify-between rounded-2xl border border-border/60 px-4 py-4 text-left transition-colors hover:bg-accent/40"
            >
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">운동 기록 추가</p>
                <p className="text-xs text-muted-foreground">
                  FIT/GPX 업로드 또는 직접 입력으로 기록합니다.
                </p>
              </div>
              <Dumbbell className="size-5 text-muted-foreground" />
            </button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export const ComposerActions: Story = {
  render: () => <ComposerActionsSheet />,
};

export const OpenComposerActions: Story = {
  render: () => <ComposerActionsSheet defaultOpen />,
};
