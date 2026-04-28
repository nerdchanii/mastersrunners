import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module.js";
import { BlockModule } from "../block/block.module.js";
import { RealtimeModule } from "../realtime/realtime.module.js";

import { ConversationsRepository } from "./repositories/conversations.repository.js";
import { ConversationsController } from "./conversations.controller.js";
import { ConversationsService } from "./conversations.service.js";

@Module({
  imports: [BlockModule, AuthModule, RealtimeModule],
  controllers: [ConversationsController],
  providers: [ConversationsService, ConversationsRepository],
  exports: [ConversationsRepository],
})
export class ConversationsModule {}
