import { Activity, Heart, Mountain } from "lucide-react";
import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ValueType } from "recharts/types/component/DefaultTooltipContent";

import { formatDuration } from "@/lib/format";
import {
  hasMetricSeries,
  sampleWorkoutTrack,
  type WorkoutTrackPoint,
} from "@/lib/workout-analysis";

interface WorkoutAnalysisChartsProps {
  track: WorkoutTrackPoint[];
  activePointIndex?: number | null;
  highlightedLapRange?: { startDistanceKm: number; endDistanceKm: number } | null;
  onSelectPoint: (sourceIndex: number) => void;
}

const GRID_STROKE = "rgba(148, 163, 184, 0.18)";

function ChartWrapper({
  title,
  subtitle,
  children,
  icon,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  icon: ReactNode;
}) {
  return (
    <section className="border-t border-border/50 pt-5 first:border-t-0 first:pt-0">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className="rounded-full bg-muted/25 p-2 text-muted-foreground">{icon}</div>
      </div>
      <div className="h-56 w-full">{children}</div>
    </section>
  );
}

export function WorkoutAnalysisCharts({
  track,
  activePointIndex = null,
  highlightedLapRange = null,
  onSelectPoint,
}: WorkoutAnalysisChartsProps) {
  const sampledTrack = sampleWorkoutTrack(track);

  const selectedPoint =
    activePointIndex != null
      ? (track.find((point) => point.index === activePointIndex) ?? null)
      : null;
  const hasElevation = hasMetricSeries(track, "elevation");
  const hasHeartRate = hasMetricSeries(track, "heartRate");
  const hasCadence = hasMetricSeries(track, "cadence");

  if (!hasElevation && !hasHeartRate && !hasCadence) {
    return null;
  }

  const handleMove = (state: unknown) => {
    const nextState = state as {
      activePayload?: Array<{ payload?: WorkoutTrackPoint }>;
    };
    const sourceIndex = nextState.activePayload?.[0]?.payload?.index;
    if (typeof sourceIndex === "number") {
      onSelectPoint(sourceIndex);
    }
  };

  const formatTooltipValue = (
    value: ValueType | undefined,
    suffix: string,
    label: string,
  ): [string, string] => [
    `${Math.round(Number(Array.isArray(value) ? value[0] : (value ?? 0)))} ${suffix}`,
    label,
  ];

  const formatTooltipLabel = (label: unknown) => `${Number(label ?? 0).toFixed(2)} km`;

  return (
    <div className="space-y-5" data-testid="workout-detail-analytics">
      <div className="flex flex-col gap-3 rounded-[24px] border border-border/60 bg-background/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">분석 리포트</h2>
          <p className="text-sm text-muted-foreground">
            차트를 탭하거나 따라 움직이면 지도에서도 같은 지점을 함께 확인할 수 있습니다.
          </p>
        </div>
        {selectedPoint && (
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border border-border/60 bg-muted/30 px-3 py-1.5">
              {selectedPoint.distanceKm.toFixed(2)} km
            </span>
            <span className="rounded-full border border-border/60 bg-muted/30 px-3 py-1.5">
              {formatDuration(Math.round(selectedPoint.elapsedSeconds))}
            </span>
            {selectedPoint.elevation != null && (
              <span className="rounded-full border border-border/60 bg-muted/30 px-3 py-1.5">
                고도 {Math.round(selectedPoint.elevation)} m
              </span>
            )}
            {selectedPoint.heartRate != null && (
              <span className="rounded-full border border-border/60 bg-muted/30 px-3 py-1.5">
                심박 {Math.round(selectedPoint.heartRate)} bpm
              </span>
            )}
            {selectedPoint.cadence != null && (
              <span className="rounded-full border border-border/60 bg-muted/30 px-3 py-1.5">
                케이던스 {Math.round(selectedPoint.cadence)} spm
              </span>
            )}
          </div>
        )}
      </div>

      {hasElevation && (
        <ChartWrapper
          title="고도"
          subtitle="누적 거리 기준으로 코스의 상승과 하강을 확인합니다."
          icon={<Mountain className="size-4" />}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={sampledTrack}
              onClick={handleMove}
              onMouseMove={handleMove}
              margin={{ top: 8, right: 8, bottom: 0, left: -20 }}
            >
              <defs>
                <linearGradient id="workout-elevation-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.32} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={GRID_STROKE} vertical={false} />
              <XAxis
                dataKey="distanceKm"
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => `${value.toFixed(1)} km`}
                minTickGap={24}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => `${Math.round(value)}`}
                width={36}
              />
              {highlightedLapRange && (
                <ReferenceArea
                  x1={highlightedLapRange.startDistanceKm}
                  x2={highlightedLapRange.endDistanceKm}
                  fill="#f97316"
                  fillOpacity={0.08}
                  strokeOpacity={0}
                />
              )}
              {selectedPoint && (
                <ReferenceLine
                  x={selectedPoint.distanceKm}
                  stroke="#2563eb"
                  strokeDasharray="4 4"
                />
              )}
              <Tooltip
                formatter={(value) => formatTooltipValue(value, "m", "고도")}
                labelFormatter={formatTooltipLabel}
              />
              <Area
                type="monotone"
                dataKey="elevation"
                stroke="#16a34a"
                strokeWidth={2}
                fill="url(#workout-elevation-fill)"
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartWrapper>
      )}

      {hasHeartRate && (
        <ChartWrapper
          title="심박"
          subtitle="훈련 강도의 변화를 거리 축 위에서 확인합니다."
          icon={<Heart className="size-4 text-red-500" />}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={sampledTrack}
              onClick={handleMove}
              onMouseMove={handleMove}
              margin={{ top: 8, right: 8, bottom: 0, left: -20 }}
            >
              <CartesianGrid stroke={GRID_STROKE} vertical={false} />
              <XAxis
                dataKey="distanceKm"
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => `${value.toFixed(1)} km`}
                minTickGap={24}
              />
              <YAxis tick={{ fontSize: 11 }} width={36} />
              {highlightedLapRange && (
                <ReferenceArea
                  x1={highlightedLapRange.startDistanceKm}
                  x2={highlightedLapRange.endDistanceKm}
                  fill="#f97316"
                  fillOpacity={0.08}
                  strokeOpacity={0}
                />
              )}
              {selectedPoint && (
                <ReferenceLine
                  x={selectedPoint.distanceKm}
                  stroke="#2563eb"
                  strokeDasharray="4 4"
                />
              )}
              <Tooltip
                formatter={(value) => formatTooltipValue(value, "bpm", "심박")}
                labelFormatter={formatTooltipLabel}
              />
              <Line
                type="monotone"
                dataKey="heartRate"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartWrapper>
      )}

      {hasCadence && (
        <ChartWrapper
          title="케이던스"
          subtitle="보폭 리듬의 변화를 같은 거리 축 위에서 비교합니다."
          icon={<Activity className="size-4" />}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={sampledTrack}
              onClick={handleMove}
              onMouseMove={handleMove}
              margin={{ top: 8, right: 8, bottom: 0, left: -20 }}
            >
              <CartesianGrid stroke={GRID_STROKE} vertical={false} />
              <XAxis
                dataKey="distanceKm"
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => `${value.toFixed(1)} km`}
                minTickGap={24}
              />
              <YAxis tick={{ fontSize: 11 }} width={36} />
              {highlightedLapRange && (
                <ReferenceArea
                  x1={highlightedLapRange.startDistanceKm}
                  x2={highlightedLapRange.endDistanceKm}
                  fill="#f97316"
                  fillOpacity={0.08}
                  strokeOpacity={0}
                />
              )}
              {selectedPoint && (
                <ReferenceLine
                  x={selectedPoint.distanceKm}
                  stroke="#2563eb"
                  strokeDasharray="4 4"
                />
              )}
              <Tooltip
                formatter={(value) => formatTooltipValue(value, "spm", "케이던스")}
                labelFormatter={formatTooltipLabel}
              />
              <Line
                type="monotone"
                dataKey="cadence"
                stroke="#0f766e"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartWrapper>
      )}
    </div>
  );
}
