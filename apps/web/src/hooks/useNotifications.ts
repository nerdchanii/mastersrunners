import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface Notification {
  id: string;
  type:
    | "POST_LIKE"
    | "POST_COMMENT"
    | "WORKOUT_LIKE"
    | "WORKOUT_COMMENT"
    | "FOLLOW_REQUEST"
    | "FOLLOW_ACCEPTED"
    | "CREW_JOIN"
    | "CREW_INVITE"
    | "DM_RECEIVED"
    | "COMMENT_REPLY"
    | "MENTION";
  isRead: boolean;
  createdAt: string;
  actor: {
    id: string;
    name: string;
    profileImage: string | null;
  } | null;
  targetId: string | null;
  targetType: "POST" | "WORKOUT" | "CREW" | "CONVERSATION" | null;
  message: string;
}

export interface NotificationPage {
  items: Notification[];
  nextCursor: string | null;
  total?: number;
}

export interface UnreadCountResponse {
  count: number;
}

export const notificationKeys = {
  all: ["notifications"] as const,
  list: () => [...notificationKeys.all, "list"] as const,
  unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
};

export function useNotifications() {
  return useInfiniteQuery({
    queryKey: notificationKeys.list(),
    queryFn: ({ pageParam }) => {
      const cursor = pageParam ? `&cursor=${pageParam}` : "";
      return api.fetch<NotificationPage>(`/notifications?limit=20${cursor}`);
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
    staleTime: 1000 * 30,
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => api.fetch<UnreadCountResponse>("/notifications/unread-count"),
    staleTime: 1000 * 30,
    select: (data) => data?.count ?? 0,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      api.fetch(`/notifications/${notificationId}/read`, { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      api.fetch("/notifications/read-all", { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
