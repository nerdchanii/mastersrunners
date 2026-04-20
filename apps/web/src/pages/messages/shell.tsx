import { Outlet } from "react-router-dom";

import { ChatSplitLayout } from "@/components/chat/ChatSplitLayout";
import { MessagesSidebar } from "@/components/chat/MessagesSidebar";

export default function MessagesShell() {
  return (
    <ChatSplitLayout sidebar={<MessagesSidebar />}>
      <Outlet />
    </ChatSplitLayout>
  );
}
