import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import WorkoutDetailPage from "./index";

const { useWorkoutMock, mutateAsyncMock, navigateMock } = vi.hoisted(() => ({
  useWorkoutMock: vi.fn(),
  mutateAsyncMock: vi.fn(),
  navigateMock: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => navigateMock,
  useParams: () => ({ id: "workout-1" }),
}));

vi.mock("@/hooks/useWorkouts", () => ({
  useWorkout: (id: string) => useWorkoutMock(id),
  useDeleteWorkout: () => ({
    mutateAsync: mutateAsyncMock,
    isPending: false,
  }),
}));

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    user: {
      id: "owner-1",
    },
  }),
}));

vi.mock("@/components/common/ConfirmDialog", () => ({
  ConfirmDialog: () => null,
}));

vi.mock("@/components/common/LoadingPage", () => ({
  LoadingPage: () => <div>loading</div>,
}));

vi.mock("@/components/common/UserAvatar", () => ({
  UserAvatar: ({ user }: { user: { name: string } }) => <div>{user.name}</div>,
}));

vi.mock("@/components/social/CommentList", () => ({
  CommentList: () => <div data-testid="comment-list" />,
}));

vi.mock("@/components/social/LikeButton", () => ({
  LikeButton: () => <div data-testid="like-button" />,
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children }: { children: ReactNode }) => <button>{children}</button>,
}));

vi.mock("@/components/workout/ShareCardGenerator", () => ({
  ShareCardGenerator: () => null,
}));

vi.mock("@/components/workout/WorkoutAnalysisCharts", () => ({
  WorkoutAnalysisCharts: () => <div data-testid="workout-analysis-charts" />,
}));

vi.mock("@/components/workout/WorkoutAnalysisMap", () => ({
  WorkoutAnalysisMap: () => <div data-testid="workout-analysis-map" />,
}));

vi.mock("@/components/workout/WorkoutLapSplitTable", () => ({
  WorkoutLapSplitTable: ({ laps }: { laps: Array<{ lapNumber: number }> }) => (
    <div data-testid="workout-lap-split-table">{laps.map((lap) => lap.lapNumber).join(",")}</div>
  ),
}));

describe("WorkoutDetailPage", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    mutateAsyncMock.mockReset();
    useWorkoutMock.mockReset();
  });

  it("shows the empty-map state while keeping lap detail visible when only route data is missing", () => {
    useWorkoutMock.mockReturnValue({
      data: {
        id: "workout-1",
        distance: 5000,
        duration: 1500,
        pace: 300,
        date: "2026-04-23T00:00:00.000Z",
        memo: "detail blob missing",
        visibility: "PUBLIC",
        calories: 420,
        elevationGain: 35,
        avgHeartRate: 150,
        maxHeartRate: 168,
        avgCadence: 176,
        maxCadence: 182,
        liked: false,
        likeCount: 0,
        commentCount: 2,
        user: {
          id: "owner-1",
          name: "Runner",
          profileImage: null,
        },
        workoutType: {
          id: "type-1",
          name: "Easy Run",
          category: "EASY",
        },
        shoe: null,
        workoutRoutes: [],
        workoutLaps: [
          {
            lapNumber: 1,
            distance: 1000,
            duration: 300,
            pace: 300,
            startedAt: "2026-04-23T00:00:00.000Z",
          },
        ],
      },
      isLoading: false,
      error: null,
    });

    render(<WorkoutDetailPage />);

    expect(screen.getByText("GPS 경로가 없는 운동입니다")).toBeInTheDocument();
    expect(
      screen.getByText(
        /수동 입력 운동이거나 경로 데이터가 없는 파일이라서 지도를 그릴 수 없습니다/,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("랩 분석")).toBeInTheDocument();
    expect(screen.getByTestId("workout-lap-split-table")).toHaveTextContent("1");
    expect(screen.queryByTestId("workout-analysis-map")).not.toBeInTheDocument();
  });

  it("gracefully degrades when the detail payload has neither route nor lap data", () => {
    useWorkoutMock.mockReturnValue({
      data: {
        id: "workout-1",
        distance: 5000,
        duration: 1500,
        pace: 300,
        date: "2026-04-23T00:00:00.000Z",
        memo: "detail blob unreadable",
        visibility: "PUBLIC",
        calories: 420,
        elevationGain: 35,
        avgHeartRate: 150,
        maxHeartRate: 168,
        avgCadence: 176,
        maxCadence: 182,
        liked: false,
        likeCount: 0,
        commentCount: 2,
        user: {
          id: "owner-1",
          name: "Runner",
          profileImage: null,
        },
        workoutType: {
          id: "type-1",
          name: "Easy Run",
          category: "EASY",
        },
        shoe: null,
        workoutRoutes: [],
        workoutLaps: [],
      },
      isLoading: false,
      error: null,
    });

    render(<WorkoutDetailPage />);

    expect(screen.getByText("GPS 경로가 없는 운동입니다")).toBeInTheDocument();
    expect(screen.getByText("거리")).toBeInTheDocument();
    expect(screen.queryByText("랩 분석")).not.toBeInTheDocument();
    expect(screen.queryByTestId("workout-analysis-map")).not.toBeInTheDocument();
  });
});
