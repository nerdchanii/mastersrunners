import { Injectable } from "@nestjs/common";

import { BlockRepository } from "../block/repositories/block.repository.js";

import { FeedRepository } from "./repositories/feed.repository.js";

@Injectable()
export class FeedService {
  constructor(
    private readonly feedRepo: FeedRepository,
    private readonly blockRepo: BlockRepository,
  ) {}

  private async getFilteredFollowingIds(userId: string): Promise<string[]> {
    const [rawFollowingIds, blockedUserIds] = await Promise.all([
      this.feedRepo.getFollowingIds(userId),
      this.blockRepo.getBlockedUserIds(userId),
    ]);
    const blockedSet = new Set(blockedUserIds);
    return rawFollowingIds.filter((id) => !blockedSet.has(id));
  }

  async getPostFeed(userId: string, cursor: string | undefined, limit: number) {
    const followingIds = await this.getFilteredFollowingIds(userId);

    const posts = await this.feedRepo.getPostFeed({
      userId,
      followingIds,
      cursor,
      limit,
    });

    const hasMore = posts.length > limit;
    const rawItems = hasMore ? posts.slice(0, limit) : posts;
    const items = rawItems.map((post) => {
      const { likes, ...rest } = post;
      const likeRows = likes ?? [];
      return {
        ...rest,
        isLiked: likeRows.length > 0,
      };
    });
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return { items, nextCursor, hasMore };
  }

  async getWorkoutFeed(
    userId: string,
    cursor: string | undefined,
    limit: number,
    excludeLinkedToPost?: boolean,
  ) {
    const followingIds = await this.getFilteredFollowingIds(userId);

    const workouts = await this.feedRepo.getWorkoutFeed({
      userId,
      followingIds,
      cursor,
      limit,
      excludeLinkedToPost,
    });

    const hasMore = workouts.length > limit;
    const rawItems = hasMore ? workouts.slice(0, limit) : workouts;
    const nextCursor = hasMore ? rawItems[rawItems.length - 1].id : null;

    // Map _count fields to frontend contract
    const items = rawItems.map((workout) => {
      const { workoutLikes, ...rest } = workout;
      const likeRows = workoutLikes ?? [];
      return {
        ...rest,
        _count: {
          likes: workout._count.workoutLikes,
          comments: workout._count.workoutComments,
        },
        isLiked: likeRows.length > 0,
      };
    });

    return { items, nextCursor, hasMore };
  }
}
