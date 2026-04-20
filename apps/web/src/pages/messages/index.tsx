import { MessagesPanel } from "@/components/chat/MessagesPanel";

export default function MessagesPage() {
  return (
    <>
      <div className="md:hidden">
        <MessagesPanel showPageHeader={false} />
      </div>

      <div className="hidden h-full md:block">
        <div className="flex h-full flex-col overflow-hidden">
          <div className="flex h-16 items-center border-b border-border/60 px-4">
            <span className="text-sm font-medium text-muted-foreground">
              선택된 대화가 없습니다
            </span>
          </div>
          <div className="flex flex-1 items-center justify-center px-6">
            <div className="text-center text-sm text-muted-foreground">
              왼쪽 목록에서 대화를 선택하세요
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
