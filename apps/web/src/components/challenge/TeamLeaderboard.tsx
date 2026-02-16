import { useState, useEffect } from "react";
import { Trophy, Users } from "lucide-react";
import { api } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface TeamLeaderboardEntry {
  rank: number;
  teamId: string;
  teamName: string;
  memberCount: number;
  aggregateProgress: number;
}

interface TeamLeaderboardProps {
  challengeId: string;
}

export default function TeamLeaderboard({ challengeId }: TeamLeaderboardProps) {
  const [entries, setEntries] = useState<TeamLeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [challengeId]);

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      const data = await api.fetch<TeamLeaderboardEntry[]>(
        `/challenges/${challengeId}/teams/leaderboard?limit=50`
      );
      setEntries(data);
    } catch (err) {
      console.error("Failed to fetch team leaderboard:", err);
    } finally {
      setIsLoading(false);
    }
  };

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
        <Trophy className="mx-auto size-12 mb-2 opacity-50" />
        <p>아직 팀이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => {
        const isTop3 = entry.rank <= 3;
        const medalColors: Record<number, string> = {
          1: "text-yellow-500",
          2: "text-gray-400",
          3: "text-orange-600",
        };

        return (
          <div
            key={entry.teamId}
            className={cn(
              "flex items-center gap-4 p-4 rounded-lg border transition-colors",
              isTop3 && "bg-primary/5 border-primary/20"
            )}
          >
            <div className="w-8 text-center flex-shrink-0">
              {isTop3 ? (
                <span className={cn("text-lg font-bold", medalColors[entry.rank])}>
                  {entry.rank}
                </span>
              ) : (
                <span className="text-sm font-medium text-muted-foreground">
                  {entry.rank}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="flex items-center justify-center size-10 rounded-full bg-primary/10">
                <Users className="size-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-sm truncate">{entry.teamName}</h4>
                <p className="text-xs text-muted-foreground">
                  {entry.memberCount}명
                </p>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <div className="text-lg font-bold text-primary">
                {entry.aggregateProgress.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">합산</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
