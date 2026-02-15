import { Injectable } from "@nestjs/common";
import { WorkoutRepository } from "../workouts/repositories/workout.repository.js";

@Injectable()
export class FeedService {
  constructor(private readonly workoutRepo: WorkoutRepository) {}

  async getFeed(cursor: string | undefined, limit: number) {
    const workouts = await this.workoutRepo.findPublicFeed({ cursor, limit });

    const hasMore = workouts.length > limit;
    const items = hasMore ? workouts.slice(0, limit) : workouts;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return { items, nextCursor, hasMore };
  }
}
