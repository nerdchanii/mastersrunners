import { Test } from "@nestjs/testing";
import { FeedService } from "./feed.service";
import { WorkoutRepository } from "../workouts/repositories/workout.repository";

const mockWorkoutRepo = {
  findPublicFeed: jest.fn(),
};

describe("FeedService", () => {
  let service: FeedService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        FeedService,
        { provide: WorkoutRepository, useValue: mockWorkoutRepo },
      ],
    }).compile();

    service = module.get(FeedService);
  });

  describe("getFeed", () => {
    it("should set hasMore=true and nextCursor when more items exist", async () => {
      const items = Array.from({ length: 11 }, (_, i) => ({ id: `w${i}` }));
      mockWorkoutRepo.findPublicFeed.mockResolvedValue(items);

      const result = await service.getFeed(undefined, 10);

      expect(result.hasMore).toBe(true);
      expect(result.items).toHaveLength(10);
      expect(result.nextCursor).toBe("w9");
    });

    it("should set hasMore=false and nextCursor=null when no more items", async () => {
      const items = [{ id: "w1" }, { id: "w2" }];
      mockWorkoutRepo.findPublicFeed.mockResolvedValue(items);

      const result = await service.getFeed(undefined, 10);

      expect(result.hasMore).toBe(false);
      expect(result.items).toHaveLength(2);
      expect(result.nextCursor).toBeNull();
    });

    it("should return empty result when no items", async () => {
      mockWorkoutRepo.findPublicFeed.mockResolvedValue([]);

      const result = await service.getFeed(undefined, 10);

      expect(result.items).toEqual([]);
      expect(result.nextCursor).toBeNull();
      expect(result.hasMore).toBe(false);
    });

    it("should pass cursor and limit to repository", async () => {
      mockWorkoutRepo.findPublicFeed.mockResolvedValue([]);

      await service.getFeed("cursor-1", 20);

      expect(mockWorkoutRepo.findPublicFeed).toHaveBeenCalledWith({
        cursor: "cursor-1",
        limit: 20,
      });
    });
  });
});
