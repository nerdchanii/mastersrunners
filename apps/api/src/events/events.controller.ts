import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Request } from "express";

import { CreateEventDto } from "./dto/create-event.dto.js";
import { LinkEventWorkoutDto } from "./dto/link-event-workout.dto.js";
import { ListEventsQueryDto } from "./dto/list-events-query.dto.js";
import { SubmitEventResultDto } from "./dto/submit-event-result.dto.js";
import { UpdateEventDto } from "./dto/update-event.dto.js";
import { EventsService } from "./events.service.js";

@ApiTags("Events")
@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateEventDto) {
    const { userId } = req.user as { userId: string };
    return this.eventsService.create(userId, dto);
  }

  @Get()
  findAll(@Query() query: ListEventsQueryDto) {
    return this.eventsService.findAll({
      upcoming: query.upcoming ?? false,
      cursor: query.cursor,
      limit: query.resolveOptionalLimit(),
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

  @Put(":id/results")
  submitResult(@Param("id") id: string, @Req() req: Request, @Body() dto: SubmitEventResultDto) {
    const { userId } = req.user as { userId: string };
    return this.eventsService.submitResult(id, userId, dto);
  }

  @Get(":id/results")
  getResults(@Param("id") id: string, @Query("sortBy") sortBy?: "resultTime" | "resultRank") {
    return this.eventsService.getResults(id, sortBy);
  }

  @Get(":id/results/me")
  getMyResult(@Param("id") id: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.eventsService.getMyResult(id, userId);
  }

  @Post(":id/link-workout")
  linkWorkout(@Param("id") id: string, @Req() req: Request, @Body() dto: LinkEventWorkoutDto) {
    const { userId } = req.user as { userId: string };
    return this.eventsService.linkWorkout(id, userId, dto.workoutId);
  }

  @Delete(":id/link-workout")
  unlinkWorkout(@Param("id") id: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.eventsService.unlinkWorkout(id, userId);
  }
}
