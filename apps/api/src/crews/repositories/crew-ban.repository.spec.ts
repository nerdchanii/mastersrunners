import { Test } from "@nestjs/testing";
import { CrewBanRepository } from "./crew-ban.repository.js";
import { DatabaseService } from "../../database/database.service.js";

const mockPrisma = {
  crewBan: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
  },
};

const mockDatabaseService = { prisma: mockPrisma };

describe("CrewBanRepository", () => {
  let repo: CrewBanRepository;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        CrewBanRepository,
        { provide: DatabaseService, useValue: mockDatabaseService },
      ],
    }).compile();
    repo = module.get(CrewBanRepository);
  });

  describe("create", () => {
    it("should create a ban record", async () => {
      const data = { crewId: "crew-1", userId: "user-1", bannedBy: "admin-1", reason: "spam" };
      const mockBan = { id: "ban-1", ...data, createdAt: new Date() };
      mockPrisma.crewBan.create.mockResolvedValue(mockBan);

      const result = await repo.create(data);

      expect(mockPrisma.crewBan.create).toHaveBeenCalledWith({ data });
      expect(result).toEqual(mockBan);
    });
  });

  describe("findByCrewAndUser", () => {
    it("should return ban if exists", async () => {
      const mockBan = { id: "ban-1", crewId: "crew-1", userId: "user-1" };
      mockPrisma.crewBan.findUnique.mockResolvedValue(mockBan);

      const result = await repo.findByCrewAndUser("crew-1", "user-1");

      expect(mockPrisma.crewBan.findUnique).toHaveBeenCalledWith({
        where: { crewId_userId: { crewId: "crew-1", userId: "user-1" } },
      });
      expect(result).toEqual(mockBan);
    });

    it("should return null if not banned", async () => {
      mockPrisma.crewBan.findUnique.mockResolvedValue(null);

      const result = await repo.findByCrewAndUser("crew-1", "user-2");

      expect(result).toBeNull();
    });
  });

  describe("findByCrewId", () => {
    it("should return all bans for a crew", async () => {
      const mockBans = [
        { id: "ban-1", crewId: "crew-1", userId: "user-1" },
        { id: "ban-2", crewId: "crew-1", userId: "user-2" },
      ];
      mockPrisma.crewBan.findMany.mockResolvedValue(mockBans);

      const result = await repo.findByCrewId("crew-1");

      expect(mockPrisma.crewBan.findMany).toHaveBeenCalledWith({
        where: { crewId: "crew-1" },
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
        },
      });
      expect(result).toEqual(mockBans);
    });
  });

  describe("remove", () => {
    it("should delete ban record", async () => {
      const mockDeleted = { id: "ban-1", crewId: "crew-1", userId: "user-1" };
      mockPrisma.crewBan.delete.mockResolvedValue(mockDeleted);

      const result = await repo.remove("crew-1", "user-1");

      expect(mockPrisma.crewBan.delete).toHaveBeenCalledWith({
        where: { crewId_userId: { crewId: "crew-1", userId: "user-1" } },
      });
      expect(result).toEqual(mockDeleted);
    });
  });

  describe("isBanned", () => {
    it("should return true if banned", async () => {
      mockPrisma.crewBan.findUnique.mockResolvedValue({ id: "ban-1" });

      expect(await repo.isBanned("crew-1", "user-1")).toBe(true);
    });

    it("should return false if not banned", async () => {
      mockPrisma.crewBan.findUnique.mockResolvedValue(null);

      expect(await repo.isBanned("crew-1", "user-2")).toBe(false);
    });
  });
});
