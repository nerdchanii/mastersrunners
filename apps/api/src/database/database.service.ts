import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { prisma } from "@masters/database";

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  readonly prisma: typeof prisma = prisma;

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
