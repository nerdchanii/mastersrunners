import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { type CrewAttendanceStats as CrewAttendanceStatsData } from "@/hooks/useAttendanceStats";
import { cn } from "@/lib/utils";

import { EmptyPanel } from "./CrewAttendanceStats.shared";

interface Props {
  crewId: string;
  activities: CrewAttendanceStatsData["activities"];
}

type AttendanceActivity = CrewAttendanceStatsData["activities"][number];

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatMonthKey(date: Date | string) {
  const value = typeof date === "string" ? new Date(date) : date;
  return `${value.getFullYear()}-${`${value.getMonth() + 1}`.padStart(2, "0")}`;
}

function startOfMonth(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

function shiftMonthKey(monthKey: string, delta: number) {
  const date = startOfMonth(monthKey);
  date.setMonth(date.getMonth() + delta);
  return formatMonthKey(date);
}

function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return `${year}년 ${month}월`;
}

function formatActivityTime(value: string | null) {
  if (!value) return "시간 미정";
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function buildCalendarDays(monthKey: string) {
  const firstDay = startOfMonth(monthKey);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());

  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });

  const weeks = Array.from({ length: Math.ceil(days.length / 7) }, (_, index) =>
    days.slice(index * 7, index * 7 + 7),
  );

  while (
    weeks.length > 0 &&
    weeks[weeks.length - 1]?.every((date) => formatMonthKey(date) !== monthKey)
  ) {
    weeks.pop();
  }

  return weeks.flat();
}

function getActivityTone(activityType: string) {
  return activityType === "OFFICIAL" ? "bg-slate-100 text-slate-700" : "bg-teal-50 text-teal-700";
}

function getDayHeatStyle(activities: AttendanceActivity[], maxVisibleCheckedIn: number) {
  if (activities.length === 0) return undefined;

  const checkedInTotal = activities.reduce((sum, activity) => sum + activity.checkedIn, 0);
  const intensity = checkedInTotal / maxVisibleCheckedIn;
  const hasOfficial = activities.some((activity) => activity.activityType === "OFFICIAL");
  const hasPopUp = activities.some((activity) => activity.activityType === "POP_UP");

  if (hasOfficial && hasPopUp) {
    return {
      backgroundImage: `linear-gradient(135deg, rgba(15, 23, 42, ${0.08 + intensity * 0.26}), rgba(15, 118, 110, ${0.08 + intensity * 0.24}))`,
    };
  }

  if (hasOfficial) {
    return { backgroundColor: `rgba(15, 23, 42, ${0.08 + intensity * 0.3})` };
  }

  return { backgroundColor: `rgba(15, 118, 110, ${0.08 + intensity * 0.28})` };
}

function getMobileTintClass(hasOfficial: boolean, hasPopUp: boolean) {
  if (hasOfficial && hasPopUp) return "bg-slate-100";
  if (hasOfficial) return "bg-slate-100";
  return "bg-teal-50";
}

