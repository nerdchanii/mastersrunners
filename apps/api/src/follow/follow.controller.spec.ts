import { ForbiddenException } from "@nestjs/common";

import { FollowController } from "./follow.controller";

describe("FollowController", () => {
  const followService = {
    follow: jest.fn(),
    unfollow: jest.fn(),
    acceptRequest: jest.fn(),
    rejectRequest: jest.fn(),
    getFollowers: jest.fn(),
    getFollowing: jest.fn(),
    getPendingRequests: jest.fn(),
  };

  let controller: FollowController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new FollowController(followService as never);
  });

  it("returns own followers list when route user matches session user", async () => {
    const request = { user: { userId: "user-1" } } as never;
    followService.getFollowers.mockResolvedValue([{ id: "follow-1" }]);

    const result = await controller.getUserFollowers("user-1", request);

    expect(followService.getFollowers).toHaveBeenCalledWith("user-1");
    expect(result).toEqual([{ id: "follow-1" }]);
  });

  it("forbids reading another user's followers list", async () => {
    const request = { user: { userId: "viewer" } } as never;

    expect(() => controller.getUserFollowers("target", request)).toThrow(ForbiddenException);
    expect(followService.getFollowers).not.toHaveBeenCalled();
  });

  it("returns own following list when route user matches session user", async () => {
    const request = { user: { userId: "user-1" } } as never;
    followService.getFollowing.mockResolvedValue([{ id: "follow-1" }]);

    const result = await controller.getUserFollowing("user-1", request);

    expect(followService.getFollowing).toHaveBeenCalledWith("user-1");
    expect(result).toEqual([{ id: "follow-1" }]);
  });

  it("forbids reading another user's following list", async () => {
    const request = { user: { userId: "viewer" } } as never;

    expect(() => controller.getUserFollowing("target", request)).toThrow(ForbiddenException);
    expect(followService.getFollowing).not.toHaveBeenCalled();
  });
});
