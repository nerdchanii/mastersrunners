import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Trash2,
  Calendar,
  Activity as ActivityIcon,
  Footprints,
  Share2,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useWorkout, useDeleteWorkout } from "@/hooks/useWorkouts";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
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
import { ShareCardGenerator } from "@/components/workout/ShareCardGenerator";
import { formatDistance, formatDuration, formatPace } from "@/lib/format";

interface WorkoutRoute {
  id: string;
  routeData: string;
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
  const { id: workoutId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [shareCardOpen, setShareCardOpen] = useState(false);

  const { data: workout, isLoading, error } = useWorkout(workoutId ?? "");
  const deleteWorkout = useDeleteWorkout();

  const typedWorkout = workout as WorkoutData | undefined;

  const routeData = useMemo<GpsPoint[]>(() => {
    if (!typedWorkout?.workoutRoutes?.length) return [];
    try {
      return JSON.parse(typedWorkout.workoutRoutes[0].routeData) as GpsPoint[];
    } catch {
      return [];
    }
  }, [typedWorkout]);

  const hasElevation = useMemo(
    () => routeData.some((p) => p.elevation != null),
    [routeData],
  );
  const hasHeartRate = useMemo(
    () => routeData.some((p) => p.heartRate != null && p.heartRate > 0),
    [routeData],
  );

  const metricsData = useMemo<WorkoutMetricsData | null>(() => {
    if (!typedWorkout) return null;
    return {
      calories: typedWorkout.calories,
      elevationGain: typedWorkout.elevationGain,
      avgHeartRate: typedWorkout.avgHeartRate,
      maxHeartRate: typedWorkout.maxHeartRate,
      avgCadence: typedWorkout.avgCadence,
      maxCadence: typedWorkout.maxCadence,
    };
  }, [typedWorkout]);

  const handleDelete = async () => {
    if (!workoutId) return;
    try {
      await deleteWorkout.mutateAsync(workoutId);
      toast.success("워크아웃이 삭제되었습니다.");
      navigate("/workouts");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    }
    setConfirmOpen(false);
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

  if (isLoading) {
    return <LoadingPage variant="detail" />;
  }

  if (error) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <p className="text-destructive">{error.message || "워크아웃을 불러오는데 실패했습니다."}</p>
          <Button onClick={() => navigate(-1)} className="mt-4" variant="outline">
            돌아가기
          </Button>
        </div>
      </Card>
    );
  }

  if (!typedWorkout) return null;

  const isOwner = currentUser?.id === typedWorkout.user.id;
  const laps = typedWorkout.workoutLaps ?? [];
  const sourceFile = typedWorkout.workoutFiles?.[0] ?? null;

  const encodedPolyline = typedWorkout?.workoutRoutes?.[0]
    ? (() => {
        try {
          const parsed = JSON.parse(typedWorkout!.workoutRoutes![0].routeData);
          return parsed as string | null;
        } catch {
          return null;
        }
      })()
    : null;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="워크아웃 삭제"
        description="이 워크아웃을 삭제하시겠습니까? 삭제 후 복구할 수 없습니다."
        confirmLabel="삭제"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleteWorkout.isPending}
      />

      {typedWorkout && (
        <ShareCardGenerator
          open={shareCardOpen}
          onOpenChange={setShareCardOpen}
          data={{
            distance: typedWorkout.distance,
            duration: typedWorkout.duration,
            pace: typedWorkout.pace,
            date: typedWorkout.date,
            userName: typedWorkout.user.name,
            encodedPolyline: typeof encodedPolyline === "string" ? encodedPolyline : undefined,
          }}
        />
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button onClick={() => navigate(-1)} variant="ghost" size="sm">
          <ArrowLeft className="size-4" />
          돌아가기
        </Button>
        <div className="flex items-center gap-2">
          {isOwner && (
            <>
              <Button onClick={() => navigate(`/workouts/${workoutId}/edit`)} variant="outline" size="sm">
                수정
              </Button>
              <Button onClick={() => setConfirmOpen(true)} variant="destructive" size="sm">
                <Trash2 className="size-4" />
                삭제
              </Button>
            </>
          )}
          <Button
            onClick={() => setShareCardOpen(true)}
            variant="outline"
            size="sm"
          >
            <ImageIcon className="size-4" />
            카드 생성
          </Button>
          <Button
            onClick={() => navigate(`/posts/new?workoutId=${workoutId}`)}
            variant="outline"
            size="sm"
          >
            <Share2 className="size-4" />
            포스트로 공유
          </Button>
        </div>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <UserAvatar user={typedWorkout.user} showName subtitle={
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="size-3" />
              {new Date(typedWorkout.date).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          } />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-around py-4 border-y">
            <StatItem value={`${formatDistance(typedWorkout.distance)} km`} label="거리" />
            <StatItem value={formatDuration(typedWorkout.duration)} label="시간" />
            <StatItem value={`${formatPace(typedWorkout.pace)}/km`} label="페이스" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {typedWorkout.workoutType && (
              <>
                <ActivityIcon className="size-4 text-muted-foreground" />
                <Badge variant="secondary">{typedWorkout.workoutType.name}</Badge>
                <span className="text-xs text-muted-foreground">
                  {typedWorkout.workoutType.category}
                </span>
              </>
            )}
          </div>

          {typedWorkout.shoe && (
            <div className="flex items-center gap-2">
              <Footprints className="size-4 text-muted-foreground" />
              <span className="text-sm text-foreground">
                {typedWorkout.shoe.brand} {typedWorkout.shoe.model}
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
          {typedWorkout.memo && (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-foreground whitespace-pre-wrap">{typedWorkout.memo}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <LikeButton
              entityType="workout"
              entityId={typedWorkout.id}
              initialLiked={typedWorkout.liked}
              initialCount={typedWorkout.likeCount}
            />
            <Badge variant="outline" className="capitalize">
              {typedWorkout.visibility.toLowerCase()}
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
          <CardDescription>{typedWorkout.commentCount}개의 댓글</CardDescription>
        </CardHeader>
        <CardContent>
          <CommentList entityType="workout" entityId={typedWorkout.id} />
        </CardContent>
      </Card>
    </div>
  );
}
