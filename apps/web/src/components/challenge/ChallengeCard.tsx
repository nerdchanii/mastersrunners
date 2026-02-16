
import { Link } from "react-router-dom";
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
    case "COUNT": return "횟수";
    case "DURATION": return "시간";
    case "PACE": return "페이스";
    default: return type;
  }
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
    if (isActive) return { label: "진행 중", className: "bg-green-100 text-green-700" };
    if (isUpcoming) return { label: "예정", className: "bg-blue-100 text-blue-700" };
    return { label: "종료", className: "bg-gray-100 text-gray-700" };
  };

  const badge = statusBadge();

  return (
    <Link to={`/challenges/${challenge.id}`}>
      <div className="bg-white shadow rounded-lg p-5 hover:shadow-md transition-shadow border border-gray-200 cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {challenge.name}
          </h3>
          <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
            {!challenge.isPublic && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                비공개
              </span>
            )}
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
              {badge.label}
            </span>
          </div>
        </div>

        {challenge.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {challenge.description}
          </p>
        )}

        <div className="space-y-2 text-sm text-gray-500 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDate(challenge.startDate)} ~ {formatDate(challenge.endDate)}</span>
            </div>
            <span className="text-xs text-indigo-600 font-medium">
              {goalTypeLabel(challenge.goalType)} {challenge.goalValue}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{participantCount}명 참가</span>
          </div>
        </div>

        {challenge.myProgress != null && (
          <ProgressBar
            current={challenge.myProgress}
            target={challenge.goalValue}
            unit={goalTypeUnit(challenge.goalType)}
          />
        )}
      </div>
    </Link>
  );
}
