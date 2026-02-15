import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../database/database.service.js";

interface CreateAccountForUserData {
  type: string;
  provider: string;
  providerAccountId: string;
  access_token: string;
  refresh_token: string;
}

@Injectable()
export class AccountRepository {
  constructor(private readonly db: DatabaseService) {}

  async findByProviderWithUser(provider: string, providerAccountId: string) {
    return this.db.prisma.account.findUnique({
      where: {
        provider_providerAccountId: { provider, providerAccountId },
      },
      include: { user: true },
    });
  }

  async updateTokens(id: string, accessToken: string, refreshToken: string) {
    return this.db.prisma.account.update({
      where: { id },
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    });
  }

  async createForUser(userId: string, data: CreateAccountForUserData) {
    return this.db.prisma.account.create({
      data: {
        userId,
        ...data,
      },
    });
  }
}
