import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Req,
  UseGuards,
  Sse,
  MessageEvent,
} from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { Observable } from "rxjs";
import { NotificationsService } from "./notifications.service.js";
import { NotificationsSseService } from "./notifications-sse.service.js";
import { JwtSseGuard } from "../auth/guards/jwt-sse.guard.js";

@Controller("notifications")
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly sseService: NotificationsSseService,
  ) {}

  @Get()
  getNotifications(
    @Req() req: { user: { userId: string } },
    @Query("cursor") cursor?: string,
    @Query("limit") limit?: string,
    @Query("unreadOnly") unreadOnly?: string,
  ) {
    return this.notificationsService.getNotifications(req.user.userId, {
      cursor,
      limit: limit ? parseInt(limit, 10) : undefined,
      unreadOnly: unreadOnly === "true",
    });
  }

  @Get("unread-count")
  getUnreadCount(@Req() req: { user: { userId: string } }) {
    return this.notificationsService.getUnreadCount(req.user.userId);
  }

  @Patch(":id/read")
  markAsRead(
    @Param("id") id: string,
    @Req() req: { user: { userId: string } },
  ) {
    return this.notificationsService.markAsRead(id, req.user.userId);
  }

  @Patch("read-all")
  markAllAsRead(@Req() req: { user: { userId: string } }) {
    return this.notificationsService.markAllAsRead(req.user.userId);
  }

  @Sse("sse")
  @UseGuards(JwtSseGuard)
  @SkipThrottle()
  sse(@Req() req: { user: { userId: string } }): Observable<MessageEvent> {
    return this.sseService.addConnection(req.user.userId);
  }
}
