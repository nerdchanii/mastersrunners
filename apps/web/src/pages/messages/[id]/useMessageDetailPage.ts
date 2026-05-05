import {
  type ChatWindowController,
  type ChatWindowMessage,
  useChatWindow,
} from "@/hooks/useChatWindow";

export type Message = ChatWindowMessage;
export type Conversation = ChatWindowController["conversation"];

export function useMessageDetailPage(id?: string): ChatWindowController {
  return useChatWindow({
    path: `/conversations/${id}`,
    enabled: Boolean(id),
  });
}
