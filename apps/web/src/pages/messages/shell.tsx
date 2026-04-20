import { useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { ChatSplitLayout } from "@/components/chat/ChatSplitLayout";
import { MessagesSidebar } from "@/components/chat/MessagesSidebar";
import { useConversations } from "@/hooks/useMessages";
import { useAuth } from "@/lib/auth-context";
import {
  type ConversationListItem,
  getConversationOtherUser,
  getConversationRoomMeta,
} from "@/lib/message-room";

export interface SelectedConversationSummary {
  conversation: ConversationListItem;
  meta: ReturnType<typeof getConversationRoomMeta>;
  otherUser: ReturnType<typeof getConversationOtherUser>;
}

export default function MessagesShell() {
  const location = useLocation();
  const { user } = useAuth();
  const { data } = useConversations();

  const conversations = useMemo(
    () => data?.pages.flatMap((page) => page?.data ?? []) ?? [],
    [data],
  );

  const selectedConversation = useMemo<SelectedConversationSummary | null>(() => {
    const conversation = conversations.find((item) => {
      const meta = getConversationRoomMeta(item, user?.id);
      return meta.href === location.pathname;
    });

    if (!conversation) {
      return null;
    }

    return {
      conversation,
      meta: getConversationRoomMeta(conversation, user?.id),
      otherUser: getConversationOtherUser(conversation, user?.id),
    };
  }, [conversations, location.pathname, user?.id]);

  return (
    <ChatSplitLayout
      sidebar={<MessagesSidebar activeConversationId={selectedConversation?.conversation.id} />}
    >
      <Outlet context={{ selectedConversation }} />
    </ChatSplitLayout>
  );
}
