import { Controller, Get, Post, Patch, Delete, Param, Body, Req, Query } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import type { Request } from "express";
import { EventsService } from "./events.service.js";
import { CreateEventDto } from "./dto/create-event.dto.js";
import { UpdateEventDto } from "./dto/update-event.dto.js";

@SkipThrottle()
@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateEventDto) {
    const { userId } = req.user as { userId: string };
    return this.eventsService.create(userId, dto);
  }

  @Get()
  findAll(
    @Query("upcoming") upcoming?: string,
    @Query("cursor") cursor?: string,
    @Query("limit") limit?: string,
  ) {
    return this.eventsService.findAll({
      upcoming: upcoming === "true",
      cursor,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get("my")
  findMyEvents(@Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.eventsService.findMyEvents(userId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Req() req: Request, @Body() dto: UpdateEventDto) {
    const { userId } = req.user as { userId: string };
    return this.eventsService.update(id, userId, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.eventsService.remove(id, userId);
  }

  @Post(":id/register")
  register(@Param("id") id: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.eventsService.register(id, userId);
  }

  @Delete(":id/cancel")
  cancel(@Param("id") id: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.eventsService.cancel(id, userId);
  }
}
