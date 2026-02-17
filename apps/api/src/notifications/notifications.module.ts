import { Module } from "@nestjs/common";
import { NotificationsController } from "./notifications.controller.js";
import { NotificationsService } from "./notifications.service.js";
import { NotificationsSseService } from "./notifications-sse.service.js";
import { NotificationRepository } from "./repositories/notification.repository.js";

@Module({
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsSseService,
    NotificationRepository,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
