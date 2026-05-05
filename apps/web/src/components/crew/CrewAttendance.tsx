import { Check, ChevronUp, Clock3, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { type ReactNode, useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/common/EmptyState";
import { TimeAgo } from "@/components/common/TimeAgo";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface AttendanceRosterItem {
  id: string;
  userId: string;
  status: string;
  rsvpAt: string;
  checkedAt: string | null;
  user: {
    id: string;
    name: string;
    profileImage: string | null;
  };
}

interface LegacyAttendanceItem {
  id: string;
  userId: string;
  checkedInAt: string;
  user: {
    id: string;
    name: string;
    profileImage: string | null;
  };
}

interface CrewAttendanceProps {
  crewId: string;
  activityId: string;
  canManageAttendance?: boolean;
  isAdmin?: boolean;
  isMember?: boolean;
  currentUserId?: string;
  activityTitle?: string;
  crewName?: string;
  activityDateLabel?: string;
  qrCode?: string;
  roster?: AttendanceRosterItem[];
  initialAttendees?: LegacyAttendanceItem[];
}

function formatLabel(value: string | undefined, fallback: string) {
  if (!value) {
    return fallback;
  }

  if (/[가-힣]/.test(value) || /\s/.test(value)) {
    return value;
  }

  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function buildLegacyRoster(items: LegacyAttendanceItem[] | undefined): AttendanceRosterItem[] {
  if (!items) {
    return [];
  }

  return items.map((item) => ({
    id: item.id,
    userId: item.userId,
    status: "CHECKED_IN",
    rsvpAt: item.checkedInAt,
    checkedAt: item.checkedInAt,
    user: item.user,
  }));
}

function RosterRows({
  items,
  emptyTitle,
  pending,
}: {
  items: AttendanceRosterItem[];
  emptyTitle: string;
  pending?: boolean;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-muted/24 px-4 py-6 text-sm text-muted-foreground">
        <EmptyState title={emptyTitle} />
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/50">
      {items.map((attendance) => (
        <div
          key={attendance.id}
          className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
        >
          <div className="min-w-0 flex items-center gap-3">
            <UserAvatar user={attendance.user} size="default" linkToProfile />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{attendance.user.name}</p>
              <TimeAgo
                date={pending ? attendance.rsvpAt : (attendance.checkedAt ?? attendance.rsvpAt)}
                className="truncate text-xs text-muted-foreground"
              />
            </div>
          </div>
          {pending ? (
            <span className="shrink-0 text-xs font-medium text-muted-foreground">도착 전</span>
          ) : (
            <Check className="size-4 shrink-0 text-emerald-600" />
          )}
        </div>
      ))}
    </div>
  );
}

function AttendanceSection({
  title,
  icon,
  items,
  emptyTitle,
  pending,
}: {
  title: string;
  icon: ReactNode;
  items: AttendanceRosterItem[];
  emptyTitle: string;
  pending?: boolean;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        {icon}
        {title}
      </div>
      <RosterRows items={items} emptyTitle={emptyTitle} pending={pending} />
    </section>
  );
}

export default function CrewAttendance({
  crewId,
  activityId,
  canManageAttendance,
  isAdmin,
  activityTitle,
  crewName,
  activityDateLabel,
  qrCode,
  roster,
  initialAttendees,
}: CrewAttendanceProps) {
  const [now, setNow] = useState(() => new Date());
  const [isMobileRosterOpen, setIsMobileRosterOpen] = useState(false);
  const canManage = canManageAttendance ?? isAdmin ?? false;

  const normalizedRoster = useMemo(
    () => roster ?? buildLegacyRoster(initialAttendees),
    [initialAttendees, roster],
  );
  const visibleRoster = normalizedRoster.filter((attendance) => attendance.status !== "CANCELLED");
  const checkedInRoster = visibleRoster.filter((attendance) => attendance.status === "CHECKED_IN");
  const pendingRoster = visibleRoster.filter((attendance) => attendance.status === "RSVP");
  const attendancePreview = visibleRoster.slice(0, 4);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const currentTimeLabel = new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(now);
  const resolvedActivityTitle = formatLabel(activityTitle ?? activityId, "오늘 활동");
  const resolvedCrewName = formatLabel(crewName ?? crewId, "크루");
  const resolvedDateLabel = activityDateLabel ?? "";

  const qrUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/crews/${crewId}/activities/${activityId}/qr-check-in?code=${qrCode ?? activityId}`
      : "";

  if (!canManage) {
    return (
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            {resolvedCrewName} {resolvedDateLabel ? `· ${resolvedDateLabel}` : ""}
          </p>
          <h2 className="text-xl font-semibold text-foreground">{resolvedActivityTitle}</h2>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">체크인 완료</p>
          <RosterRows items={checkedInRoster} emptyTitle="아직 체크인한 멤버가 없습니다" />
        </div>
      </div>
    );
  }

  const mobileRosterTrigger = (
    <Button
      type="button"
      variant="outline"
      aria-label="참석 현황"
      className="flex h-auto w-full items-center justify-between rounded-[24px] border-border/60 bg-muted/56 px-4 py-4 text-left shadow-none hover:bg-muted/72"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex -space-x-2">
          {attendancePreview.map((attendance) => (
            <UserAvatar
              key={attendance.id}
              user={attendance.user}
              size="sm"
              linkToProfile={false}
              className="pointer-events-none ring-2 ring-background"
            />
          ))}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">참석 현황</p>
          <p className="text-xs text-muted-foreground">
            총 {visibleRoster.length}명 · 체크인 {checkedInRoster.length}
          </p>
        </div>
      </div>
      <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
    </Button>
  );

  return (
    <section className="space-y-5">
      <header className="space-y-2 px-4 sm:px-0">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[2rem]">
          {resolvedActivityTitle}
        </h1>
        <p className="text-sm text-muted-foreground">
          {resolvedCrewName}
          {resolvedDateLabel ? ` · ${resolvedDateLabel}` : ""}
        </p>
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <QrCode className="size-4" />
          QR 체크인
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_24rem] lg:items-start xl:grid-cols-[minmax(0,1.2fr)_26rem]">
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-3 px-4 sm:px-0">
            <div
              className="grid aspect-square w-full max-w-sm sm:max-w-md lg:max-w-[34rem] xl:max-w-[38rem] place-items-center rounded-[32px] bg-white p-6 shadow-[0_24px_52px_-36px_rgba(15,23,42,0.28)] sm:rounded-[36px] sm:p-8"
              id="activity-qr-code"
            >
              <QRCodeSVG
                value={qrUrl}
                size={256}
                style={{ width: "100%", height: "auto" }}
                className="text-slate-950"
              />
            </div>
            <p className="text-xs text-muted-foreground">{currentTimeLabel}</p>
          </div>

          <div className="px-4 sm:px-0 md:hidden">
            <Sheet open={isMobileRosterOpen} onOpenChange={setIsMobileRosterOpen}>
              <SheetTrigger asChild>{mobileRosterTrigger}</SheetTrigger>
              <SheetContent
                side="bottom"
                className="top-4 h-[calc(100vh-1rem)] max-h-[calc(100vh-1rem)] rounded-t-[32px] px-0 pb-0 pt-4 shadow-[0_-12px_30px_rgba(15,23,42,0.12)]"
              >
                <SheetHeader className="px-4 pb-2">
                  <SheetTitle className="text-left text-lg font-semibold">참석 현황</SheetTitle>
                  <SheetDescription className="sr-only">
                    체크인 완료와 도착 전 참석자 명단을 확인할 수 있습니다.
                  </SheetDescription>
                </SheetHeader>
                <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8">
                  <div className="space-y-6">
                    <AttendanceSection
                      title="체크인 완료"
                      icon={<Check className="size-4 text-emerald-600" />}
                      items={checkedInRoster}
                      emptyTitle="아직 체크인한 멤버가 없습니다"
                    />
                    <AttendanceSection
                      title="도착 전"
                      icon={<Clock3 className="size-4 text-muted-foreground" />}
                      items={pendingRoster}
                      emptyTitle="남은 참석 신청자가 없습니다"
                      pending
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <aside className="hidden md:flex flex-col lg:min-h-[42rem] lg:overflow-hidden lg:rounded-[28px] lg:border lg:border-border/60 lg:bg-background/96 lg:p-5">
          <div className="space-y-1 border-b border-border/50 pb-4">
            <p className="text-lg font-semibold text-foreground">참석 현황</p>
            <p className="text-sm text-muted-foreground">
              출석 대상 {normalizedRoster.length}명 · 체크인 완료 {checkedInRoster.length} · 도착 전{" "}
              {pendingRoster.length}
            </p>
          </div>
          <div className="min-h-0 flex-1 space-y-6 pt-5 lg:overflow-y-auto">
            <AttendanceSection
              title="체크인 완료"
              icon={<Check className="size-4 text-emerald-600" />}
              items={checkedInRoster}
              emptyTitle="아직 체크인한 멤버가 없습니다"
            />
            <AttendanceSection
              title="도착 전"
              icon={<Clock3 className="size-4 text-muted-foreground" />}
              items={pendingRoster}
              emptyTitle="남은 참석 신청자가 없습니다"
              pending
            />
          </div>
        </aside>
      </div>
    </section>
  );
}
