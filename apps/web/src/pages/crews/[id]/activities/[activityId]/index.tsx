import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Ellipsis,
  MessageCircle,
  QrCode,
  Share2,
  UserPlus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { TimeAgo } from "@/components/common/TimeAgo";
import { UserAvatar } from "@/components/common/UserAvatar";
import { getCrewActivityIcon } from "@/components/crew/crew-activity-icons";
import { AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconButton } from "@/components/ui/icon-button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { shareLink } from "@/lib/share-link";

import { useCrewActivityDetailViewModel } from "./use-crew-activity-detail-view-model";

function getMetaStatus(status: string | undefined, cancelled: boolean) {
  if (cancelled) {
    return <Badge variant="destructive">취소됨</Badge>;
  }

  if (status === "CHECKED_IN") {
    return <span className="text-xs font-medium text-emerald-700">출석 완료</span>;
  }

  return null;
}

export default function CrewActivityDetailPage() {
  const {
    activity,
    cancelActivityMut,
    canManage,
    checkedInAttendances,
    error,
    goBackToCrew,
    goToChat,
    goToEdit,
    goToQrCheckIn,
    handleCancelActivity,
    handleCancelRsvp,
    handleRsvpAndEnterChat,
    handleRsvp,
    isActivityLoading,
    myStatus,
    pendingAttendances,
    setShowCancelDialog,
    showCancelDialog,
    crewName,
    activityDateLabel,
    canViewPendingRoster,
    activityShareUrl,
  } = useCrewActivityDetailViewModel();
  const [isLockedChatDialogOpen, setIsLockedChatDialogOpen] = useState(false);
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const totalAttendance = checkedInAttendances.length + pendingAttendances.length;
  const isCancelled = activity?.status === "CANCELLED";
  const canEnterChat =
    !isCancelled && (canManage || myStatus === "RSVP" || myStatus === "CHECKED_IN");
  const hasJoined = myStatus === "RSVP" || myStatus === "CHECKED_IN";
  const getAttendanceUser = (attendance: {
    user?: { id: string; name: string; profileImage?: string | null } | null;
    userId: string;
  }) =>
    attendance.user ?? {
      id: attendance.userId,
      name: "이름 없음",
      profileImage: null,
    };

  useEffect(() => {
    if (!activity || !isCancelled || !hasJoined || canManage) {
      return;
    }

    toast.info("취소된 활동입니다. 크루 홈으로 이동합니다.");
    const timeoutId = window.setTimeout(() => {
      goBackToCrew();
    }, 1400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activity, canManage, goBackToCrew, hasJoined, isCancelled]);

  if (isActivityLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-[28px]" />
        <Skeleton className="h-40 rounded-[28px]" />
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <h2 className="text-xl font-semibold">오류</h2>
        <p className="text-muted-foreground">
          {error instanceof Error ? error.message : "활동을 찾을 수 없습니다."}
        </p>
        <Button variant="outline" onClick={goBackToCrew}>
          크루로 돌아가기
        </Button>
      </div>
    );
  }

  const { node: activityIconNode } = getCrewActivityIcon(
    activity.activityType,
    activity.activityIcon,
  );
  const attendancePreview = [...checkedInAttendances, ...pendingAttendances].slice(0, 3);

  const handleShare = async () => {
    try {
      const result = await shareLink({
        title: activity.title,
        text: `${crewName} 활동을 확인해보세요.`,
        url: activityShareUrl,
      });

      if (result === "copied") {
        toast.success("활동 링크를 복사했습니다.");
      }
    } catch (shareError) {
      toast.error(shareError instanceof Error ? shareError.message : "링크 공유에 실패했습니다.");
    }
  };

  const handleChatClick = () => {
    if (isCancelled) {
      return;
    }

    if (canEnterChat) {
      goToChat();
      return;
    }

    setIsLockedChatDialogOpen(true);
  };

  const handleJoinAndEnterChat = () => {
    handleRsvpAndEnterChat();
  };

  const rosterSheetTrigger = (
    <button
      type="button"
      aria-label="참석 현황"
      className="flex h-auto min-h-[52px] w-full items-center justify-between rounded-[22px] bg-secondary px-4 py-3 text-left transition-colors hover:bg-secondary/80"
    >
      <div className="flex min-w-0 items-center gap-3">
        <AvatarGroup className="shrink-0">
          {attendancePreview.map((attendance) => {
            const displayUser = getAttendanceUser(attendance);
            return (
              <UserAvatar
                key={attendance.id}
                user={displayUser}
                size="sm"
                linkToProfile={false}
                className="pointer-events-none"
              />
            );
          })}
          {totalAttendance > attendancePreview.length ? (
            <AvatarGroupCount className="size-6 text-xs">
              +{totalAttendance - attendancePreview.length}
            </AvatarGroupCount>
          ) : null}
        </AvatarGroup>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            참석 현황
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
              · 총 {totalAttendance}명
            </span>
          </p>
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground">열기</span>
    </button>
  );

  const attendanceList = (
    <div className="space-y-3">
      {checkedInAttendances.length === 0 ? (
        <div className="rounded-2xl bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
          아직 체크인한 멤버가 없습니다.
        </div>
      ) : (
        <div className="divide-y divide-border/50">
          {checkedInAttendances.map((attendance) => {
            const displayUser = getAttendanceUser(attendance);
            return (
              <div
                key={attendance.id}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0 flex items-center gap-3">
                  <UserAvatar user={displayUser} size="default" linkToProfile />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {attendance.user?.name ?? "이름 없음"}
                    </p>
                    {attendance.checkedAt ? (
                      <TimeAgo date={attendance.checkedAt} className="text-xs" />
                    ) : null}
                  </div>
                </div>
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const pendingList = (
    <div className="space-y-3">
      {pendingAttendances.length === 0 ? (
        <div className="rounded-2xl bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
          아직 남은 참석 신청자가 없습니다.
        </div>
      ) : (
        <div className="divide-y divide-border/50">
          {pendingAttendances.map((attendance) => {
            const displayUser = getAttendanceUser(attendance);
            return (
              <div
                key={attendance.id}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0 flex items-center gap-3">
                  <UserAvatar user={displayUser} size="default" linkToProfile />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {attendance.user?.name ?? "이름 없음"}
                    </p>
                    <TimeAgo date={attendance.rsvpAt} className="text-xs" />
                  </div>
                </div>
                <span className="text-xs font-medium text-muted-foreground">도착 전</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const rosterSheet = (
    <Sheet open={isRosterOpen} onOpenChange={setIsRosterOpen}>
      <SheetTrigger asChild>{rosterSheetTrigger}</SheetTrigger>
      <SheetContent
        side="bottom"
        className="top-4 h-[calc(100vh-1rem)] max-h-[calc(100vh-1rem)] rounded-t-[32px] px-0 pb-0 pt-4 shadow-lg shadow-black/8 sm:h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-2rem)]"
      >
        <SheetHeader className="px-4 pb-2">
          <SheetTitle>참석 현황</SheetTitle>
          <SheetDescription className="sr-only">
            체크인 완료와 도착 전 멤버 목록을 확인할 수 있습니다.
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-hidden px-4 pb-6">
          <Tabs
            defaultValue={canViewPendingRoster ? "pending" : "checked-in"}
            className="flex h-full min-h-0 flex-col gap-4"
          >
            <TabsList className="w-full rounded-2xl bg-muted/35 p-1">
              <TabsTrigger value="checked-in" className="rounded-xl">
                체크인 완료
              </TabsTrigger>
              {canViewPendingRoster ? (
                <TabsTrigger value="pending" className="rounded-xl">
                  도착 전
                </TabsTrigger>
              ) : null}
            </TabsList>
            <TabsContent value="checked-in" className="min-h-0 flex-1 overflow-y-auto">
              {attendanceList}
            </TabsContent>
            {canViewPendingRoster ? (
              <TabsContent value="pending" className="min-h-0 flex-1 overflow-y-auto">
                {pendingList}
              </TabsContent>
            ) : null}
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="space-y-6">
      <section className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="크루로 돌아가기"
            onClick={goBackToCrew}
          >
            <ArrowLeft className="size-4" />
          </Button>

          <div className="flex items-center gap-2">
            {hasJoined && !isCancelled ? (
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs font-medium"
                onClick={handleCancelRsvp}
              >
                참석 취소
              </Button>
            ) : null}
            <IconButton variant="ghost" size="icon-sm" aria-label="활동 공유" onClick={handleShare}>
              <Share2 className="size-4" />
            </IconButton>
            {canManage ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <IconButton variant="ghost" size="icon-sm" aria-label="활동 메뉴">
                    <Ellipsis className="size-4" />
                  </IconButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 rounded-xl">
                  <DropdownMenuItem onClick={goToEdit}>수정</DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    disabled={isCancelled}
                    onClick={() => setShowCancelDialog(true)}
                  >
                    활동 취소
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-muted/35 text-lg">
              {activityIconNode}
            </span>
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                  {activity.title}
                </h1>
                {getMetaStatus(myStatus, isCancelled)}
              </div>
              <p className="text-sm text-muted-foreground">
                {crewName} · {activityDateLabel}
              </p>
              {activity.location ? (
                <p className="text-sm text-muted-foreground">{activity.location}</p>
              ) : null}
            </div>
          </div>

          {activity.description ? (
            <p className="text-sm leading-6 text-muted-foreground sm:text-base">
              {activity.description}
            </p>
          ) : null}
        </div>

        <AnimatePresence mode="wait">
          {!hasJoined ? (
            <motion.div
              key="not-joined"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-3"
            >
              <div className="flex items-stretch gap-3 justify-end">
                <div className="min-w-0 flex-1">
                  <Button
                    size="lg"
                    className="h-12 w-full gap-2 rounded-[22px] bg-primary text-primary-foreground overflow-hidden whitespace-nowrap"
                    disabled={isCancelled}
                    onClick={handleRsvp}
                  >
                    <div className="flex items-center gap-2">
                      <UserPlus className="size-5 shrink-0" />
                      <span>참석 신청</span>
                    </div>
                  </Button>
                </div>
              </div>

              <div>{rosterSheet}</div>
            </motion.div>
          ) : (
            <motion.div
              key="joined"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-3"
            >
              <div className="flex items-stretch gap-3 overflow-visible justify-end">
                <div className="min-w-0 flex-1">
                  <Button
                    size="lg"
                    className="h-12 w-full gap-2 rounded-[22px] border border-border/60 bg-white text-black shadow-sm hover:bg-gray-100 dark:bg-white dark:text-black dark:hover:bg-gray-200 overflow-hidden whitespace-nowrap"
                    disabled={isCancelled}
                    onClick={goToQrCheckIn}
                  >
                    <QrCode className="size-5 shrink-0" />
                    <span>QR 체크인</span>
                  </Button>
                </div>

                <div className="shrink-0">
                  <Button
                    className="h-12 w-12 shrink-0 rounded-[22px] p-0 shadow-md bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={isCancelled}
                    onClick={handleChatClick}
                    aria-label="활동 채팅"
                  >
                    <MessageCircle className="size-5" />
                  </Button>
                </div>
              </div>

              <div>{rosterSheet}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <Dialog open={isLockedChatDialogOpen} onOpenChange={setIsLockedChatDialogOpen}>
        <DialogContent className="rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>활동 참여하고 채팅방 참여하기</DialogTitle>
            <DialogDescription>활동 참여 후 바로 채팅방에 입장합니다.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsLockedChatDialogOpen(false)}>
              닫기
            </Button>
            <Button onClick={handleJoinAndEnterChat} disabled={isCancelled}>
              활동 참여하고 채팅방 참여하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title="이 활동을 취소할까요?"
        description="취소되면 참가자에게 더 이상 출석 체크를 받을 수 없고, 채팅에도 취소 상태가 반영됩니다."
        confirmLabel="활동 취소"
        variant="destructive"
        onConfirm={handleCancelActivity}
        loading={cancelActivityMut.isPending}
      />
    </div>
  );
}