function ActivityDayCell({
  date,
  visibleMonth,
  activities,
  selectedDateKey,
  maxVisibleCheckedIn,
  onSelectDate,
}: {
  date: Date;
  visibleMonth: string;
  activities: AttendanceActivity[];
  selectedDateKey: string | null;
  maxVisibleCheckedIn: number;
  onSelectDate: (dateKey: string) => void;
}) {
  const dateKey = formatDateKey(date);
  const inCurrentMonth = formatMonthKey(date) === visibleMonth;
  const isSelectedDate = selectedDateKey === dateKey;
  const isSunday = date.getDay() === 0;
  const checkedInTotal = activities.reduce((sum, activity) => sum + activity.checkedIn, 0);
  const hasOfficial = activities.some((activity) => activity.activityType === "OFFICIAL");
  const hasPopUp = activities.some((activity) => activity.activityType === "POP_UP");

  return (
    <button
      type="button"
      onClick={() => {
        if (activities.length === 0) return;
        onSelectDate(dateKey);
      }}
      disabled={activities.length === 0}
      className={cn(
        "relative aspect-square min-h-0 rounded-[20px] border px-1.5 py-1.5 text-left transition-colors sm:rounded-2xl sm:px-2 sm:py-2 md:px-3 md:py-3",
        inCurrentMonth ? "border-border/50" : "border-transparent bg-transparent",
        activities.length > 0 && inCurrentMonth
          ? "hover:border-border hover:bg-muted/[0.05]"
          : "cursor-default",
        activities.length > 0 && inCurrentMonth && "md:bg-transparent",
        activities.length > 0 && inCurrentMonth && getMobileTintClass(hasOfficial, hasPopUp),
        isSelectedDate && "border-foreground/80 ring-1 ring-foreground/15",
      )}
    >
      {inCurrentMonth && activities.length > 0 ? (
        <div
          aria-hidden
          style={getDayHeatStyle(activities, maxVisibleCheckedIn)}
          className="absolute inset-0 hidden rounded-[20px] md:block md:rounded-2xl"
        />
      ) : null}

      <div className="relative z-[1] hidden h-full flex-col md:flex">
        <div className="flex items-start justify-between gap-1.5">
          <span
            className={cn(
              "text-sm font-medium sm:text-[15px]",
              !inCurrentMonth
                ? "text-muted-foreground/28"
                : isSunday
                  ? "text-rose-500"
                  : "text-foreground",
            )}
          >
            {date.getDate()}
          </span>
          {activities.length > 1 && inCurrentMonth ? (
            <span className="hidden rounded-full bg-background/92 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-flex">
              {activities.length}개
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex items-end justify-between gap-1.5">
          <div className="flex items-center gap-1">
            {inCurrentMonth && hasOfficial ? (
              <span className="size-2 rounded-full bg-slate-900 sm:size-2.5" />
            ) : null}
            {inCurrentMonth && hasPopUp ? (
              <span className="size-2 rounded-full bg-teal-700 sm:size-2.5" />
            ) : null}
          </div>

          {inCurrentMonth && activities.length > 0 ? (
            <span className="rounded-full bg-background/94 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-foreground shadow-sm sm:px-2 sm:text-[11px]">
              {checkedInTotal}
              <span className="hidden md:inline">명</span>
            </span>
          ) : null}
        </div>
      </div>

      <div className="relative z-[1] flex h-full items-center justify-center md:hidden">
        <span
          className={cn(
            "text-[15px] font-medium leading-none",
            !inCurrentMonth
              ? "text-muted-foreground/28"
              : isSunday
                ? "text-rose-500"
                : "text-foreground",
          )}
        >
          {date.getDate()}
        </span>
      </div>
    </button>
  );
}

function ActivitySummaryPanel({
  crewId,
  selectedDateKey,
  selectedActivityId,
  activities,
  onSelectActivity,
}: {
  crewId: string;
  selectedDateKey: string | null;
  selectedActivityId: string | null;
  activities: AttendanceActivity[];
  onSelectActivity: (activityId: string) => void;
}) {
  const selectedActivity =
    activities.find((activity) => activity.id === selectedActivityId) ?? activities[0] ?? null;

  if (!selectedDateKey) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 px-4 py-8 text-center xl:sticky xl:top-6">
        <p className="text-sm font-semibold text-foreground">활동을 선택해 주세요.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          달력에서 일정이 있는 날짜를 누르면 상세가 보입니다.
        </p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 px-4 py-8 text-center xl:sticky xl:top-6">
        <p className="text-sm font-semibold text-foreground">해당 날짜에 완료된 활동이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border/60 bg-background px-4 py-4 xl:sticky xl:top-6">
      {activities.length > 1 ? (
        <div className="space-y-2">
          {activities.map((activity) => {
            const isSelected = activity.id === selectedActivity?.id;
            return (
              <button
                key={activity.id}
                type="button"
                onClick={() => onSelectActivity(activity.id)}
                className={cn(
                  "w-full rounded-2xl border px-3 py-3 text-left transition-colors",
                  isSelected
                    ? "border-border bg-muted/[0.08]"
                    : "border-border/60 bg-background hover:bg-muted/[0.04]",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm leading-none">{activity.activityIcon ?? "🏃"}</span>
                      <p className="truncate text-sm font-medium text-foreground">
                        {activity.title}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatActivityTime(activity.activityDate)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                      getActivityTone(activity.activityType),
                    )}
                  >
                    {activity.activityType === "OFFICIAL" ? "정기런" : "번개"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      ) : null}

      {selectedActivity ? (
        <div
          className={cn("space-y-3", activities.length > 1 ? "border-t border-border/60 pt-4" : "")}
        >
          <div className="space-y-1.5">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                getActivityTone(selectedActivity.activityType),
              )}
            >
              {selectedActivity.activityType === "OFFICIAL" ? "정기런" : "번개"}
            </span>
            <Link
              to={`/crews/${crewId}/activities/${selectedActivity.id}`}
              className="inline-flex min-w-0 items-center gap-2 text-foreground transition-colors hover:text-primary"
            >
              <span className="text-base leading-none">
                {selectedActivity.activityIcon ?? "🏃"}
              </span>
              <h3 className="truncate text-base font-semibold tracking-tight">
                {selectedActivity.title}
              </h3>
            </Link>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>{formatActivityTime(selectedActivity.activityDate)}</p>
              {selectedActivity.location ? (
                <p className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {selectedActivity.location}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-3 border-t border-border/60 pt-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-foreground">
              <span>출석률 {selectedActivity.rate}%</span>
              <span>참석 {selectedActivity.checkedIn}</span>
              <span>노쇼 {selectedActivity.noShow}</span>
            </div>

            <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              <div className="rounded-xl bg-muted/[0.05] px-3 py-2">
                🙋 참석 {selectedActivity.checkedIn}명
              </div>
              <div className="rounded-xl bg-muted/[0.05] px-3 py-2">
                😶 노쇼 {selectedActivity.noShow}명
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function CrewAttendanceActivitySection({ crewId, activities }: Props) {
  const latestActivity = useMemo(
    () =>
      [...activities].sort(
        (a, b) => new Date(b.activityDate).getTime() - new Date(a.activityDate).getTime(),
      )[0] ?? null,
    [activities],
  );
  const initialVisibleMonth = latestActivity
    ? formatMonthKey(latestActivity.activityDate)
    : formatMonthKey(new Date());
  const [visibleMonth, setVisibleMonth] = useState(initialVisibleMonth);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(
    latestActivity ? latestActivity.activityDate.slice(0, 10) : null,
  );
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    latestActivity?.id ?? null,
  );

  const activitiesByDate = useMemo(() => {
    const map = new Map<string, AttendanceActivity[]>();
    [...activities]
      .sort((a, b) => new Date(b.activityDate).getTime() - new Date(a.activityDate).getTime())
      .forEach((activity) => {
        const dateKey = activity.activityDate.slice(0, 10);
        map.set(dateKey, [...(map.get(dateKey) ?? []), activity]);
      });
    return map;
  }, [activities]);

  const visibleMonthDays = useMemo(() => buildCalendarDays(visibleMonth), [visibleMonth]);
  const visibleMonthPrefix = `${visibleMonth}-`;
  const maxVisibleCheckedIn = useMemo(() => {
    const totals = [...activitiesByDate.entries()]
      .filter(([dateKey]) => dateKey.startsWith(visibleMonthPrefix))
      .map(([, dayActivities]) =>
        dayActivities.reduce((sum, activity) => sum + activity.checkedIn, 0),
      );
    return Math.max(1, ...totals);
  }, [activitiesByDate, visibleMonthPrefix]);

  const selectedDateActivities = useMemo(
    () => (selectedDateKey ? (activitiesByDate.get(selectedDateKey) ?? []) : []),
    [activitiesByDate, selectedDateKey],
  );

  useEffect(() => {
    if (latestActivity && !selectedDateKey) {
      setSelectedDateKey(latestActivity.activityDate.slice(0, 10));
      setSelectedActivityId(latestActivity.id);
      setVisibleMonth(formatMonthKey(latestActivity.activityDate));
    }
  }, [latestActivity, selectedDateKey]);

  useEffect(() => {
    if (!selectedDateKey) return;
    if (!activitiesByDate.has(selectedDateKey)) {
      const fallback = latestActivity?.activityDate.slice(0, 10) ?? null;
      setSelectedDateKey(fallback);
      setSelectedActivityId(latestActivity?.id ?? null);
      if (latestActivity) {
        setVisibleMonth(formatMonthKey(latestActivity.activityDate));
      }
    }
  }, [activitiesByDate, latestActivity, selectedDateKey]);

  useEffect(() => {
    if (selectedDateActivities.length === 0) {
      setSelectedActivityId(null);
      return;
    }
    if (!selectedDateActivities.some((activity) => activity.id === selectedActivityId)) {
      setSelectedActivityId(selectedDateActivities[0]?.id ?? null);
    }
  }, [selectedActivityId, selectedDateActivities]);

  useEffect(() => {
    if (!selectedDateKey) return;
    const selectedMonth = formatMonthKey(new Date(`${selectedDateKey}T00:00:00`));
    if (selectedMonth !== visibleMonth) {
      setVisibleMonth(selectedMonth);
    }
  }, [selectedDateKey, visibleMonth]);

  if (activities.length === 0) {
    return (
      <EmptyPanel
        title="완료된 활동이 없습니다."
        body="활동이 생기면 달력에서 날짜별 참여 흐름을 확인할 수 있습니다."
      />
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background px-1 py-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 rounded-full"
            aria-label="이전 월"
            onClick={() => setVisibleMonth((prev) => shiftMonthKey(prev, -1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-[96px] text-center text-sm font-medium text-foreground">
            {formatMonthLabel(visibleMonth)}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 rounded-full"
            aria-label="다음 월"
            onClick={() => setVisibleMonth((prev) => shiftMonthKey(prev, 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
        <div className="min-w-0 rounded-2xl border border-border/60 bg-background p-3 md:p-4">
          <div className="mb-2 grid grid-cols-7 gap-1.5 text-center text-[11px] font-medium text-muted-foreground sm:mb-3 sm:gap-2 md:text-xs">
            {WEEKDAY_LABELS.map((label, index) => (
              <span key={label} className={cn("py-2", index === 0 ? "text-rose-500" : "")}>
                {label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {visibleMonthDays.map((date) => {
              const dateKey = formatDateKey(date);
              return (
                <ActivityDayCell
                  key={dateKey}
                  date={date}
                  visibleMonth={visibleMonth}
                  activities={activitiesByDate.get(dateKey) ?? []}
                  selectedDateKey={selectedDateKey}
                  maxVisibleCheckedIn={maxVisibleCheckedIn}
                  onSelectDate={(nextDateKey) => {
                    setSelectedDateKey(nextDateKey);
                    setSelectedActivityId((activitiesByDate.get(nextDateKey) ?? [])[0]?.id ?? null);
                  }}
                />
              );
            })}
          </div>
        </div>

        <ActivitySummaryPanel
          crewId={crewId}
          selectedDateKey={selectedDateKey}
          selectedActivityId={selectedActivityId}
          activities={selectedDateActivities}
          onSelectActivity={setSelectedActivityId}
        />
      </div>
    </section>
  );
}
