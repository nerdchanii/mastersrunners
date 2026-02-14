import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { prisma, PrismaClient } from "@masters/database";

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  readonly prisma: InstanceType<typeof PrismaClient> = prisma;

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
