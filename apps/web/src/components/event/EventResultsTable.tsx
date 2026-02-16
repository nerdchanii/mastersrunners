import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Trophy, Medal, Award } from "lucide-react";

interface EventResult {
  resultRank: number | null;
  bibNumber: string | null;
  resultTime: number | null;
  status: string;
  user: {
    id: string;
    name: string;
    profileImage: string | null;
  };
}

interface EventResultsTableProps {
  results: EventResult[];
  isLoading?: boolean;
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function statusLabel(status: string): string {
  switch (status) {
    case "COMPLETED":
      return "완주";
    case "DNF":
      return "DNF";
    case "DNS":
      return "DNS";
    default:
      return status;
  }
}

function getRankIcon(rank: number | null) {
  if (rank === 1) return <Trophy className="h-4 w-4 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-4 w-4 text-gray-400" />;
  if (rank === 3) return <Award className="h-4 w-4 text-amber-600" />;
  return null;
}

export default function EventResultsTable({ results, isLoading }: EventResultsTableProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded" />
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Trophy className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p>아직 등록된 결과가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              순위
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              배번
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              이름
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              기록
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              상태
            </th>
          </tr>
        </thead>
        <tbody className="bg-card divide-y divide-border">
          {results.map((result) => (
            <tr key={result.user.id} className="hover:bg-muted/50 transition-colors">
              <td className="px-4 py-4 whitespace-nowrap text-sm">
                {result.resultRank != null ? (
                  <div className="flex items-center gap-2">
                    {getRankIcon(result.resultRank)}
                    <span
                      className={`font-semibold ${result.resultRank <= 3 ? "text-primary" : "text-foreground"}`}
                    >
                      {result.resultRank}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                {result.bibNumber || "-"}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    user={{
                      id: result.user.id,
                      name: result.user.name,
                      profileImage: result.user.profileImage,
                    }}
                    size="sm"
                    linkToProfile={false}
                  />
                  <span className="text-sm font-medium text-foreground">{result.user.name}</span>
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-mono font-semibold text-foreground">
                {result.resultTime != null ? formatTime(result.resultTime) : "-"}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <Badge
                  variant={
                    result.status === "COMPLETED"
                      ? "default"
                      : result.status === "DNF"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {statusLabel(result.status)}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}