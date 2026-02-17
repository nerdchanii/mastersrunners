import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";
import type { GpsPoint } from "./RouteMap";

interface HeartRateChartProps {
  routeData: GpsPoint[];
  className?: string;
}

const HR_ZONES = [
  { name: "회복", max: 120, color: "hsl(210, 50%, 60%)" },
  { name: "유산소", max: 150, color: "hsl(142, 71%, 45%)" },
  { name: "역치", max: 170, color: "hsl(45, 93%, 47%)" },
  { name: "최대", max: 200, color: "hsl(0, 84%, 60%)" },
] as const;

export function HeartRateChart({ routeData, className }: HeartRateChartProps) {
  const data = useMemo(() => {
    const points = routeData.filter((p) => p.heartRate != null && p.heartRate > 0);
    if (points.length < 2) return [];

    const step = Math.max(1, Math.floor(points.length / 300));
    return points
      .filter((_, i) => i % step === 0 || i === points.length - 1)
      .map((p, i) => ({
        index: i,
        hr: p.heartRate!,
      }));
  }, [routeData]);

  if (data.length < 2) return null;

  const maxHr = Math.max(...data.map((d) => d.hr));
  const yMax = Math.min(220, Math.ceil((maxHr + 10) / 10) * 10);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Heart className="size-4 text-red-500" />
          심박수
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
              <XAxis dataKey="index" hide />
              <YAxis
                domain={[40, yMax]}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${v}`}
                label={{ value: "bpm", position: "insideTopLeft", offset: -4, fontSize: 11 }}
              />
              {HR_ZONES.map((zone) => (
                <ReferenceLine
                  key={zone.name}
                  y={zone.max}
                  stroke={zone.color}
                  strokeDasharray="3 3"
                  strokeOpacity={0.5}
                />
              ))}
              <Tooltip
                formatter={(value) => [`${value} bpm`, "심박수"]}
                labelFormatter={() => ""}
              />
              <Line
                type="monotone"
                dataKey="hr"
                stroke="hsl(0, 84%, 60%)"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
          {HR_ZONES.map((zone) => (
            <span key={zone.name} className="flex items-center gap-1">
              <span
                className="inline-block size-2 rounded-full"
                style={{ backgroundColor: zone.color }}
              />
              {zone.name} (~{zone.max})
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
