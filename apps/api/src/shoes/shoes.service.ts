import { Injectable } from "@nestjs/common";
import { ShoeRepository } from "./repositories/shoe.repository.js";
import type { CreateShoeDto } from "./dto/create-shoe.dto.js";
import type { UpdateShoeDto } from "./dto/update-shoe.dto.js";

@Injectable()
export class ShoesService {
  constructor(private readonly shoeRepo: ShoeRepository) {}

  async findAll(userId: string) {
    return this.shoeRepo.findAllByUser(userId);
  }

  async findOne(id: string) {
    return this.shoeRepo.findById(id);
  }

  async create(userId: string, dto: CreateShoeDto) {
    return this.shoeRepo.create({
      userId,
      brand: dto.brand,
      model: dto.model,
      nickname: dto.nickname || null,
      imageUrl: dto.imageUrl || null,
      maxDistance: dto.maxDistance || null,
    });
  }

  async update(id: string, dto: UpdateShoeDto) {
    return this.shoeRepo.update(id, dto);
  }

  async remove(id: string) {
    return this.shoeRepo.remove(id);
  }
}
