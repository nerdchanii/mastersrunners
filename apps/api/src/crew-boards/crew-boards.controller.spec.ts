import { Test } from "@nestjs/testing";

import { IS_PUBLIC_KEY } from "../common/decorators/public.decorator.js";

import { CrewBoardsController } from "./crew-boards.controller.js";
import { CrewBoardsService } from "./crew-boards.service.js";

const mockCrewBoardsService = {
  createBoard: jest.fn(),
  getBoards: jest.fn(),
  updateBoard: jest.fn(),
  deleteBoard: jest.fn(),
  createPost: jest.fn(),
  getPosts: jest.fn(),
  getPost: jest.fn(),
  updatePost: jest.fn(),
  deletePost: jest.fn(),
  togglePin: jest.fn(),
  createComment: jest.fn(),
  deleteComment: jest.fn(),
  toggleLike: jest.fn(),
};

describe("CrewBoardsController", () => {
  let controller: CrewBoardsController;
  const mockAnonymousReq = {} as any;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [CrewBoardsController],
      providers: [{ provide: CrewBoardsService, useValue: mockCrewBoardsService }],
    }).compile();

    controller = module.get(CrewBoardsController);
  });

  describe("public read metadata", () => {
    it("marks board discovery reads as public", () => {
      expect(Reflect.getMetadata(IS_PUBLIC_KEY, CrewBoardsController.prototype.getBoards)).toBe(
        true,
      );
      expect(Reflect.getMetadata(IS_PUBLIC_KEY, CrewBoardsController.prototype.getPosts)).toBe(
        undefined,
      );
      expect(Reflect.getMetadata(IS_PUBLIC_KEY, CrewBoardsController.prototype.getPost)).toBe(
        undefined,
      );
    });
  });

  describe("getBoards", () => {
    it("delegates to the service", async () => {
      const expected = [{ id: "board-1", name: "공지" }];
      mockCrewBoardsService.getBoards.mockResolvedValue(expected);

      const result = await controller.getBoards("crew-1", mockAnonymousReq);

      expect(mockCrewBoardsService.getBoards).toHaveBeenCalledWith("crew-1", undefined);
      expect(result).toEqual(expected);
    });
  });
});
