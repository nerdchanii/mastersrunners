import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@masters/database";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    const workout = await prisma.workout.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });

    if (!workout) {
      return NextResponse.json(
        { error: "워크아웃을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // Private workouts can only be viewed by the owner
    if (!workout.isPublic && workout.userId !== session?.user?.id) {
      return NextResponse.json(
        { error: "접근 권한이 없습니다." },
        { status: 403 }
      );
    }

    return NextResponse.json(workout);
  } catch (error) {
    console.error("Error fetching workout:", error);
    return NextResponse.json(
      { error: "워크아웃 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { isPublic } = body;

    // Check if workout exists and belongs to user
    const workout = await prisma.workout.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!workout) {
      return NextResponse.json(
        { error: "워크아웃을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (workout.userId !== session.user.id) {
      return NextResponse.json(
        { error: "본인의 기록만 수정할 수 있습니다." },
        { status: 403 }
      );
    }

    // Update workout
    const updatedWorkout = await prisma.workout.update({
      where: { id },
      data: { isPublic: Boolean(isPublic) },
    });

    return NextResponse.json(updatedWorkout);
  } catch (error) {
    console.error("Error updating workout:", error);
    return NextResponse.json(
      { error: "워크아웃 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
