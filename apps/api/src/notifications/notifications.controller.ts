import { Controller, Get, Param, Patch, Query, Req } from "@nestjs/common";

import { ListNotificationsQueryDto } from "./dto/list-notifications-query.dto.js";
import { NotificationsService } from "./notifications.service.js";

@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getNotifications(
    @Req() req: { user: { userId: string } },
    @Query() query: ListNotificationsQueryDto,
  ) {
    return this.notificationsService.getNotifications(req.user.userId, {
      cursor: query.cursor,
      limit: query.resolveOptionalLimit(),
      unreadOnly: query.unreadOnly ?? false,
    });
  }

  @Get("unread-count")
  getUnreadCount(@Req() req: { user: { userId: string } }) {
    return this.notificationsService.getUnreadCount(req.user.userId);
  }

  @Patch(":id/read")
  markAsRead(@Param("id") id: string, @Req() req: { user: { userId: string } }) {
    return this.notificationsService.markAsRead(id, req.user.userId);
  }

  @Patch("read-all")
  markAllAsRead(@Req() req: { user: { userId: string } }) {
    return this.notificationsService.markAllAsRead(req.user.userId);
  }
}
