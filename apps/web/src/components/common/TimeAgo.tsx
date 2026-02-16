import { cn } from "@/lib/utils";

interface TimeAgoProps {
  date: string | Date;
  className?: string;
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);

  if (diffSec < 60) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;
  if (diffWeek < 4) return `${diffWeek}주 전`;

  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function TimeAgo({ date, className }: TimeAgoProps) {
  const d = typeof date === "string" ? new Date(date) : date;
  const isoString = d.toISOString();

  return (
    <time
      dateTime={isoString}
      title={d.toLocaleString("ko-KR")}
      className={cn("text-xs text-muted-foreground", className)}
    >
      {getTimeAgo(d)}
    </time>
  );
}
