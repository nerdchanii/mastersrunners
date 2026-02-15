import { Test } from "@nestjs/testing";
import { ShoeRepository } from "./shoe.repository";
import { DatabaseService } from "../../database/database.service";

const mockPrisma = {
  shoe: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe("ShoeRepository", () => {
  let repository: ShoeRepository;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        ShoeRepository,
        { provide: DatabaseService, useValue: { prisma: mockPrisma } },
      ],
    }).compile();
    repository = module.get(ShoeRepository);
  });

  describe("findAllByUser", () => {
    it("should query shoes by userId ordered by createdAt desc", async () => {
      const userId = "user-123";
      const mockShoes = [
        { id: "shoe-2", userId, brand: "Nike", model: "Pegasus", createdAt: new Date("2026-02-15") },
        { id: "shoe-1", userId, brand: "Adidas", model: "Boost", createdAt: new Date("2026-02-10") },
      ];
      mockPrisma.shoe.findMany.mockResolvedValue(mockShoes);

      const result = await repository.findAllByUser(userId);

      expect(mockPrisma.shoe.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      expect(result).toEqual(mockShoes);
    });
  });

  describe("findById", () => {
    it("should find shoe by id", async () => {
      const shoeId = "shoe-123";
      const mockShoe = { id: shoeId, userId: "user-123", brand: "Nike", model: "Pegasus" };
      mockPrisma.shoe.findUnique.mockResolvedValue(mockShoe);

      const result = await repository.findById(shoeId);

      expect(mockPrisma.shoe.findUnique).toHaveBeenCalledWith({ where: { id: shoeId } });
      expect(result).toEqual(mockShoe);
    });

    it("should return null if shoe not found", async () => {
      mockPrisma.shoe.findUnique.mockResolvedValue(null);

      const result = await repository.findById("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create shoe with all fields", async () => {
      const createData = {
        userId: "user-123",
        brand: "Nike",
        model: "Pegasus 40",
        nickname: "My Daily Runner",
        imageUrl: "https://example.com/shoe.jpg",
        maxDistance: 800000,
      };
      const mockCreated = { id: "shoe-new", ...createData, totalDistance: 0, isRetired: false, createdAt: new Date() };
      mockPrisma.shoe.create.mockResolvedValue(mockCreated);

      const result = await repository.create(createData);

      expect(mockPrisma.shoe.create).toHaveBeenCalledWith({ data: createData });
      expect(result).toEqual(mockCreated);
    });

    it("should create shoe with minimal fields", async () => {
      const createData = {
        userId: "user-123",
        brand: "Adidas",
        model: "Ultraboost",
      };
      const mockCreated = { id: "shoe-new", ...createData, totalDistance: 0, isRetired: false, createdAt: new Date() };
      mockPrisma.shoe.create.mockResolvedValue(mockCreated);

      const result = await repository.create(createData);

      expect(mockPrisma.shoe.create).toHaveBeenCalledWith({ data: createData });
      expect(result).toEqual(mockCreated);
    });
  });

  describe("update", () => {
    it("should update shoe with provided fields", async () => {
      const shoeId = "shoe-123";
      const updateData = {
        nickname: "Updated Nickname",
        maxDistance: 1000000,
        isRetired: true,
      };
      const mockUpdated = { id: shoeId, ...updateData };
      mockPrisma.shoe.update.mockResolvedValue(mockUpdated);

      const result = await repository.update(shoeId, updateData);

      expect(mockPrisma.shoe.update).toHaveBeenCalledWith({
        where: { id: shoeId },
        data: updateData,
      });
      expect(result).toEqual(mockUpdated);
    });

    it("should update shoe with partial fields", async () => {
      const shoeId = "shoe-123";
      const updateData = { nickname: "New Nickname" };
      const mockUpdated = { id: shoeId, nickname: "New Nickname" };
      mockPrisma.shoe.update.mockResolvedValue(mockUpdated);

      const result = await repository.update(shoeId, updateData);

      expect(mockPrisma.shoe.update).toHaveBeenCalledWith({
        where: { id: shoeId },
        data: updateData,
      });
      expect(result).toEqual(mockUpdated);
    });
  });

  describe("remove", () => {
    it("should delete shoe by id", async () => {
      const shoeId = "shoe-123";
      const mockDeleted = { id: shoeId, userId: "user-123", brand: "Nike", model: "Pegasus" };
      mockPrisma.shoe.delete.mockResolvedValue(mockDeleted);

      const result = await repository.remove(shoeId);

      expect(mockPrisma.shoe.delete).toHaveBeenCalledWith({ where: { id: shoeId } });
      expect(result).toEqual(mockDeleted);
    });
  });

  describe("addDistance", () => {
    it("should increment totalDistance by given distance", async () => {
      const shoeId = "shoe-123";
      const distance = 5000; // 5km in meters
      const mockUpdated = { id: shoeId, totalDistance: 105000 }; // was 100km, now 105km
      mockPrisma.shoe.update.mockResolvedValue(mockUpdated);

      const result = await repository.addDistance(shoeId, distance);

      expect(mockPrisma.shoe.update).toHaveBeenCalledWith({
        where: { id: shoeId },
        data: { totalDistance: { increment: distance } },
      });
      expect(result).toEqual(mockUpdated);
    });

    it("should handle zero distance increment", async () => {
      const shoeId = "shoe-123";
      const distance = 0;
      const mockUpdated = { id: shoeId, totalDistance: 50000 };
      mockPrisma.shoe.update.mockResolvedValue(mockUpdated);

      const result = await repository.addDistance(shoeId, distance);

      expect(mockPrisma.shoe.update).toHaveBeenCalledWith({
        where: { id: shoeId },
        data: { totalDistance: { increment: distance } },
      });
      expect(result).toEqual(mockUpdated);
    });
  });
});
