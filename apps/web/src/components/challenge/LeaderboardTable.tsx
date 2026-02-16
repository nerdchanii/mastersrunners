import { useAuth } from "@/lib/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/common/UserAvatar";
import ProgressBar from "./ProgressBar";

interface LeaderboardEntry {
  rank: number;
  progress: number;
  user: {
    id: string;
    name: string;
    profileImage: string | null;
  };
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  goalValue: number;
  goalType: string;
  isLoading?: boolean;
}

function goalTypeUnit(type: string): string {
  switch (type) {
    case "DISTANCE": return "KM";
    case "FREQUENCY": return "COUNT";
    case "STREAK": return "DAYS";
    case "PACE": return "SEC_PER_KM";
    default: return type;
  }
}

export default function LeaderboardTable({ entries, goalValue, goalType, isLoading }: LeaderboardTableProps) {
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>아직 참가자가 없습니다.</p>
      </div>
    );
  }

  const unit = goalTypeUnit(goalType);

  return (
    <div className="space-y-2">
      {entries.map((entry) => {
        const isTop3 = entry.rank <= 3;
        const isCurrentUser = user?.id === entry.user.id;
        const medalColors: Record<number, string> = {
          1: "text-yellow-500",
          2: "text-gray-400",
          3: "text-orange-600",
        };

        return (
          <div
            key={entry.user.id}
            className={cn(
              "flex items-center gap-4 p-4 rounded-lg border transition-colors",
              isTop3 && "bg-primary/5 border-primary/20",
              isCurrentUser && "ring-2 ring-primary/30 bg-primary/5"
            )}
          >
            <div className="w-8 text-center flex-shrink-0">
              {isTop3 ? (
                <span className={cn("text-lg font-bold", medalColors[entry.rank])}>
                  {entry.rank}
                </span>
              ) : (
                <span className="text-sm font-medium text-muted-foreground">{entry.rank}</span>
              )}
            </div>

            <div className="flex items-center gap-2.5 flex-shrink-0 min-w-[120px]">
              <UserAvatar
                user={entry.user}
                size="sm"
                linkToProfile={true}
              />
              <span className={cn(
                "text-sm font-medium truncate",
                isCurrentUser && "font-semibold text-primary"
              )}>
                {entry.user.name}
                {isCurrentUser && " (나)"}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <ProgressBar
                current={entry.progress}
                target={goalValue}
                unit={unit}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
