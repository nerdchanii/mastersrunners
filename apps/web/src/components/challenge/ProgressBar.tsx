import { cn } from "@/lib/utils";
import { formatPace } from "@/lib/format";

interface ProgressBarProps {
  current: number;
  target: number;
  unit: string;
  className?: string;
}

export default function ProgressBar({ current, target, unit, className }: ProgressBarProps) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const isCompleted = percentage >= 100;

  const formatValue = (value: number): string => {
    if (unit === "KM") return value.toFixed(1);
    if (unit === "SEC_PER_KM") return formatPace(value);
    return String(Math.floor(value));
  };

  const unitLabel = (u: string): string => {
    switch (u) {
      case "KM": return "km";
      case "COUNT": return "회";
      case "DAYS": return "일";
      case "SEC_PER_KM": return "";
      default: return u;
    }
  };

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-medium text-foreground">
          {formatValue(current)} / {formatValue(target)} {unitLabel(unit)}
        </span>
        <span className={cn(
          "text-sm font-semibold",
          isCompleted ? "text-green-600" : "text-primary"
        )}>
          {percentage.toFixed(0)}%
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            isCompleted ? "bg-green-500" : "bg-primary"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
