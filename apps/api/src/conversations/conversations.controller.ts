import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Sse,
  MessageEvent,
} from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { Observable } from "rxjs";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard.js";
import { JwtSseGuard } from "../auth/guards/jwt-sse.guard.js";
import { ConversationsService } from "./conversations.service.js";
import { ConversationsSseService } from "./conversations-sse.service.js";
import { CreateConversationDto } from "./dto/create-conversation.dto.js";
import { SendMessageDto } from "./dto/send-message.dto.js";

@Controller("conversations")
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly sseService: ConversationsSseService,
  ) {}

  @Post()
  async startConversation(
    @Req() req: { user: { userId: string } },
    @Body() dto: CreateConversationDto,
  ) {
    return this.conversationsService.startConversation(req.user.userId, dto.participantId);
  }

  @Get()
  async getConversations(
    @Req() req: { user: { userId: string } },
    @Query("cursor") cursor?: string,
    @Query("limit") limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    return this.conversationsService.getConversations(
      req.user.userId,
      cursor,
      parsedLimit,
    );
  }

  @Get(":id")
  async getConversation(
    @Req() req: { user: { userId: string } },
    @Param("id") id: string,
    @Query("cursor") cursor?: string,
    @Query("limit") limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    return this.conversationsService.getConversation(
      id,
      req.user.userId,
      cursor,
      parsedLimit,
    );
  }

  @Post(":id/messages")
  async sendMessage(
    @Req() req: { user: { userId: string } },
    @Param("id") id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.conversationsService.sendMessage(id, req.user.userId, dto.content);
  }

  @Patch(":id/read")
  async markAsRead(@Req() req: { user: { userId: string } }, @Param("id") id: string) {
    return this.conversationsService.markAsRead(id, req.user.userId);
  }

  @Delete("messages/:id")
  async deleteMessage(
    @Req() req: { user: { userId: string } },
    @Param("id") id: string,
  ) {
    return this.conversationsService.deleteMessage(id, req.user.userId);
  }

  @Sse("sse")
  @UseGuards(JwtSseGuard)
  @SkipThrottle()
  sse(@Req() req: { user: { userId: string } }): Observable<MessageEvent> {
    return this.sseService.addConnection(req.user.userId);
  }
}
