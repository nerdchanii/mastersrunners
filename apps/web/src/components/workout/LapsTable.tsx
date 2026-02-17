import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ListOrdered } from "lucide-react";
import { formatDistance, formatDuration, formatPace } from "@/lib/format";

export interface WorkoutLap {
  lapNumber: number;
  distance: number; // meters
  duration: number; // seconds
  avgPace: number; // sec/km
  avgHeartRate?: number | null;
  maxHeartRate?: number | null;
  avgCadence?: number | null;
  calories?: number | null;
}

interface LapsTableProps {
  laps: WorkoutLap[];
  className?: string;
}

export function LapsTable({ laps, className }: LapsTableProps) {
  if (laps.length === 0) return null;

  const hasHr = laps.some((l) => l.avgHeartRate != null);
  const hasCadence = laps.some((l) => l.avgCadence != null);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ListOrdered className="size-4" />
          랩 ({laps.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>거리</TableHead>
              <TableHead>시간</TableHead>
              <TableHead>페이스</TableHead>
              {hasHr && <TableHead>평균 HR</TableHead>}
              {hasCadence && <TableHead>케이던스</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {laps.map((lap) => (
              <TableRow key={lap.lapNumber}>
                <TableCell className="font-medium tabular-nums">
                  {lap.lapNumber}
                </TableCell>
                <TableCell className="tabular-nums">
                  {formatDistance(lap.distance)} km
                </TableCell>
                <TableCell className="tabular-nums">
                  {formatDuration(lap.duration)}
                </TableCell>
                <TableCell className="tabular-nums">
                  {formatPace(lap.avgPace)}/km
                </TableCell>
                {hasHr && (
                  <TableCell className="tabular-nums">
                    {lap.avgHeartRate != null ? `${lap.avgHeartRate} bpm` : "-"}
                  </TableCell>
                )}
                {hasCadence && (
                  <TableCell className="tabular-nums">
                    {lap.avgCadence != null ? `${lap.avgCadence} spm` : "-"}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
