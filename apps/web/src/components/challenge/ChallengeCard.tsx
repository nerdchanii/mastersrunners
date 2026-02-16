import { Link } from "react-router-dom";
import { Calendar, Users, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProgressBar from "./ProgressBar";

interface ChallengeCardProps {
  challenge: {
    id: string;
    name: string;
    description?: string | null;
    goalType: string;
    goalValue: number;
    startDate: string;
    endDate: string;
    isPublic: boolean;
    _count?: { participants: number };
    myProgress?: number | null;
  };
}

function goalTypeLabel(type: string): string {
  switch (type) {
    case "DISTANCE": return "거리";
    case "FREQUENCY": return "횟수";
    case "STREAK": return "연속";
    case "PACE": return "페이스";
    default: return type;
  }
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

export default function ChallengeCard({ challenge }: ChallengeCardProps) {
  const now = new Date();
  const startDate = new Date(challenge.startDate);
  const endDate = new Date(challenge.endDate);
  const isActive = now >= startDate && now <= endDate;
  const isUpcoming = now < startDate;
  const participantCount = challenge._count?.participants ?? 0;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    });
  };

  const statusBadge = () => {
    if (isActive) return { label: "진행중", variant: "default" as const };
    if (isUpcoming) return { label: "예정", variant: "secondary" as const };
    return { label: "완료", variant: "outline" as const };
  };

  const badge = statusBadge();

  return (
    <Link to={`/challenges/${challenge.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-semibold line-clamp-1 flex-1">
              {challenge.name}
            </h3>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {!challenge.isPublic && (
                <Badge variant="outline" className="bg-yellow-50">
                  <Lock className="size-3" />
                </Badge>
              )}
              <Badge variant={badge.variant}>{badge.label}</Badge>
            </div>
          </div>

          {challenge.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {challenge.description}
            </p>
          )}

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="size-4" />
                <span>{formatDate(challenge.startDate)} ~ {formatDate(challenge.endDate)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="size-4" />
                <span>{participantCount}명</span>
              </div>
              <span className="text-xs font-medium text-primary">
                {goalTypeLabel(challenge.goalType)} {challenge.goalValue}
              </span>
            </div>
          </div>

          {challenge.myProgress != null && (
            <div className="pt-2 border-t">
              <ProgressBar
                current={challenge.myProgress}
                target={challenge.goalValue}
                unit={goalTypeUnit(challenge.goalType)}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
