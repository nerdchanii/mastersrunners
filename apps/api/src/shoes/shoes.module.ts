import { Module } from "@nestjs/common";

import { ShoeRepository } from "./repositories/shoe.repository.js";
import { ShoesController } from "./shoes.controller.js";
import { ShoesService } from "./shoes.service.js";

@Module({
  controllers: [ShoesController],
  providers: [ShoesService, ShoeRepository],
  exports: [ShoeRepository],
})
export class ShoesModule {}
