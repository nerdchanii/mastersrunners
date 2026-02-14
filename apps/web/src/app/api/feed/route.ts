import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@masters/database";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Ensure limit is reasonable
    const actualLimit = Math.min(Math.max(limit, 1), 50);

    const workouts = await prisma.workout.findMany({
      where: {
        isPublic: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: actualLimit + 1, // Fetch one extra to determine if there are more
      ...(cursor
        ? {
            skip: 1, // Skip the cursor itself
            cursor: {
              id: cursor,
            },
          }
        : {}),
    });

    const hasMore = workouts.length > actualLimit;
    const items = hasMore ? workouts.slice(0, actualLimit) : workouts;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return NextResponse.json({
      items,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error("Feed API error:", error);
    return NextResponse.json(
      { error: "피드를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
