import { Injectable } from "@nestjs/common";
import type { TransactionClient } from "@masters/database";
import { DatabaseService } from "../../database/database.service.js";

interface CreateUserData {
  email: string;
  name: string;
  profileImage: string | null;
  emailVerified: Date | null;
}

interface CreateAccountData {
  type: string;
  provider: string;
  providerAccountId: string;
  access_token: string;
  refresh_token: string;
}

@Injectable()
export class UserRepository {
  constructor(private readonly db: DatabaseService) {}

  async findById(id: string) {
    return this.db.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByIdWithProfile(id: string) {
    return this.db.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        profileImage: true,
        bio: true,
        createdAt: true,
      },
    });
  }

  async findByIdBasicSelect(id: string) {
    return this.db.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        profileImage: true,
        backgroundImage: true,
        bio: true,
        isPrivate: true,
        workoutSharingDefault: true,
        createdAt: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.db.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, data: { name?: string; bio?: string; profileImage?: string; backgroundImage?: string; isPrivate?: boolean; workoutSharingDefault?: string }) {
    return this.db.prisma.user.update({
      where: { id },
      data,
    });
  }

  async searchByName(query: string, excludeUserIds: string[] = [], limit = 20) {
    return this.db.prisma.user.findMany({
      where: {
        name: { contains: query, mode: "insensitive" },
        ...(excludeUserIds.length > 0 ? { id: { notIn: excludeUserIds } } : {}),
      },
      select: {
        id: true,
        name: true,
        profileImage: true,
        bio: true,
      },
      take: limit,
      orderBy: { name: "asc" },
    });
  }

  async createWithAccount(userData: CreateUserData, accountData: CreateAccountData) {
    return this.db.prisma.$transaction(async (tx: TransactionClient) => {
      const user = await tx.user.create({ data: userData });

      await tx.account.create({
        data: {
          userId: user.id,
          ...accountData,
        },
      });

      return user;
    });
  }
}
