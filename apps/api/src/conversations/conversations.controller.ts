import {
  Body,
  Controller,
  Delete,
  Get,
  MessageEvent,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Sse,
  UseGuards,
} from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import type { Request } from "express";
import { Observable } from "rxjs";

import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard.js";
import { JwtSseGuard } from "../auth/guards/jwt-sse.guard.js";
import { Public } from "../common/decorators/public.decorator.js";
import { CursorLimitQueryDto } from "../common/dto/cursor-limit-query.dto.js";

import { ChatWindowQueryDto } from "./dto/chat-window-query.dto.js";
import { CreateConversationDto } from "./dto/create-conversation.dto.js";
import { SendMessageDto } from "./dto/send-message.dto.js";
import {
  ConversationDetailResponse,
  ConversationListResponse,
  ConversationsService,
} from "./conversations.service.js";
import { ConversationsSseService } from "./conversations-sse.service.js";

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
    @Query() query: CursorLimitQueryDto,
  ): Promise<ConversationListResponse> {
    return this.conversationsService.getConversations(
      req.user.userId,
      query.cursor,
      query.resolveLimit(20, 50),
    );
  }

  @Get("unread-count")
  async getUnreadCount(@Req() req: { user: { userId: string } }): Promise<{ count: number }> {
    return this.conversationsService.getUnreadCount(req.user.userId);
  }

  @Sse("sse")
  @Public()
  @UseGuards(JwtSseGuard)
  @SkipThrottle()
  sse(@Req() req: Request & { user: { userId: string } }): Observable<MessageEvent> {
    const connection = this.sseService.addConnection(req.user.userId);
    req.once("close", connection.close);
    return connection.stream;
  }

  @Get(":id")
  async getConversation(
    @Req() req: { user: { userId: string } },
    @Param("id") id: string,
    @Query() query: ChatWindowQueryDto,
  ): Promise<ConversationDetailResponse> {
    return this.conversationsService.getConversation(id, req.user.userId, {
      cursor: query.cursor,
      direction: query.resolveDirection(),
      entry: query.resolveEntry(),
      historyLimit: query.resolveHistoryLimit(40, 100),
      unreadLimit: query.resolveUnreadLimit(100, 200),
      limit: query.resolveDirectionalLimit(40, 200),
    });
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

  @Delete(":id/leave")
  async leaveConversation(@Req() req: { user: { userId: string } }, @Param("id") id: string) {
    return this.conversationsService.leaveConversation(id, req.user.userId);
  }

  @Delete("messages/:id")
  async deleteMessage(@Req() req: { user: { userId: string } }, @Param("id") id: string) {
    return this.conversationsService.deleteMessage(id, req.user.userId);
  }
}
