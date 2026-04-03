import { ArrowRight, Footprints, Heart, Mountain } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { MiniRouteMap } from "@/components/workout/MiniRouteMap";
import { formatDistance, formatDuration, formatPace } from "@/lib/format";

interface WorkoutAttachmentPreviewProps {
  workout: {
    id: string;
    distance: number;
    duration: number;
    pace: number;
    date: string;
    elevationGain?: number | null;
    avgHeartRate?: number | null;
    avgCadence?: number | null;
    workoutType?: { name: string } | null;
    route?: { encodedPolyline: string } | null;
  };
}

export function WorkoutAttachmentPreview({ workout }: WorkoutAttachmentPreviewProps) {
  const opensAnalysisReport =
    Boolean(workout.route?.encodedPolyline) ||
    workout.elevationGain != null ||
    workout.avgHeartRate != null ||
    workout.avgCadence != null;
  const metrics = [
    workout.elevationGain != null && workout.elevationGain > 0
      ? {
          icon: <Mountain className="size-3.5" />,
          label: `상승 ${Math.round(workout.elevationGain)}m`,
        }
      : null,
    workout.avgHeartRate != null && workout.avgHeartRate > 0
      ? {
          icon: <Heart className="size-3.5" />,
          label: `평균 심박 ${Math.round(workout.avgHeartRate)}bpm`,
        }
      : null,
    workout.avgCadence != null && workout.avgCadence > 0
      ? {
          icon: <Footprints className="size-3.5" />,
          label: `케이던스 ${Math.round(workout.avgCadence)}spm`,
        }
      : null,
  ].filter(Boolean) as Array<{ icon: ReactNode; label: string }>;

  return (
    <Link
      to={`/workouts/${encodeURIComponent(workout.id)}`}
      data-testid={`post-workout-preview-${workout.id}`}
      aria-label={`워크아웃 ${workout.workoutType?.name ?? "런닝"} 상세 열기`}
      className="group block rounded-[24px] border border-border/60 bg-background/85 px-4 py-4 transition-colors hover:bg-accent/15"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-foreground">
                {workout.workoutType?.name ?? "런닝"}
              </p>
              <span className="rounded-full border border-border/60 bg-muted/25 px-2 py-0.5 text-[11px] text-muted-foreground">
                {opensAnalysisReport ? "분석 리포트 열기" : "기록 상세 열기"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(workout.date).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-[11px] text-muted-foreground">거리</p>
              <p className="font-semibold text-foreground">{formatDistance(workout.distance)} km</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">시간</p>
              <p className="font-semibold text-foreground">{formatDuration(workout.duration)}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">평균 페이스</p>
              <p className="font-semibold text-foreground">{formatPace(workout.pace)}/km</p>
            </div>
          </div>

          {metrics.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {metrics.map((metric) => (
                <span
                  key={metric.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/20 px-2.5 py-1 text-[11px] text-muted-foreground"
                >
                  {metric.icon}
                  {metric.label}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-3">
          {workout.route?.encodedPolyline ? (
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-2 text-primary">
              <MiniRouteMap
                encodedPolyline={workout.route.encodedPolyline}
                size={72}
                strokeColor="currentColor"
                strokeWidth={2.2}
              />
            </div>
          ) : null}
          <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
            <span>{opensAnalysisReport ? "리포트" : "상세"}</span>
            <ArrowRight className="size-3.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
