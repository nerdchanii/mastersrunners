import { Module } from "@nestjs/common";
import { BlockController } from "./block.controller.js";
import { BlockService } from "./block.service.js";
import { BlockRepository } from "./repositories/block.repository.js";

@Module({
  controllers: [BlockController],
  providers: [BlockService, BlockRepository],
  exports: [BlockRepository],
})
export class BlockModule {}
