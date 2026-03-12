import { prisma } from "@masters/database";
import { Injectable, OnModuleDestroy } from "@nestjs/common";

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  readonly prisma: typeof prisma = prisma;

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
