import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

import { Public } from "../common/decorators/public.decorator.js";

const HEALTH_PATHS = ["health", "api/v1/health"] as const;

@ApiTags("health")
@Controller()
export class HealthController {
  @Get([...HEALTH_PATHS])
  @Public()
  @ApiOperation({ summary: "Health check endpoint" })
  check() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }
}
