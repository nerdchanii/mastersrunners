import { useLocation } from "react-router-dom";

import { useAuth } from "@/lib/auth-context";

import { useUnreadMessageCount } from "./useMessages";
import { useUnreadNotificationCount } from "./useNotifications";

export function useUnreadCounts() {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();
  const unreadMessages = useUnreadMessageCount({ enabled: isAuthenticated });
  const unreadNotifications = useUnreadNotificationCount({ enabled: isAuthenticated });

  const hideMessageBadge = pathname === "/messages" || pathname.startsWith("/messages/");
  const hideNotificationBadge =
    pathname === "/notifications" || pathname.startsWith("/notifications/");

  if (!isAuthenticated) {
    return {
      messages: 0,
      notifications: 0,
    };
  }

  return {
    messages: hideMessageBadge ? 0 : (unreadMessages.data ?? 0),
    notifications: hideNotificationBadge ? 0 : (unreadNotifications.data ?? 0),
  };
}
