import { ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@/lib/utils";

export const rangeOptions = [
  { label: "최근 30일", value: "30d" },
  { label: "월별", value: "monthly" },
  { label: "최근 10주", value: "10w" },
  { label: "최근 12주", value: "12w" },
] as const;

export const memberSortOptions = [
  { label: "참석", value: "checkedIn", align: "right" as const },
  { label: "최근 활동", value: "lastActivity", align: "right" as const },
  { label: "출석률", value: "rate", align: "right" as const },
  { label: "노쇼", value: "noShow", align: "right" as const },
] as const;

export type MemberSortOption = (typeof memberSortOptions)[number]["value"];

export function formatShortDate(value: string | null) {
  if (!value) return "기록 없음";
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function formatDateTime(value: string | null) {
  if (!value) return "기록 없음";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function EmptyPanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border/70 px-4 py-8 text-center">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

export function SortHeaderButton({
  active,
  direction,
  align,
  children,
  onClick,
}: {
  active: boolean;
  direction: "asc" | "desc";
  align: "left" | "right";
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-8 w-full items-center gap-1 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors md:text-xs",
        align === "right" ? "justify-end text-right" : "justify-start text-left",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <span>{children}</span>
      <span className="inline-flex size-4 items-center justify-center">
        {direction === "asc" ? (
          <ChevronUp className={cn("size-3.5", active ? "opacity-100" : "opacity-35")} />
        ) : (
          <ChevronDown className={cn("size-3.5", active ? "opacity-100" : "opacity-35")} />
        )}
      </span>
    </button>
  );
}
