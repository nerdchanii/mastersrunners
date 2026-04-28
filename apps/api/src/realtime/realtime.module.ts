import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module.js";
import { BlockModule } from "../block/block.module.js";
import { BlockRepository } from "../block/repositories/block.repository.js";
import { ConversationsRepository } from "../conversations/repositories/conversations.repository.js";
import { NotificationRepository } from "../notifications/repositories/notification.repository.js";

import { RealtimeGateway } from "./realtime.gateway.js";
import { RealtimeEventsService } from "./realtime-events.service.js";

@Module({
  imports: [AuthModule, BlockModule],
  providers: [
    RealtimeEventsService,
    RealtimeGateway,
    ConversationsRepository,
    NotificationRepository,
    BlockRepository,
  ],
  exports: [RealtimeEventsService],
})
export class RealtimeModule {}
