import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module.js";
import { RealtimeModule } from "../realtime/realtime.module.js";

import { NotificationRepository } from "./repositories/notification.repository.js";
import { NotificationsController } from "./notifications.controller.js";
import { NotificationsService } from "./notifications.service.js";

@Module({
  imports: [AuthModule, RealtimeModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationRepository],
  exports: [NotificationsService],
})
export class NotificationsModule {}
