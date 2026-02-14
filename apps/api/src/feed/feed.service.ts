import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service.js";

@Injectable()
export class FeedService {
  constructor(private readonly db: DatabaseService) {}

  async getFeed(cursor: string | undefined, limit: number) {
    const workouts = await this.db.prisma.workout.findMany({
      where: { isPublic: true },
      include: {
        user: { select: { id: true, name: true, profileImage: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });

    const hasMore = workouts.length > limit;
    const items = hasMore ? workouts.slice(0, limit) : workouts;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return { items, nextCursor, hasMore };
  }
}
