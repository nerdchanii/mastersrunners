"use client";

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
    case "COUNT": return "COUNT";
    case "DURATION": return "DAYS";
    case "PACE": return "SEC_PER_KM";
    default: return type;
  }
}

export default function LeaderboardTable({ entries, goalValue, goalType, isLoading }: LeaderboardTableProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 bg-gray-200 rounded" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>아직 참가자가 없습니다.</p>
      </div>
    );
  }

  const unit = goalTypeUnit(goalType);

  return (
    <div className="space-y-3">
      {entries.map((entry) => {
        const isTop3 = entry.rank <= 3;
        const medalColors: Record<number, string> = {
          1: "text-yellow-500",
          2: "text-gray-400",
          3: "text-amber-700",
        };

        return (
          <div
            key={entry.user.id}
            className={`flex items-center gap-4 p-4 rounded-lg border ${
              isTop3 ? "border-indigo-200 bg-indigo-50/50" : "border-gray-200 bg-white"
            }`}
          >
            <div className="w-8 text-center flex-shrink-0">
              {isTop3 ? (
                <span className={`text-lg font-bold ${medalColors[entry.rank] || ""}`}>
                  {entry.rank}
                </span>
              ) : (
                <span className="text-sm font-medium text-gray-500">{entry.rank}</span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {entry.user.profileImage ? (
                <img
                  src={entry.user.profileImage}
                  alt={entry.user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-xs text-gray-600">{entry.user.name.charAt(0)}</span>
                </div>
              )}
              <span className="text-sm font-medium text-gray-900 w-20 truncate">
                {entry.user.name}
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
