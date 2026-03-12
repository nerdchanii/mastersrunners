import { Module } from "@nestjs/common";

import { BlockRepository } from "./repositories/block.repository.js";
import { BlockController } from "./block.controller.js";
import { BlockService } from "./block.service.js";

@Module({
  controllers: [BlockController],
  providers: [BlockService, BlockRepository],
  exports: [BlockRepository],
})
export class BlockModule {}
