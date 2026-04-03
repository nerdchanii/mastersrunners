import { NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";

import { CrewBoardsRepository } from "./crew-boards.repository.js";
import { CrewBoardsService } from "./crew-boards.service.js";

const mockCrewBoardsRepository = {
  findMemberRole: jest.fn(),
  findCrewAccessById: jest.fn(),
  findBoards: jest.fn(),
  findBoardById: jest.fn(),
  findPosts: jest.fn(),
  findPostById: jest.fn(),
  isLiked: jest.fn(),
};

describe("CrewBoardsService", () => {
  let service: CrewBoardsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        CrewBoardsService,
        { provide: CrewBoardsRepository, useValue: mockCrewBoardsRepository },
      ],
    }).compile();

    service = module.get(CrewBoardsService);
  });

  describe("public read access", () => {
    it("hides private crew boards from anonymous viewers", async () => {
      mockCrewBoardsRepository.findCrewAccessById.mockResolvedValue({
        id: "crew-1",
        isPublic: false,
      });

      await expect(service.getBoards("crew-1")).rejects.toThrow(NotFoundException);
      expect(mockCrewBoardsRepository.findBoards).not.toHaveBeenCalled();
    });

    it("allows public crew board lists for anonymous viewers", async () => {
      const boards = [{ id: "board-1", crewId: "crew-1" }];
      mockCrewBoardsRepository.findCrewAccessById.mockResolvedValue({
        id: "crew-1",
        isPublic: true,
      });
      mockCrewBoardsRepository.findBoards.mockResolvedValue(boards);

      const result = await service.getBoards("crew-1");

      expect(result).toEqual(boards);
    });

    it("allows private crew board detail reads for active members", async () => {
      const post = { id: "post-1", boardId: "board-1" };
      mockCrewBoardsRepository.findCrewAccessById.mockResolvedValue({
        id: "crew-1",
        isPublic: false,
      });
      mockCrewBoardsRepository.findMemberRole.mockResolvedValue("MEMBER");
      mockCrewBoardsRepository.findBoardById.mockResolvedValue({ id: "board-1", crewId: "crew-1" });
      mockCrewBoardsRepository.findPostById.mockResolvedValue(post);
      mockCrewBoardsRepository.isLiked.mockResolvedValue(false);

      const result = await service.getPost("crew-1", "board-1", "post-1", "member-1");

      expect(mockCrewBoardsRepository.findMemberRole).toHaveBeenCalledWith("crew-1", "member-1");
      expect(result).toEqual({ ...post, liked: false });
    });
  });
});
