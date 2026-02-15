import { Injectable } from "@nestjs/common";
import { FeedRepository } from "./repositories/feed.repository.js";

@Injectable()
export class FeedService {
  constructor(private readonly feedRepo: FeedRepository) {}

  async getPostFeed(
    userId: string,
    cursor: string | undefined,
    limit: number,
  ) {
    const followingIds = await this.feedRepo.getFollowingIds(userId);

    const posts = await this.feedRepo.getPostFeed({
      userId,
      followingIds,
      cursor,
      limit,
    });

    const hasMore = posts.length > limit;
    const items = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return { items, nextCursor, hasMore };
  }

  async getWorkoutFeed(
    userId: string,
    cursor: string | undefined,
    limit: number,
    excludeLinkedToPost?: boolean,
  ) {
    const followingIds = await this.feedRepo.getFollowingIds(userId);

    const workouts = await this.feedRepo.getWorkoutFeed({
      userId,
      followingIds,
      cursor,
      limit,
      excludeLinkedToPost,
    });

    const hasMore = workouts.length > limit;
    const items = hasMore ? workouts.slice(0, limit) : workouts;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return { items, nextCursor, hasMore };
  }
}
