import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Flame,
  Mountain,
  Heart,
  HeartPulse,
  Footprints,
  Activity,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface MetricDef {
  key: string;
  label: string;
  icon: LucideIcon;
  format: (v: number) => string;
  iconColor: string;
}

const METRICS: MetricDef[] = [
  {
    key: "calories",
    label: "칼로리",
    icon: Flame,
    format: (v) => `${Math.round(v)} kcal`,
    iconColor: "text-orange-500",
  },
  {
    key: "elevationGain",
    label: "누적 고도",
    icon: Mountain,
    format: (v) => `${Math.round(v)} m`,
    iconColor: "text-green-600",
  },
  {
    key: "avgHeartRate",
    label: "평균 심박",
    icon: Heart,
    format: (v) => `${Math.round(v)} bpm`,
    iconColor: "text-red-500",
  },
  {
    key: "maxHeartRate",
    label: "최대 심박",
    icon: HeartPulse,
    format: (v) => `${Math.round(v)} bpm`,
    iconColor: "text-red-600",
  },
  {
    key: "avgCadence",
    label: "평균 케이던스",
    icon: Footprints,
    format: (v) => `${Math.round(v)} spm`,
    iconColor: "text-blue-500",
  },
  {
    key: "maxCadence",
    label: "최대 케이던스",
    icon: Activity,
    format: (v) => `${Math.round(v)} spm`,
    iconColor: "text-blue-600",
  },
];

export interface WorkoutMetricsData {
  calories?: number | null;
  elevationGain?: number | null;
  avgHeartRate?: number | null;
  maxHeartRate?: number | null;
  avgCadence?: number | null;
  maxCadence?: number | null;
}

interface WorkoutMetricsProps {
  data: WorkoutMetricsData;
  className?: string;
}

export function WorkoutMetrics({ data, className }: WorkoutMetricsProps) {
  const available = METRICS.filter((m) => {
    const val = data[m.key as keyof WorkoutMetricsData];
    return val != null && val > 0;
  });

  if (available.length === 0) return null;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">상세 지표</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {available.map((metric) => {
            const Icon = metric.icon;
            const value = data[metric.key as keyof WorkoutMetricsData]!;
            return (
              <div
                key={metric.key}
                className="flex flex-col items-center gap-1 rounded-lg border bg-muted/30 p-3 text-center"
              >
                <Icon className={`size-5 ${metric.iconColor}`} />
                <span className="text-lg font-bold tabular-nums">
                  {metric.format(value)}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {metric.label}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
