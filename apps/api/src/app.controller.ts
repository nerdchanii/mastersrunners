import { Controller, Get } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { AppService } from "./app.service.js";
import { Public } from "./common/decorators/public.decorator.js";

@SkipThrottle()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get("health")
  getHealth() {
    return this.appService.getHealth();
  }
}
