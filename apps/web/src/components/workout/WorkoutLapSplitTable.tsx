import { formatDistance, formatDuration, formatPace } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { WorkoutLapSegment } from "@/lib/workout-analysis";

interface WorkoutLapSplitTableProps {
  laps: WorkoutLapSegment[];
  selectedLapNumber?: number | null;
  onSelectLap?: (lapNumber: number) => void;
}

export function WorkoutLapSplitTable({
  laps,
  selectedLapNumber = null,
  onSelectLap,
}: WorkoutLapSplitTableProps) {
  if (laps.length === 0) {
    return null;
  }

  const hasHeartRate = laps.some((lap) => lap.avgHeartRate != null);
  const hasCadence = laps.some((lap) => lap.avgCadence != null);

  return (
    <div
      data-testid="workout-laps-table"
      className="overflow-hidden rounded-[24px] border border-border/60 bg-muted/10"
    >
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-muted/35 text-left text-xs uppercase tracking-[0.08em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">랩</th>
              <th className="px-4 py-3 font-medium">거리</th>
              <th className="px-4 py-3 font-medium">시간</th>
              <th className="px-4 py-3 font-medium">페이스</th>
              {hasHeartRate && <th className="px-4 py-3 font-medium">평균 심박</th>}
              {hasCadence && <th className="px-4 py-3 font-medium">케이던스</th>}
            </tr>
          </thead>
          <tbody>
            {laps.map((lap) => {
              const isSelected = selectedLapNumber === lap.lapNumber;
              return (
                <tr
                  key={lap.lapNumber}
                  className={cn(
                    "border-t border-border/60 transition-colors",
                    onSelectLap && "cursor-pointer hover:bg-accent/20",
                    isSelected && "bg-primary/10",
                  )}
                  onClick={() => onSelectLap?.(lap.lapNumber)}
                >
                  <td className="px-4 py-3 font-medium tabular-nums text-foreground">
                    #{lap.lapNumber}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-foreground">
                    {formatDistance(lap.distance)} km
                  </td>
                  <td className="px-4 py-3 tabular-nums text-foreground">
                    {formatDuration(lap.duration)}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-foreground">
                    {formatPace(lap.pace)}/km
                  </td>
                  {hasHeartRate && (
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">
                      {lap.avgHeartRate != null ? `${Math.round(lap.avgHeartRate)} bpm` : "-"}
                    </td>
                  )}
                  {hasCadence && (
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">
                      {lap.avgCadence != null ? `${Math.round(lap.avgCadence)} spm` : "-"}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
