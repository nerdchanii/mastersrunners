import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mountain } from "lucide-react";
import type { GpsPoint } from "./RouteMap";

interface ElevationChartProps {
  routeData: GpsPoint[];
  className?: string;
}

function haversineDistance(a: GpsPoint, b: GpsPoint): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLon * sinLon;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function ElevationChart({ routeData, className }: ElevationChartProps) {
  const data = useMemo(() => {
    const points = routeData.filter((p) => p.elevation != null);
    if (points.length < 2) return [];

    let cumDistance = 0;
    return points.map((p, i) => {
      if (i > 0) cumDistance += haversineDistance(points[i - 1], p);
      return {
        distance: +(cumDistance / 1000).toFixed(2),
        elevation: Math.round(p.elevation!),
      };
    });
  }, [routeData]);

  if (data.length < 2) return null;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Mountain className="size-4" />
          고도
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
              <defs>
                <linearGradient id="elevGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="distance"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${v}`}
                label={{ value: "km", position: "insideBottomRight", offset: -4, fontSize: 11 }}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${v}`}
                label={{ value: "m", position: "insideTopLeft", offset: -4, fontSize: 11 }}
              />
              <Tooltip
                formatter={(value) => [`${value}m`, "고도"]}
                labelFormatter={(label) => `${label} km`}
              />
              <Area
                type="monotone"
                dataKey="elevation"
                stroke="hsl(142, 71%, 45%)"
                strokeWidth={2}
                fill="url(#elevGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
