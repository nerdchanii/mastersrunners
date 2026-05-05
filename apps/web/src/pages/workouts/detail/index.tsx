import {
  Activity as ActivityIcon,
  ArrowLeft,
  Calendar,
  Flame,
  Footprints,
  Heart,
  HeartPulse,
  ImageIcon,
  MoreHorizontal,
  Mountain,
  Share2,
  Trash2,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { LoadingPage } from "@/components/common/LoadingPage";
import { UserAvatar } from "@/components/common/UserAvatar";
import { CommentList } from "@/components/social/CommentList";
import { LikeButton } from "@/components/social/LikeButton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShareCardGenerator } from "@/components/workout/ShareCardGenerator";
import { WorkoutAnalysisCharts } from "@/components/workout/WorkoutAnalysisCharts";
import { WorkoutAnalysisMap } from "@/components/workout/WorkoutAnalysisMap";
import { WorkoutLapSplitTable } from "@/components/workout/WorkoutLapSplitTable";
import { useDeleteWorkout, useWorkout } from "@/hooks/useWorkouts";
import { useAuth } from "@/lib/auth-context";
import { formatDistance, formatDuration, formatPace } from "@/lib/format";
import {
  buildLapSegments,
  buildWorkoutTrack,
  hasMetricSeries,
  type WorkoutLapLike,
  type WorkoutRoutePointLike,
} from "@/lib/workout-analysis";

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
  visibility?: string | null;
  calories: number | null;
  elevationGain: number | null;
  avgHeartRate: number | null;
  maxHeartRate: number | null;
  avgCadence: number | null;
  maxCadence: number | null;
  liked?: boolean;
  likeCount?: number;
  commentCount?: number;
  user: { id: string; name: string; profileImage: string | null };
  workoutType: { id: string; name: string; category: string } | null;
  shoe: { id: string; brand: string; model: string } | null;
  workoutRoutes?: WorkoutRoute[];
  workoutLaps?: WorkoutLapLike[];
}

