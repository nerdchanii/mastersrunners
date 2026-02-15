import { Test } from "@nestjs/testing";
import { AccountRepository } from "./account.repository";
import { DatabaseService } from "../../database/database.service";

const mockPrisma = {
  account: {
    findUnique: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
};

describe("AccountRepository", () => {
  let repository: AccountRepository;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        AccountRepository,
        { provide: DatabaseService, useValue: { prisma: mockPrisma } },
      ],
    }).compile();

    repository = module.get(AccountRepository);
  });

  describe("findByProviderWithUser", () => {
    it("should query by composite key with user included", async () => {
      const mockAccount = { id: "a1", user: { id: "u1", name: "Test" } };
      mockPrisma.account.findUnique.mockResolvedValue(mockAccount);

      const result = await repository.findByProviderWithUser("kakao", "kakao-123");

      expect(mockPrisma.account.findUnique).toHaveBeenCalledWith({
        where: {
          provider_providerAccountId: {
            provider: "kakao",
            providerAccountId: "kakao-123",
          },
        },
        include: { user: true },
      });
      expect(result).toEqual(mockAccount);
    });

    it("should return null when account not found", async () => {
      mockPrisma.account.findUnique.mockResolvedValue(null);

      const result = await repository.findByProviderWithUser("kakao", "unknown");

      expect(result).toBeNull();
    });
  });

  describe("updateTokens", () => {
    it("should update access and refresh tokens", async () => {
      mockPrisma.account.update.mockResolvedValue({ id: "a1" });

      await repository.updateTokens("a1", "new-access", "new-refresh");

      expect(mockPrisma.account.update).toHaveBeenCalledWith({
        where: { id: "a1" },
        data: {
          access_token: "new-access",
          refresh_token: "new-refresh",
        },
      });
    });
  });

  describe("createForUser", () => {
    it("should create account linked to userId", async () => {
      const data = {
        type: "oauth",
        provider: "google",
        providerAccountId: "google-456",
        access_token: "at",
        refresh_token: "rt",
      };
      mockPrisma.account.create.mockResolvedValue({ id: "a2", userId: "u1" });

      await repository.createForUser("u1", data);

      expect(mockPrisma.account.create).toHaveBeenCalledWith({
        data: { userId: "u1", ...data },
      });
    });
  });
});
