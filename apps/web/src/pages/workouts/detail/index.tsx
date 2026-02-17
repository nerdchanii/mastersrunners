import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Trash2,
  Calendar,
  Activity as ActivityIcon,
  Footprints,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import { UserAvatar } from "@/components/common/UserAvatar";
import { LoadingPage } from "@/components/common/LoadingPage";
import { StatItem } from "@/components/common/StatItem";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LikeButton } from "@/components/social/LikeButton";
import { CommentList } from "@/components/social/CommentList";
import { RouteMap, type GpsPoint } from "@/components/workout/RouteMap";
import { ElevationChart } from "@/components/workout/ElevationChart";
import { HeartRateChart } from "@/components/workout/HeartRateChart";
import { LapsTable, type WorkoutLap } from "@/components/workout/LapsTable";
import { WorkoutMetrics, type WorkoutMetricsData } from "@/components/workout/WorkoutMetrics";
import { SourceInfo, type WorkoutFile } from "@/components/workout/SourceInfo";
import { formatDistance, formatDuration, formatPace } from "@/lib/format";

interface WorkoutRoute {
  id: string;
  routeData: string; // JSON string of GpsPoint[]
}

interface WorkoutData {
  id: string;
  distance: number;
  duration: number;
  pace: number;
  date: string;
  memo: string | null;
  visibility: string;
  calories: number | null;
  elevationGain: number | null;
  avgHeartRate: number | null;
  maxHeartRate: number | null;
  avgCadence: number | null;
  maxCadence: number | null;
  liked: boolean;
  likeCount: number;
  commentCount: number;
  user: { id: string; name: string; profileImage: string | null };
  workoutType: { id: string; name: string; category: string } | null;
  shoe: { id: string; brand: string; model: string } | null;
  workoutRoutes?: WorkoutRoute[];
  workoutFiles?: WorkoutFile[];
  workoutLaps?: WorkoutLap[];
}

export default function WorkoutDetailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user: currentUser, isLoading: authLoading, isAuthenticated } = useAuth();
  const [workout, setWorkout] = useState<WorkoutData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const workoutId = searchParams.get("id");

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { navigate("/login", { replace: true }); return; }
    if (!workoutId) return;

    const fetchWorkout = async () => {
      try {
        const data = await api.fetch<WorkoutData>(`/workouts/${workoutId}`);
        setWorkout(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "워크아웃을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorkout();
  }, [authLoading, isAuthenticated, navigate, workoutId]);

  const routeData = useMemo<GpsPoint[]>(() => {
    if (!workout?.workoutRoutes?.length) return [];
    try {
      return JSON.parse(workout.workoutRoutes[0].routeData) as GpsPoint[];
    } catch {
      return [];
    }
  }, [workout]);

  const hasElevation = useMemo(
    () => routeData.some((p) => p.elevation != null),
    [routeData],
  );
  const hasHeartRate = useMemo(
    () => routeData.some((p) => p.heartRate != null && p.heartRate > 0),
    [routeData],
  );

  const metricsData = useMemo<WorkoutMetricsData | null>(() => {
    if (!workout) return null;
    return {
      calories: workout.calories,
      elevationGain: workout.elevationGain,
      avgHeartRate: workout.avgHeartRate,
      maxHeartRate: workout.maxHeartRate,
      avgCadence: workout.avgCadence,
      maxCadence: workout.maxCadence,
    };
  }, [workout]);

  const handleDelete = async () => {
    if (!workoutId || !confirm("이 워크아웃을 삭제하시겠습니까?")) return;
    setIsDeleting(true);
    try {
      await api.fetch(`/workouts/${workoutId}`, { method: "DELETE" });
      navigate("/workouts");
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제에 실패했습니다.");
      setIsDeleting(false);
    }
  };

  if (!workoutId) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <p className="text-muted-foreground">워크아웃 ID가 필요합니다.</p>
          <Button onClick={() => navigate("/workouts")} className="mt-4" variant="outline">
            워크아웃 목록으로
          </Button>
        </div>
      </Card>
    );
  }

  if (authLoading || isLoading) {
    return <LoadingPage variant="detail" />;
  }

  if (error) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <p className="text-destructive">{error}</p>
          <Button onClick={() => navigate(-1)} className="mt-4" variant="outline">
            돌아가기
          </Button>
        </div>
      </Card>
    );
  }

  if (!workout) return null;

  const isOwner = currentUser?.id === workout.user.id;
  const laps = workout.workoutLaps ?? [];
  const sourceFile = workout.workoutFiles?.[0] ?? null;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button onClick={() => navigate(-1)} variant="ghost" size="sm">
          <ArrowLeft className="size-4" />
          돌아가기
        </Button>
        {isOwner && (
          <Button onClick={handleDelete} disabled={isDeleting} variant="destructive" size="sm">
            <Trash2 className="size-4" />
            {isDeleting ? "삭제 중..." : "삭제"}
          </Button>
        )}
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <UserAvatar user={workout.user} showName subtitle={
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="size-3" />
              {new Date(workout.date).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          } />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-around py-4 border-y">
            <StatItem value={`${formatDistance(workout.distance)} km`} label="거리" />
            <StatItem value={formatDuration(workout.duration)} label="시간" />
            <StatItem value={`${formatPace(workout.pace)}/km`} label="페이스" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {workout.workoutType && (
              <>
                <ActivityIcon className="size-4 text-muted-foreground" />
                <Badge variant="secondary">{workout.workoutType.name}</Badge>
                <span className="text-xs text-muted-foreground">
                  {workout.workoutType.category}
                </span>
              </>
            )}
          </div>

          {workout.shoe && (
            <div className="flex items-center gap-2">
              <Footprints className="size-4 text-muted-foreground" />
              <span className="text-sm text-foreground">
                {workout.shoe.brand} {workout.shoe.model}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Route Map */}
      {routeData.length > 0 && <RouteMap routeData={routeData} />}

      {/* Charts: Elevation + HeartRate */}
      {(hasElevation || hasHeartRate) && (
        <div className="grid gap-4 md:grid-cols-2">
          {hasElevation && <ElevationChart routeData={routeData} />}
          {hasHeartRate && <HeartRateChart routeData={routeData} />}
        </div>
      )}

      {/* Workout Metrics */}
      {metricsData && <WorkoutMetrics data={metricsData} />}

      {/* Laps */}
      {laps.length > 0 && <LapsTable laps={laps} />}

      {/* Memo + Source + Social */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          {workout.memo && (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-foreground whitespace-pre-wrap">{workout.memo}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <LikeButton
              entityType="workout"
              entityId={workout.id}
              initialLiked={workout.liked}
              initialCount={workout.likeCount}
            />
            <Badge variant="outline" className="capitalize">
              {workout.visibility.toLowerCase()}
            </Badge>
          </div>

          {sourceFile && (
            <div className="border-t pt-3">
              <SourceInfo file={sourceFile} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments */}
      <Card>
        <CardHeader>
          <CardTitle>댓글</CardTitle>
          <CardDescription>{workout.commentCount}개의 댓글</CardDescription>
        </CardHeader>
        <CardContent>
          <CommentList entityType="workout" entityId={workout.id} />
        </CardContent>
      </Card>
    </div>
  );
}
