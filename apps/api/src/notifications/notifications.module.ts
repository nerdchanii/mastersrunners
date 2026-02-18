import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { NotificationsController } from "./notifications.controller.js";
import { NotificationsService } from "./notifications.service.js";
import { NotificationsSseService } from "./notifications-sse.service.js";
import { NotificationRepository } from "./repositories/notification.repository.js";

@Module({
  imports: [AuthModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsSseService,
    NotificationRepository,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
