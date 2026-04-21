import { type ChatWindowController, useChatWindow } from "@/hooks/useChatWindow";

export type GroupChatController = ChatWindowController;

export function useCrewChat(crewId: string, enabled = true): GroupChatController {
  return useChatWindow({
    path: `/crews/${crewId}/chat`,
    enabled: !!crewId && enabled,
  });
}

export function useActivityChat(crewId: string, activityId: string): GroupChatController {
  return useChatWindow({
    path: `/crews/${crewId}/activities/${activityId}/chat`,
    enabled: !!crewId && !!activityId,
  });
}
