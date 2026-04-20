import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module.js";
import { BlockModule } from "../block/block.module.js";

import { ConversationsRepository } from "./repositories/conversations.repository.js";
import { ConversationsController } from "./conversations.controller.js";
import { ConversationsGateway } from "./conversations.gateway.js";
import { ConversationsService } from "./conversations.service.js";
import { ConversationsSseService } from "./conversations-sse.service.js";

@Module({
  imports: [BlockModule, AuthModule],
  controllers: [ConversationsController],
  providers: [
    ConversationsService,
    ConversationsRepository,
    ConversationsSseService,
    ConversationsGateway,
  ],
  exports: [ConversationsRepository],
})
export class ConversationsModule {}
