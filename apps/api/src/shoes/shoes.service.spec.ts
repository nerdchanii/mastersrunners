import { Test } from "@nestjs/testing";
import { ShoesService } from "./shoes.service";
import { ShoeRepository } from "./repositories/shoe.repository";
import type { CreateShoeDto } from "./dto/create-shoe.dto";
import type { UpdateShoeDto } from "./dto/update-shoe.dto";

const mockShoeRepository = {
  findAllByUser: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe("ShoesService", () => {
  let service: ShoesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        ShoesService,
        { provide: ShoeRepository, useValue: mockShoeRepository },
      ],
    }).compile();
    service = module.get(ShoesService);
  });

  describe("findAll", () => {
    it("should delegate to shoeRepo.findAllByUser", async () => {
      const userId = "user-123";
      const mockShoes = [
        { id: "shoe-1", userId, brand: "Nike", model: "Pegasus" },
        { id: "shoe-2", userId, brand: "Adidas", model: "Boost" },
      ];
      mockShoeRepository.findAllByUser.mockResolvedValue(mockShoes);

      const result = await service.findAll(userId);

      expect(mockShoeRepository.findAllByUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockShoes);
    });
  });

  describe("findOne", () => {
    it("should delegate to shoeRepo.findById", async () => {
      const shoeId = "shoe-123";
      const mockShoe = { id: shoeId, userId: "user-123", brand: "Nike", model: "Pegasus" };
      mockShoeRepository.findById.mockResolvedValue(mockShoe);

      const result = await service.findOne(shoeId);

      expect(mockShoeRepository.findById).toHaveBeenCalledWith(shoeId);
      expect(result).toEqual(mockShoe);
    });
  });

  describe("create", () => {
    it("should delegate to shoeRepo.create with userId and dto fields", async () => {
      const userId = "user-123";
      const dto: CreateShoeDto = {
        brand: "Nike",
        model: "Pegasus 40",
        nickname: "My Daily",
        imageUrl: "https://example.com/shoe.jpg",
        maxDistance: 800000,
      };
      const mockCreated = { id: "shoe-new", userId, ...dto };
      mockShoeRepository.create.mockResolvedValue(mockCreated);

      const result = await service.create(userId, dto);

      expect(mockShoeRepository.create).toHaveBeenCalledWith({
        userId,
        brand: dto.brand,
        model: dto.model,
        nickname: dto.nickname,
        imageUrl: dto.imageUrl,
        maxDistance: dto.maxDistance,
      });
      expect(result).toEqual(mockCreated);
    });

    it("should convert undefined optional fields to null", async () => {
      const userId = "user-123";
      const dto: CreateShoeDto = {
        brand: "Adidas",
        model: "Ultraboost",
      };
      const mockCreated = { id: "shoe-new", userId, brand: dto.brand, model: dto.model };
      mockShoeRepository.create.mockResolvedValue(mockCreated);

      const result = await service.create(userId, dto);

      expect(mockShoeRepository.create).toHaveBeenCalledWith({
        userId,
        brand: dto.brand,
        model: dto.model,
        nickname: null,
        imageUrl: null,
        maxDistance: null,
      });
      expect(result).toEqual(mockCreated);
    });
  });

  describe("update", () => {
    it("should delegate to shoeRepo.update", async () => {
      const shoeId = "shoe-123";
      const dto: UpdateShoeDto = {
        nickname: "Updated Nickname",
        maxDistance: 1000000,
        isRetired: true,
      };
      const mockUpdated = { id: shoeId, ...dto };
      mockShoeRepository.update.mockResolvedValue(mockUpdated);

      const result = await service.update(shoeId, dto);

      expect(mockShoeRepository.update).toHaveBeenCalledWith(shoeId, dto);
      expect(result).toEqual(mockUpdated);
    });
  });

  describe("remove", () => {
    it("should delegate to shoeRepo.remove", async () => {
      const shoeId = "shoe-123";
      const mockDeleted = { id: shoeId, userId: "user-123" };
      mockShoeRepository.remove.mockResolvedValue(mockDeleted);

      const result = await service.remove(shoeId);

      expect(mockShoeRepository.remove).toHaveBeenCalledWith(shoeId);
      expect(result).toEqual(mockDeleted);
    });
  });
});
