import { Test } from "@nestjs/testing";
import { UserRepository } from "./user.repository";
import { DatabaseService } from "../../database/database.service";

const mockTx = {
  user: { create: jest.fn() },
  account: { create: jest.fn() },
};

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
  },
  $transaction: jest.fn((cb: (tx: typeof mockTx) => Promise<unknown>) => cb(mockTx)),
};

describe("UserRepository", () => {
  let repository: UserRepository;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        UserRepository,
        { provide: DatabaseService, useValue: { prisma: mockPrisma } },
      ],
    }).compile();

    repository = module.get(UserRepository);
  });

  describe("findById", () => {
    it("should find user by id", async () => {
      const mockUser = { id: "u1", email: "test@test.com" };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findById("u1");

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "u1" },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe("findByIdWithProfile", () => {
    it("should include bio in select", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await repository.findByIdWithProfile("u1");

      const call = mockPrisma.user.findUnique.mock.calls[0][0];
      expect(call.select.bio).toBe(true);
      expect(call.select.id).toBe(true);
      expect(call.select.email).toBe(true);
      expect(call.select.name).toBe(true);
      expect(call.select.profileImage).toBe(true);
      expect(call.select.createdAt).toBe(true);
    });
  });

  describe("findByIdBasicSelect", () => {
    it("should include bio and backgroundImage in select", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await repository.findByIdBasicSelect("u1");

      const call = mockPrisma.user.findUnique.mock.calls[0][0];
      expect(call.select.bio).toBe(true);
      expect(call.select.backgroundImage).toBe(true);
      expect(call.select.id).toBe(true);
      expect(call.select.email).toBe(true);
    });
  });

  describe("findByEmail", () => {
    it("should find user by email", async () => {
      const mockUser = { id: "u1", email: "test@test.com" };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findByEmail("test@test.com");

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@test.com" },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe("createWithAccount", () => {
    it("should create user and account in a transaction", async () => {
      const userData = {
        email: "new@test.com",
        name: "New User",
        profileImage: null,
        emailVerified: new Date("2026-01-01"),
      };
      const accountData = {
        type: "oauth",
        provider: "kakao",
        providerAccountId: "kakao-123",
        access_token: "at",
        refresh_token: "rt",
      };
      const createdUser = { id: "u1", ...userData };
      mockTx.user.create.mockResolvedValue(createdUser);
      mockTx.account.create.mockResolvedValue({ id: "a1" });

      const result = await repository.createWithAccount(userData, accountData);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockTx.user.create).toHaveBeenCalledWith({ data: userData });
      expect(mockTx.account.create).toHaveBeenCalledWith({
        data: { userId: "u1", ...accountData },
      });
      expect(result).toEqual(createdUser);
    });
  });
});
