import { MessagesPanel } from "@/components/chat/MessagesPanel";

interface MessagesSidebarProps {
  activeConversationId?: string | null;
}

export function MessagesSidebar({ activeConversationId }: MessagesSidebarProps) {
  return (
    <aside className="hidden h-full w-[24rem] shrink-0 border-r border-border/60 md:block">
      <MessagesPanel compact showPageHeader={false} activeConversationId={activeConversationId} />
    </aside>
  );
}
