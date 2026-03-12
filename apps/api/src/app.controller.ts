import { Controller, Get } from "@nestjs/common";

import { Public } from "./common/decorators/public.decorator.js";
import { AppService } from "./app.service.js";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get("health")
  getHealth() {
    return this.appService.getHealth();
  }
}
