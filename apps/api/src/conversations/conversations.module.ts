import { Module } from "@nestjs/common";
import { ConversationsController } from "./conversations.controller.js";
import { ConversationsService } from "./conversations.service.js";
import { ConversationsRepository } from "./repositories/conversations.repository.js";
import { ConversationsSseService } from "./conversations-sse.service.js";
import { BlockModule } from "../block/block.module.js";
import { AuthModule } from "../auth/auth.module.js";

@Module({
  imports: [BlockModule, AuthModule],
  controllers: [ConversationsController],
  providers: [ConversationsService, ConversationsRepository, ConversationsSseService],
  exports: [ConversationsRepository],
})
export class ConversationsModule {}
