import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { UserAvatar } from "@/components/common/UserAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type CrewAttendanceMemberRow,
  useMemberAttendanceHistory,
} from "@/hooks/useAttendanceStats";
import { cn } from "@/lib/utils";

import {
  EmptyPanel,
  formatDateTime,
  formatShortDate,
  type MemberSortOption,
  memberSortOptions,
  SortHeaderButton,
} from "./CrewAttendanceStats.shared";

interface Props {
  crewId: string;
  members: CrewAttendanceMemberRow[];
  sort: MemberSortOption;
  order: "asc" | "desc";
  onSortChange: (nextSort: MemberSortOption) => void;
}

function MemberHistorySummary({
  crewId,
  history,
}: {
  crewId: string;
  history: NonNullable<ReturnType<typeof useMemberAttendanceHistory>["data"]>["history"];
}) {
  const getStatusLabel = (status: string) => {
    if (status === "CHECKED_IN") return "참석";
    if (status === "NO_SHOW") return "노쇼";
    return "RSVP";
  };

  const getStatusClassName = (status: string) => {
    if (status === "CHECKED_IN") return "bg-slate-900/6 text-foreground";
    if (status === "NO_SHOW") return "bg-rose-50 text-rose-600";
    return "bg-slate-100 text-muted-foreground";
  };

  const getMetaText = (status: string, checkedAt: string | null, rsvpAt: string | null) => {
    if (status === "CHECKED_IN" && checkedAt) return formatDateTime(checkedAt);
    if (status === "NO_SHOW" && rsvpAt) return `응답 ${formatDateTime(rsvpAt)}`;
    if (rsvpAt) return formatDateTime(rsvpAt);
    if (checkedAt) return formatDateTime(checkedAt);
    return "시간 기록 없음";
  };

  if (history.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 px-4 py-4 text-sm text-muted-foreground">
        최근 출석 이력이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {history.slice(0, 2).map((item) => (
        <Link
          key={item.id}
          to={`/crews/${crewId}/activities/${item.activityId}`}
          className="grid gap-1.5 rounded-xl border border-border/60 bg-background px-3 py-2.5 transition-colors hover:bg-muted/[0.04] md:grid-cols-[minmax(0,1fr)_220px] md:gap-2 md:px-4 md:py-3"
        >
          <div className="min-w-0 space-y-1">
            <div className="flex items-start gap-2">
              <span className="text-sm leading-none">{item.activityIcon ?? "🏃"}</span>
              <p className="truncate text-[15px] font-medium text-foreground">{item.title}</p>
            </div>
            <p className="text-sm text-muted-foreground">{formatDateTime(item.activityDate)}</p>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm md:block md:space-y-1 md:text-right">
            <span
              className={cn(
                "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
                getStatusClassName(item.status),
              )}
            >
              {getStatusLabel(item.status)}
            </span>
            <p className="text-xs text-muted-foreground md:text-sm">
              {getMetaText(item.status, item.checkedAt, item.rsvpAt)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function CrewAttendanceMemberSection({ crewId, members, sort, order, onSortChange }: Props) {
  const [selectedMember, setSelectedMember] = useState<CrewAttendanceMemberRow | null>(null);

  const { data: memberHistory, isLoading: isMemberHistoryLoading } = useMemberAttendanceHistory(
    crewId,
    selectedMember?.userId ?? null,
  );

  useEffect(() => {
    if (!selectedMember) return;
    const exists = members.some((member) => member.userId === selectedMember.userId);
    if (!exists) {
      setSelectedMember(null);
    }
  }, [members, selectedMember]);

  if (members.length === 0) {
    return (
      <EmptyPanel
        title="조건에 맞는 멤버가 없습니다."
        body="선택한 기간의 출석 대상 멤버가 생기면 목록이 채워집니다."
      />
    );
  }

  return (
    <section className="space-y-3">
      <div className="md:hidden">
        <div className="space-y-1 border-t border-border/60">
          <div className="grid grid-cols-[minmax(0,1fr)_76px_64px] gap-0 px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <span className="text-left">멤버</span>
            <SortHeaderButton
              active={sort === "lastActivity"}
              direction={order}
              align="right"
              onClick={() => onSortChange("lastActivity")}
            >
              최근
            </SortHeaderButton>
            <SortHeaderButton
              active={sort === "rate"}
              direction={order}
              align="right"
              onClick={() => onSortChange("rate")}
            >
              출석률
            </SortHeaderButton>
          </div>

          <div className="divide-y divide-border/40 border-t border-border/50">
            {members.map((member) => {
              const isSelected = selectedMember?.userId === member.userId;
              return (
                <div key={member.userId}>
                  <button
                    type="button"
                    aria-expanded={isSelected}
                    className={cn(
                      "grid w-full grid-cols-[minmax(0,1fr)_76px_64px] items-center gap-0 px-3 py-3 text-left transition-colors hover:bg-muted/10",
                      isSelected && "bg-muted/15",
                    )}
                    onClick={() =>
                      setSelectedMember((prev) => (prev?.userId === member.userId ? null : member))
                    }
                  >
                    <span className="flex min-w-0 items-center gap-2 pr-3">
                      <UserAvatar user={member.user} size="sm" linkToProfile />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-medium text-foreground">
                          {member.user.name}
                        </span>
                      </span>
                    </span>
                    <span className="text-right text-sm text-muted-foreground">
                      {formatShortDate(member.lastActivityAt)}
                    </span>
                    <span className="text-right text-sm font-medium text-foreground">
                      {member.rate}%
                    </span>
                  </button>

                  <div
                    className={cn(
                      "grid overflow-hidden transition-[grid-template-rows,opacity] duration-240 ease-out",
                      isSelected ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                    )}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div
                        className={cn(
                          "px-3 transition-[padding,transform,opacity] duration-200 ease-out md:px-4",
                          isSelected
                            ? "translate-y-0 pb-4 opacity-100"
                            : "-translate-y-1 pb-0 opacity-0",
                        )}
                      >
                        <div className="space-y-3 border-t border-border/60 pt-3">
                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="space-y-1">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                참석
                              </p>
                              <p className="text-base font-semibold tracking-tight text-foreground">
                                {member.checkedIn}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                노쇼
                              </p>
                              <p className="text-base font-semibold tracking-tight text-foreground">
                                {member.noShow}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                활동 수
                              </p>
                              <p className="text-sm font-medium text-foreground">
                                {member.totalEligible}개
                              </p>
                            </div>
                          </div>
                          {isMemberHistoryLoading && selectedMember?.userId === member.userId ? (
                            <Skeleton className="h-28 w-full rounded-2xl" />
                          ) : memberHistory && selectedMember?.userId === member.userId ? (
                            <MemberHistorySummary crewId={crewId} history={memberHistory.history} />
                          ) : (
                            <EmptyPanel
                              title="이력을 불러오지 못했습니다."
                              body="잠시 후 다시 시도해 주세요."
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        <div role="table" aria-label="멤버별 출석 현황" className="border-t border-border/60">
          <div
            role="row"
            className="grid grid-cols-[minmax(0,1.35fr)_88px_112px_88px_88px_88px] items-center gap-0 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
          >
            <span role="columnheader" className="text-left">
              멤버
            </span>
            {memberSortOptions.map((option) => (
              <span key={option.value} role="columnheader">
                <SortHeaderButton
                  active={sort === option.value}
                  direction={order}
                  align={option.align}
                  onClick={() => onSortChange(option.value)}
                >
                  {option.label}
                </SortHeaderButton>
              </span>
            ))}
            <span role="columnheader" className="text-right">
              활동 수
            </span>
          </div>

          <div className="divide-y divide-border/40 border-t border-border/50">
            {members.map((member) => {
              const isSelected = selectedMember?.userId === member.userId;
              return (
                <div key={member.userId}>
                  <button
                    type="button"
                    role="row"
                    aria-expanded={isSelected}
                    className={cn(
                      "grid w-full grid-cols-[minmax(0,1.35fr)_88px_112px_88px_88px_88px] items-center gap-0 px-4 py-3 text-left transition-colors hover:bg-muted/10",
                      isSelected && "bg-muted/15",
                    )}
                    onClick={() =>
                      setSelectedMember((prev) => (prev?.userId === member.userId ? null : member))
                    }
                  >
                    <span role="cell" className="flex min-w-0 items-center gap-2 pr-3">
                      <UserAvatar user={member.user} size="sm" linkToProfile />
                      <span className="min-w-0">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-[15px] font-medium text-foreground">
                            {member.user.name}
                          </span>
                          <ChevronRight
                            className={cn(
                              "size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 ease-out",
                              isSelected && "rotate-90",
                            )}
                          />
                        </span>
                      </span>
                    </span>
                    <span role="cell" className="text-right text-sm font-medium text-foreground">
                      {member.checkedIn}
                    </span>
                    <span role="cell" className="text-right text-sm text-muted-foreground">
                      {formatShortDate(member.lastActivityAt)}
                    </span>
                    <span role="cell" className="text-right text-sm text-muted-foreground">
                      {member.rate}%
                    </span>
                    <span role="cell" className="text-right text-sm text-muted-foreground">
                      {member.noShow}
                    </span>
                    <span role="cell" className="text-right text-sm text-muted-foreground">
                      {member.totalEligible}개
                    </span>
                  </button>

                  <div
                    className={cn(
                      "grid overflow-hidden transition-[grid-template-rows,opacity] duration-240 ease-out",
                      isSelected ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                    )}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div
                        className={cn(
                          "px-4 transition-[padding,transform,opacity] duration-200 ease-out",
                          isSelected
                            ? "translate-y-0 pb-4 opacity-100"
                            : "-translate-y-1 pb-0 opacity-0",
                        )}
                      >
                        <div className="border-t border-border/60 pt-3">
                          {isMemberHistoryLoading && selectedMember?.userId === member.userId ? (
                            <Skeleton className="h-28 w-full rounded-2xl" />
                          ) : memberHistory && selectedMember?.userId === member.userId ? (
                            <MemberHistorySummary crewId={crewId} history={memberHistory.history} />
                          ) : (
                            <EmptyPanel
                              title="이력을 불러오지 못했습니다."
                              body="잠시 후 다시 시도해 주세요."
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
