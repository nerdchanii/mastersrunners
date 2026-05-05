import type { TransactionClient } from "@masters/database";
import { Injectable } from "@nestjs/common";

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
        backgroundImage: true,
        bio: true,
        isPrivate: true,
        workoutSharingDefault: true,
        region: true,
        subRegion: true,
        pb5kSeconds: true,
        pb10kSeconds: true,
        pbHalfMarathonSeconds: true,
        pbMarathonSeconds: true,
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
        region: true,
        subRegion: true,
        pb5kSeconds: true,
        pb10kSeconds: true,
        pbHalfMarathonSeconds: true,
        pbMarathonSeconds: true,
        createdAt: true,
      },
    });
  }

  async countPostsByUser(id: string) {
    return this.db.prisma.post.count({
      where: { userId: id, deletedAt: null },
    });
  }

  async countVisiblePostsByUser(userId: string, currentUserId?: string) {
    const visibilityWhere = !currentUserId
      ? { visibility: "PUBLIC" as const }
      : currentUserId === userId
        ? {}
        : {
            OR: [
              { visibility: "PUBLIC" as const },
              {
                visibility: "FOLLOWERS" as const,
                user: {
                  followers: {
                    some: {
                      followerId: currentUserId,
                      status: "ACCEPTED" as const,
                    },
                  },
                },
              },
            ],
          };

    return this.db.prisma.post.count({
      where: {
        userId,
        deletedAt: null,
        ...visibilityWhere,
      },
    });
  }

  async findByEmail(email: string) {
    return this.db.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      bio?: string | null;
      profileImage?: string | null;
      backgroundImage?: string | null;
      isPrivate?: boolean;
      workoutSharingDefault?: string;
      region?: string | null;
      subRegion?: string | null;
      pb5kSeconds?: number | null;
      pb10kSeconds?: number | null;
      pbHalfMarathonSeconds?: number | null;
      pbMarathonSeconds?: number | null;
    },
  ) {
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

  async softDelete(id: string) {
    return this.db.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        name: "탈퇴한 사용자",
        email: `deleted_${id}@deleted.local`,
        profileImage: null,
        backgroundImage: null,
        bio: null,
      },
    });
  }

  async restoreDeletedUser(id: string, name: string, profileImage: string | null) {
    return this.db.prisma.user.update({
      where: { id },
      data: {
        deletedAt: null,
        name: name || "복원된 사용자",
        profileImage,
      },
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
