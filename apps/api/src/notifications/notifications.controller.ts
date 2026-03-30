import {
  Controller,
  Get,
  MessageEvent,
  Param,
  Patch,
  Query,
  Req,
  Sse,
  UseGuards,
} from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { Observable } from "rxjs";

import { JwtSseGuard } from "../auth/guards/jwt-sse.guard.js";
import { Public } from "../common/decorators/public.decorator.js";

import { ListNotificationsQueryDto } from "./dto/list-notifications-query.dto.js";
import { NotificationsService } from "./notifications.service.js";
import { NotificationsSseService } from "./notifications-sse.service.js";

@Controller("notifications")
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly sseService: NotificationsSseService,
  ) {}

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

  @Sse("sse")
  @Public()
  @UseGuards(JwtSseGuard)
  @SkipThrottle()
  sse(@Req() req: { user: { userId: string } }): Observable<MessageEvent> {
    return this.sseService.addConnection(req.user.userId);
  }
}
