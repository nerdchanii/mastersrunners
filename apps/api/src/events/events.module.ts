import { Module } from "@nestjs/common";

import { DatabaseModule } from "../database/database.module.js";
import { WorkoutsModule } from "../workouts/workouts.module.js";

import { EventRepository } from "./repositories/event.repository.js";
import { EventRegistrationRepository } from "./repositories/event-registration.repository.js";
import { EventsController } from "./events.controller.js";
import { EventsService } from "./events.service.js";

@Module({
  imports: [DatabaseModule, WorkoutsModule],
  controllers: [EventsController],
  providers: [EventsService, EventRepository, EventRegistrationRepository],
  exports: [EventsService],
})
export class EventsModule {}
