import { Controller, Get, Post, Patch, Delete, Param, Body, Req, ForbiddenException, NotFoundException } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import type { Request } from "express";
import { ShoesService } from "./shoes.service.js";
import { CreateShoeDto } from "./dto/create-shoe.dto.js";
import { UpdateShoeDto } from "./dto/update-shoe.dto.js";

@SkipThrottle()
@Controller("shoes")
export class ShoesController {
  constructor(private readonly shoesService: ShoesService) {}

  @Get()
  findAll(@Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.shoesService.findAll(userId);
  }

  @Post()
  create(@Req() req: Request, @Body() dto: CreateShoeDto) {
    const { userId } = req.user as { userId: string };
    return this.shoesService.create(userId, dto);
  }

  @Get(":id")
  async findOne(@Param("id") id: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    const shoe = await this.shoesService.findOne(id);
    if (!shoe) throw new NotFoundException("신발을 찾을 수 없습니다.");
    if (shoe.userId !== userId) throw new ForbiddenException("본인의 신발만 조회할 수 있습니다.");
    return shoe;
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Req() req: Request, @Body() dto: UpdateShoeDto) {
    const { userId } = req.user as { userId: string };
    const shoe = await this.shoesService.findOne(id);
    if (!shoe) throw new NotFoundException("신발을 찾을 수 없습니다.");
    if (shoe.userId !== userId) throw new ForbiddenException("본인의 신발만 수정할 수 있습니다.");
    return this.shoesService.update(id, dto);
  }

  @Delete(":id")
  async remove(@Param("id") id: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    const shoe = await this.shoesService.findOne(id);
    if (!shoe) throw new NotFoundException("신발을 찾을 수 없습니다.");
    if (shoe.userId !== userId) throw new ForbiddenException("본인의 신발만 삭제할 수 있습니다.");
    return this.shoesService.remove(id);
  }
}
