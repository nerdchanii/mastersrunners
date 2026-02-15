import { Module } from "@nestjs/common";
import { EventsController } from "./events.controller.js";
import { EventsService } from "./events.service.js";
import { EventRepository } from "./repositories/event.repository.js";
import { EventRegistrationRepository } from "./repositories/event-registration.repository.js";
import { DatabaseModule } from "../database/database.module.js";

@Module({
  imports: [DatabaseModule],
  controllers: [EventsController],
  providers: [EventsService, EventRepository, EventRegistrationRepository],
  exports: [EventsService],
})
export class EventsModule {}