export default function WorkoutDetailPage() {
  const { id: workoutId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [shareCardOpen, setShareCardOpen] = useState(false);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const [selectedLapNumber, setSelectedLapNumber] = useState<number | null>(null);

  const { data: workout, isLoading, error } = useWorkout(workoutId ?? "");
  const deleteWorkout = useDeleteWorkout();

  const workoutDetail = useMemo(() => {
    if (!workout) {
      return null;
    }

    const rawWorkout = workout as unknown as WorkoutData;

    return {
      ...rawWorkout,
      visibility: rawWorkout.visibility ?? "FOLLOWERS",
      liked: rawWorkout.liked ?? false,
      likeCount: rawWorkout.likeCount ?? 0,
      commentCount: rawWorkout.commentCount ?? 0,
    };
  }, [workout]);

  const rawRouteData = useMemo<WorkoutRoutePointLike[]>(() => {
    if (!workoutDetail?.workoutRoutes?.[0]?.routeData) {
      return [];
    }

    try {
      const parsed = JSON.parse(workoutDetail.workoutRoutes[0].routeData);
      return Array.isArray(parsed) ? (parsed as WorkoutRoutePointLike[]) : [];
    } catch {
      return [];
    }
  }, [workoutDetail?.workoutRoutes]);

  const track = useMemo(
    () => buildWorkoutTrack(rawRouteData, workoutDetail?.duration ?? 0),
    [rawRouteData, workoutDetail?.duration],
  );
  const lapSegments = useMemo(
    () => buildLapSegments(workoutDetail?.workoutLaps ?? [], track),
    [track, workoutDetail?.workoutLaps],
  );

  useEffect(() => {
    if (track.length === 0) {
      setSelectedPointIndex(null);
      return;
    }

    setSelectedPointIndex((current) => {
      if (current != null && track.some((point) => point.index === current)) {
        return current;
      }
      return track[track.length - 1].index;
    });
  }, [track]);

  const selectedLap =
    selectedLapNumber != null
      ? (lapSegments.find((lap) => lap.lapNumber === selectedLapNumber) ?? null)
      : null;
  const selectedPoint =
    selectedPointIndex != null
      ? (track.find((point) => point.index === selectedPointIndex) ?? null)
      : (track[track.length - 1] ?? null);

  const hasMap = track.length >= 2;
  const hasElevation = hasMetricSeries(track, "elevation");
  const hasHeartRate = hasMetricSeries(track, "heartRate");
  const hasCadence = hasMetricSeries(track, "cadence");
  const hasAnalysis = hasElevation || hasHeartRate || hasCadence;

  const highlightMetrics = [
    workoutDetail?.calories != null && workoutDetail.calories > 0
      ? {
          key: "calories",
          label: "칼로리",
          value: `${Math.round(workoutDetail.calories)} kcal`,
          icon: <Flame className="size-4 text-orange-500" />,
        }
      : null,
    workoutDetail?.elevationGain != null && workoutDetail.elevationGain > 0
      ? {
          key: "elevation",
          label: "누적 고도",
          value: `${Math.round(workoutDetail.elevationGain)} m`,
          icon: <Mountain className="size-4 text-emerald-600" />,
        }
      : null,
    workoutDetail?.avgHeartRate != null && workoutDetail.avgHeartRate > 0
      ? {
          key: "avg-heart-rate",
          label: "평균 심박",
          value: `${Math.round(workoutDetail.avgHeartRate)} bpm`,
          icon: <Heart className="size-4 text-rose-500" />,
        }
      : null,
    workoutDetail?.maxHeartRate != null && workoutDetail.maxHeartRate > 0
      ? {
          key: "max-heart-rate",
          label: "최대 심박",
          value: `${Math.round(workoutDetail.maxHeartRate)} bpm`,
          icon: <HeartPulse className="size-4 text-rose-600" />,
        }
      : null,
    workoutDetail?.avgCadence != null && workoutDetail.avgCadence > 0
      ? {
          key: "avg-cadence",
          label: "평균 케이던스",
          value: `${Math.round(workoutDetail.avgCadence)} spm`,
          icon: <Footprints className="size-4 text-sky-600" />,
        }
      : null,
    workoutDetail?.maxCadence != null && workoutDetail.maxCadence > 0
      ? {
          key: "max-cadence",
          label: "최대 케이던스",
          value: `${Math.round(workoutDetail.maxCadence)} spm`,
          icon: <ActivityIcon className="size-4 text-sky-700" />,
        }
      : null,
  ].filter(Boolean) as Array<{
    key: string;
    label: string;
    value: string;
    icon: ReactNode;
  }>;

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

  const handleSelectPoint = (sourceIndex: number) => {
    setSelectedLapNumber(null);
    setSelectedPointIndex(sourceIndex);
  };

  const handleSelectLap = (lapNumber: number) => {
    setSelectedLapNumber((current) => {
      const nextLapNumber = current === lapNumber ? null : lapNumber;
      if (nextLapNumber == null) {
        return null;
      }

      const nextLap = lapSegments.find((lap) => lap.lapNumber === nextLapNumber);
      if (nextLap && nextLap.startIndex != null && nextLap.endIndex != null) {
        const midpointIndex = Math.round((nextLap.startIndex + nextLap.endIndex) / 2);
        const midpoint = track[midpointIndex];
        if (midpoint) {
          setSelectedPointIndex(midpoint.index);
        }
      }

      return nextLapNumber;
    });
  };

  if (!workoutId) {
    return (
      <div className="rounded-[28px] border border-border/70 bg-background px-6 py-10 text-center shadow-sm">
        <p className="text-muted-foreground">워크아웃 ID가 필요합니다.</p>
        <Button onClick={() => navigate("/workouts")} className="mt-4" variant="outline">
          워크아웃 목록으로
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingPage variant="detail" />;
  }

  if (error) {
    return (
      <div className="rounded-[28px] border border-destructive/40 bg-destructive/5 px-6 py-10 text-center shadow-sm">
        <p className="text-destructive">{error.message || "워크아웃을 불러오는데 실패했습니다."}</p>
        <Button onClick={() => navigate(-1)} className="mt-4" variant="outline">
          돌아가기
        </Button>
      </div>
    );
  }

  if (!workoutDetail) return null;

  const isOwner = currentUser?.id === workoutDetail.user.id;
  const workoutDateLabel = new Date(workoutDetail.date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6 pb-10 md:mx-auto md:max-w-6xl md:px-4">
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

      <ShareCardGenerator
        open={shareCardOpen}
        onOpenChange={setShareCardOpen}
        data={{
          distance: workoutDetail.distance,
          duration: workoutDetail.duration,
          pace: workoutDetail.pace,
          date: workoutDetail.date,
          userName: workoutDetail.user.name,
        }}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-2 md:px-0">
        <Button onClick={() => navigate(-1)} variant="ghost" size="sm" className="-ml-3">
          <ArrowLeft className="size-4" />
          돌아가기
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-9 rounded-full"
                aria-label="공유 메뉴 열기"
              >
                <Share2 className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 rounded-2xl border-border/70 p-2 shadow-lg"
            >
              <DropdownMenuItem className="rounded-xl py-2" onClick={() => setShareCardOpen(true)}>
                <ImageIcon className="size-4" />
                카드 생성
              </DropdownMenuItem>
              <DropdownMenuItem
                className="rounded-xl py-2"
                onClick={() => navigate(`/posts/new?workoutId=${workoutId}`)}
              >
                <Share2 className="size-4" />
                포스트로 공유
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 rounded-full"
                  aria-label="더보기 메뉴 열기"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-40 rounded-2xl border-border/70 p-2 shadow-lg"
              >
                <DropdownMenuItem
                  className="rounded-xl py-2"
                  onClick={() => navigate(`/workouts/${workoutId}/edit`)}
                >
                  수정
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-xl py-2 text-destructive focus:text-destructive"
                  onClick={() => setConfirmOpen(true)}
                >
                  <Trash2 className="size-4" />
                  삭제
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="px-4 md:px-0">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar className="size-3.5" />
          <span>{workoutDateLabel}</span>
        </div>
      </div>

      <section className="border-b border-border/60 pb-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.7fr)] lg:gap-10">
          <div className="relative min-h-[280px] overflow-hidden bg-muted/15 sm:rounded-[28px] md:min-h-[320px]">
            {hasMap ? (
              <>
                <WorkoutAnalysisMap
                  track={track}
                  activePointIndex={selectedPoint?.index ?? null}
                  highlightedLapRange={
                    selectedLap && selectedLap.startIndex != null && selectedLap.endIndex != null
                      ? { startIndex: selectedLap.startIndex, endIndex: selectedLap.endIndex }
                      : null
                  }
                  className="h-[320px] sm:h-[380px] lg:h-full"
                />
                {selectedPoint && (
                  <div className="absolute bottom-4 left-4 right-4 rounded-[24px] border border-white/20 bg-slate-950/72 px-4 py-3 text-white shadow-lg backdrop-blur-sm sm:right-auto">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/60">
                      <span>Route Cursor</span>
                      {selectedLap && <span>Lap {selectedLap.lapNumber}</span>}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-sm">
                      <span>{selectedPoint.distanceKm.toFixed(2)} km</span>
                      <span>{formatDuration(Math.round(selectedPoint.elapsedSeconds))}</span>
                      {selectedPoint.elevation != null && (
                        <span>{Math.round(selectedPoint.elevation)} m</span>
                      )}
                      {selectedPoint.heartRate != null && (
                        <span>{Math.round(selectedPoint.heartRate)} bpm</span>
                      )}
                      {selectedPoint.cadence != null && (
                        <span>{Math.round(selectedPoint.cadence)} spm</span>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div
                data-testid="workout-detail-map-empty"
                className="flex h-[320px] items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.08),_transparent_55%),linear-gradient(180deg,_rgba(15,23,42,0.02),_transparent)] px-6 text-center sm:h-[380px]"
              >
                <div className="max-w-sm space-y-2">
                  <h2 className="text-xl font-semibold text-foreground">
                    GPS 경로가 없는 운동입니다
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    수동 입력 운동이거나 경로 데이터가 없는 파일이라서 지도를 그릴 수 없습니다. 대신
                    기록과 랩, 남아 있는 분석 지표는 계속 확인할 수 있습니다.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6 px-4 sm:px-5 lg:border-l lg:border-border/60 lg:px-0 lg:pl-10">
            <div className="space-y-4">
              <UserAvatar user={workoutDetail.user} showName />

              <div className="space-y-2">
                {workoutDetail.workoutType?.name && (
                  <p className="text-sm text-muted-foreground">{workoutDetail.workoutType.name}</p>
                )}
                {workoutDetail.shoe && (
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Footprints className="size-4 text-muted-foreground" />
                    <span>
                      {workoutDetail.shoe.brand} {workoutDetail.shoe.model}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-y border-border/60 py-4">
              <div className="min-w-0 border-r border-border/60 pr-4">
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  거리
                </p>
                <p className="mt-2 whitespace-nowrap text-2xl font-semibold tracking-tight text-foreground">
                  {formatDistance(workoutDetail.distance)}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">km</span>
                </p>
              </div>
              <div className="min-w-0 border-r border-border/60 pr-4">
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  시간
                </p>
                <p className="mt-2 whitespace-nowrap text-2xl font-semibold tracking-tight text-foreground">
                  {formatDuration(workoutDetail.duration)}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  평균 페이스
                </p>
                <p className="mt-2 flex items-baseline gap-1 whitespace-nowrap text-2xl font-semibold tracking-tight text-foreground">
                  {formatPace(workoutDetail.pace)}
                  <span className="text-sm font-normal text-muted-foreground">/km</span>
                </p>
              </div>
            </div>

            {highlightMetrics.length > 0 && (
              <div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                  {highlightMetrics.map((metric) => (
                    <div key={metric.key} className="border-b border-border/60 pb-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {metric.icon}
                        <span>{metric.label}</span>
                      </div>
                      <p className="mt-2 text-lg font-semibold text-foreground">{metric.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {workoutDetail.memo && (
              <div className="border-t border-border/60 pt-4">
                <p className="text-sm font-medium text-foreground">메모</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {workoutDetail.memo}
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-1">
              <LikeButton
                entityType="workout"
                entityId={workoutDetail.id}
                initialLiked={workoutDetail.liked}
                initialCount={workoutDetail.likeCount}
              />
              <span className="text-sm text-muted-foreground">
                댓글 {workoutDetail.commentCount.toLocaleString()}개
              </span>
            </div>
          </div>
        </div>
      </section>

      {hasAnalysis && (
        <section className="border-t border-border/60 pt-6">
          <WorkoutAnalysisCharts
            track={track}
            activePointIndex={selectedPoint?.index ?? null}
            highlightedLapRange={
              selectedLap
                ? {
                    startDistanceKm: selectedLap.startDistanceKm,
                    endDistanceKm: selectedLap.endDistanceKm,
                  }
                : null
            }
            onSelectPoint={handleSelectPoint}
          />
        </section>
      )}

      {lapSegments.length > 0 && (
        <section className="border-t border-border/60 pt-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">랩 분석</h2>
              <p className="text-sm text-muted-foreground">
                {hasMap
                  ? "랩을 누르면 지도와 차트에서 같은 구간을 강조합니다."
                  : "GPS 경로가 없어도 랩 기록은 그대로 확인할 수 있습니다."}
              </p>
            </div>
            {selectedLap && (
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-full border border-border/60 bg-muted/20 px-3 py-1.5">
                  Lap {selectedLap.lapNumber}
                </span>
                <span className="rounded-full border border-border/60 bg-muted/20 px-3 py-1.5">
                  {selectedLap.startDistanceKm.toFixed(2)} km -{" "}
                  {selectedLap.endDistanceKm.toFixed(2)} km
                </span>
              </div>
            )}
          </div>

          <WorkoutLapSplitTable
            laps={lapSegments}
            selectedLapNumber={selectedLapNumber}
            onSelectLap={handleSelectLap}
          />
        </section>
      )}

      <section className="border-t border-border/60 pt-6">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">댓글</h2>
            <p className="text-sm text-muted-foreground">
              이 기록에 대한 반응과 대화를 함께 확인합니다.
            </p>
          </div>
          <span className="text-sm text-muted-foreground">
            {workoutDetail.commentCount.toLocaleString()}개
          </span>
        </div>
        <CommentList entityType="workout" entityId={workoutDetail.id} />
      </section>
    </div>
  );
}
