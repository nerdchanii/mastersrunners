import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@masters/database";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        profileImage: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // Get workout statistics
    const stats = await prisma.workout.aggregate({
      where: { userId: session.user.id },
      _count: true,
      _sum: { distance: true, duration: true },
    });

    const totalWorkouts = stats._count;
    const totalDistance = stats._sum.distance ?? 0;
    const totalDuration = stats._sum.duration ?? 0;
    const averagePace = totalDistance > 0 ? totalDuration / (totalDistance / 1000) : 0;

    return NextResponse.json({
      user,
      stats: {
        totalWorkouts,
        totalDistance,
        totalDuration,
        averagePace,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "프로필 정보를 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
