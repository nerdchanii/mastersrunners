import { Module } from "@nestjs/common";
import { ShoesController } from "./shoes.controller.js";
import { ShoesService } from "./shoes.service.js";
import { ShoeRepository } from "./repositories/shoe.repository.js";

@Module({
  controllers: [ShoesController],
  providers: [ShoesService, ShoeRepository],
  exports: [ShoeRepository],
})
export class ShoesModule {}
