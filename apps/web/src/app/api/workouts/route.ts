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

    const workouts = await prisma.workout.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(workouts);
  } catch (error) {
    console.error("Failed to fetch workouts:", error);
    return NextResponse.json(
      { error: "기록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { distance, duration, date, memo, isPublic } = body;

    // Validation
    if (!distance || !duration || !date) {
      return NextResponse.json(
        { error: "거리, 시간, 날짜는 필수 항목입니다." },
        { status: 400 }
      );
    }

    if (typeof distance !== "number" || distance <= 0) {
      return NextResponse.json(
        { error: "거리는 0보다 큰 숫자여야 합니다." },
        { status: 400 }
      );
    }

    if (typeof duration !== "number" || duration <= 0) {
      return NextResponse.json(
        { error: "시간은 0보다 큰 숫자여야 합니다." },
        { status: 400 }
      );
    }

    if (distance > 500000) {
      return NextResponse.json(
        { error: "거리는 500km 이하여야 합니다." },
        { status: 400 }
      );
    }

    if (duration > 86400) {
      return NextResponse.json(
        { error: "시간은 24시간 이하여야 합니다." },
        { status: 400 }
      );
    }

    // 메모 길이 제한
    if (memo && typeof memo === "string" && memo.length > 2000) {
      return NextResponse.json(
        { error: "메모는 2000자 이하여야 합니다." },
        { status: 400 }
      );
    }

    // Calculate pace (seconds per kilometer)
    const pace = duration / (distance / 1000);

    // Create workout
    const workout = await prisma.workout.create({
      data: {
        userId: session.user.id,
        distance: Number(distance),
        duration: Number(duration),
        pace: Number(pace),
        date: new Date(date),
        memo: memo || null,
        isPublic: Boolean(isPublic),
      },
    });

    return NextResponse.json(workout, { status: 201 });
  } catch (error) {
    console.error("Error creating workout:", error);
    return NextResponse.json(
      { error: "워크아웃 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
