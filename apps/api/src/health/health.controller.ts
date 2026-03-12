import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

import { Public } from "../common/decorators/public.decorator.js";

@ApiTags("health")
@Controller("health")
export class HealthController {
  @Get()
  @Public()
  @ApiOperation({ summary: "Health check endpoint" })
  check() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }
}
