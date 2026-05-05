import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { Public } from "../common/decorators/public.decorator.js";

import { FeatureFlagsService } from "./feature-flags.service.js";

@ApiTags("Config")
@Controller("config")
export class PublicConfigController {
  constructor(private readonly featureFlags: FeatureFlagsService) {}

  @Public()
  @Get("public")
  getPublicConfig() {
    return this.featureFlags.getPublicRuntimeConfig();
  }
}
