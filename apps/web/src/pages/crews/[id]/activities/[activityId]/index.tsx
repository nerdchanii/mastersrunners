import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  CircleX,
  Download,
  Loader2,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { TimeAgo } from "@/components/common/TimeAgo";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

import { useCrewActivityDetailViewModel } from "./use-crew-activity-detail-view-model";
import { getCrewActivityIcon } from "@/components/crew/crew-activity-icons";

import "leaflet/dist/leaflet.css";

// Vite Leaflet icon fix
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function CrewActivityDetailPage() {
  const {
    activity,
    activityId,
    adminCheckInMut,
    canManage,
    cancelActivityMut,
    cancelRsvp,
    checkedInCount,
    checkIn,
    completeActivity,
    creator,
    crewId,
    deleteActivity,
    error,
    goBackToCrew,
    goToChat,
    goToEdit,
    goToQrCheckIn,
    handleAdminCheckIn,
    handleCancelActivity,
    handleCancelRsvp,
    handleCheckIn,
    handleCompleteActivity,
    handleDelete,
    handleDownloadQR,
    handleRsvp,
    isActivityActive,
    isActivityLoading,
    isAdmin,
    myAttendance,
    myStatus,
    noShowCount,
    rsvp,
    rsvpCount,
    scheduledDate,
    setShowCancelDialog,
    setShowCompleteDialog,
    setShowDeleteDialog,
    showCancelDialog,
    showCompleteDialog,
    showDeleteDialog,
    totalActive,
    visibleAttendances,
  } = useCrewActivityDetailViewModel();

  if (isActivityLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
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

  return (
    <div className="space-y-6">
      {/* 1. Back button + Admin dropdown */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={goBackToCrew} className="gap-1.5">
          <ArrowLeft className="size-4" />
          크루로 돌아가기
        </Button>

        {isAdmin && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full p-1.5 text-muted-foreground hover:bg-accent min-h-[44px] min-w-[44px] flex items-center justify-center">
                <MoreHorizontal className="size-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={goToEdit}>
                <Pencil className="size-4 mr-2" />
                수정
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="size-4 mr-2" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* 2. Activity info card */}
      <section className="space-y-4 border-t border-border/50 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 gap-3">
            <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground">
              {getCrewActivityIcon(activity.activityType, activity.activityIcon).node}
            </div>
            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold">{activity.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="size-4 shrink-0" />
                <span>
                  {scheduledDate!.toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    weekday: "short",
                  })}{" "}
                  {scheduledDate!.toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              {activity.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="size-4 shrink-0" />
                  <span>{activity.location}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant={activity.activityType === "OFFICIAL" ? "default" : "secondary"}>
              {activity.activityType === "OFFICIAL" ? "공식" : "번개"}
            </Badge>
            <Badge
              variant={
                activity.status === "SCHEDULED"
                  ? "outline"
                  : activity.status === "ACTIVE"
                    ? "default"
                    : activity.status === "COMPLETED"
                      ? "secondary"
                      : "destructive"
              }
            >
              {activity.status === "SCHEDULED"
                ? "예정"
                : activity.status === "ACTIVE"
                  ? "진행중"
                  : activity.status === "COMPLETED"
                    ? "종료"
                    : "취소됨"}
            </Badge>
          </div>
        </div>

        {activity.description && (
          <div>
            <p className="text-muted-foreground whitespace-pre-wrap">{activity.description}</p>
          </div>
        )}
      </section>

      {/* 3. Map card (lat/lng 있을 때만) */}
      {activity.latitude && activity.longitude && (
        <section className="space-y-4 border-t border-border/50 pt-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="size-5" />
            위치
          </h2>
          <div className="h-[200px] md:h-[250px] w-full overflow-hidden rounded-lg">
            <MapContainer
              center={[activity.latitude, activity.longitude]}
              zoom={15}
              scrollWheelZoom={false}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[activity.latitude, activity.longitude]}>
                <Popup>{activity.location ?? "활동 위치"}</Popup>
              </Marker>
            </MapContainer>
          </div>
        </section>
      )}

      {/* 4. Check-in / RSVP card */}
      <section className="space-y-4 border-t border-border/50 pt-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <UserPlus className="size-5" />
          참석
        </h2>
        <div className="space-y-4">
          {/* Admin QR code section */}
          {canManage && isActivityActive && (
            <div className="space-y-4 pb-4 border-b">
              <div className="flex justify-center">
                <QRCodeSVG
                  id="activity-qr-code"
                  value={`${window.location.origin}/crews/${crewId}/activities/${activityId}/qr-check-in?code=${activity.qrCode}`}
                  size={200}
                  level="H"
                  className="md:size-[200px] size-[160px]"
                />
              </div>
              <div className="flex justify-center">
                <Button variant="outline" size="sm" onClick={handleDownloadQR}>
                  <Download className="size-4 mr-2" />
                  QR 코드 저장
                </Button>
              </div>
            </div>
          )}

          {/* 활동 종료/취소 상태 */}
          {!isActivityActive && (
            <p className="text-sm text-muted-foreground">
              {activity.status === "COMPLETED"
                ? "이 활동은 종료되었습니다."
                : "이 활동은 취소되었습니다."}
            </p>
          )}

          {/* 참석 신청 (미신청 or 취소) */}
          {isActivityActive && !myStatus && (
            <Button onClick={() => handleRsvp()} disabled={rsvp.isPending}>
              {rsvp.isPending ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  신청 중...
                </>
              ) : (
                "참석 신청"
              )}
            </Button>
          )}

          {isActivityActive && myStatus === "CANCELLED" && (
            <Button onClick={() => handleRsvp()} disabled={rsvp.isPending}>
              {rsvp.isPending ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  신청 중...
                </>
              ) : (
                "다시 참석 신청"
              )}
            </Button>
          )}

          {/* RSVP 상태: 체크인 + 참석 취소 */}
          {isActivityActive && myStatus === "RSVP" && (
            <div className="flex items-center gap-3">
              {canManage ? (
                <Button onClick={handleCheckIn} disabled={checkIn.isPending}>
                  {checkIn.isPending ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      체크인 중...
                    </>
                  ) : (
                    "수동 체크인"
                  )}
                </Button>
              ) : (
                <Button variant="outline" onClick={goToQrCheckIn}>
                  QR 체크인
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCancelRsvp()}
                disabled={cancelRsvp.isPending}
              >
                참석 취소
              </Button>
            </div>
          )}

          {isActivityActive && myStatus === "RSVP" && !canManage && (
            <p className="text-sm text-muted-foreground">
              멤버 체크인은 현장 QR 코드로 진행됩니다.
            </p>
          )}

          {/* 체크인 완료 */}
          {myStatus === "CHECKED_IN" && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="size-5" />
              <span className="font-medium">체크인 완료</span>
              {myAttendance?.checkedAt && (
                <span className="text-xs text-muted-foreground">
                  (
                  {new Date(myAttendance.checkedAt).toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  )
                </span>
              )}
            </div>
          )}

          {/* 불참 */}
          {myStatus === "NO_SHOW" && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <CircleX className="size-5" />
              <span className="font-medium">불참</span>
            </div>
          )}
        </div>
      </section>

      {/* Chat link */}
      {(canManage || myStatus === "RSVP" || myStatus === "CHECKED_IN") && (
        <section className="border-t border-border/50 py-4">
          <Button variant="outline" className="w-full" onClick={goToChat}>
            <MessageCircle className="size-4 mr-2" />
            활동 채팅방
          </Button>
        </section>
      )}

      {/* 5. Admin activity management */}
      {canManage && isActivityActive && (
        <section className="space-y-4 border-t border-border/50 pt-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="size-5" />
            활동 관리
          </h2>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowCompleteDialog(true)}>
              활동 종료
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setShowCancelDialog(true)}>
              활동 취소
            </Button>
          </div>
        </section>
      )}

      {/* 6. Attendees card */}
      <section className="space-y-4 border-t border-border/50 pt-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Users className="size-5" />
          참석자 ({totalActive}명)
        </h2>
        <div>
          {/* 통계 바 */}
          {totalActive > 0 && (
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">
                  전체 <strong>{totalActive}</strong>명
                </span>
                <span className="text-green-600">
                  체크인 <strong>{checkedInCount}</strong>명
                </span>
                <span className="text-yellow-600">
                  신청 <strong>{rsvpCount}</strong>명
                </span>
                {noShowCount > 0 && (
                  <span className="text-red-600">
                    불참 <strong>{noShowCount}</strong>명
                  </span>
                )}
              </div>
              <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
                {checkedInCount > 0 && (
                  <div
                    className="bg-green-500 transition-all"
                    style={{
                      width: `${(checkedInCount / totalActive) * 100}%`,
                    }}
                  />
                )}
                {rsvpCount > 0 && (
                  <div
                    className="bg-yellow-500 transition-all"
                    style={{ width: `${(rsvpCount / totalActive) * 100}%` }}
                  />
                )}
                {noShowCount > 0 && (
                  <div
                    className="bg-red-500 transition-all"
                    style={{ width: `${(noShowCount / totalActive) * 100}%` }}
                  />
                )}
              </div>
            </div>
          )}

          {visibleAttendances.length === 0 ? (
            <p className="text-muted-foreground text-sm">아직 참석 신청한 멤버가 없습니다.</p>
          ) : (
            <div className="max-h-[400px] overflow-y-auto space-y-3">
              {visibleAttendances.map((attendee) => (
                <div key={attendee.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      user={{
                        id: attendee.user?.id ?? attendee.userId,
                        name: attendee.user?.name ?? "멤버",
                        profileImage: attendee.user?.profileImage ?? null,
                      }}
                      size="sm"
                      linkToProfile={!!attendee.user}
                    />
                    <div>
                      <p className="font-medium text-sm">
                        {attendee.user?.name ?? "알 수 없는 사용자"}
                      </p>
                      <Badge
                        variant={
                          attendee.status === "CHECKED_IN"
                            ? "default"
                            : attendee.status === "RSVP"
                              ? "outline"
                              : attendee.status === "NO_SHOW"
                                ? "destructive"
                                : "secondary"
                        }
                        className="text-xs"
                      >
                        {attendee.status === "CHECKED_IN"
                          ? "체크인"
                          : attendee.status === "RSVP"
                            ? "신청"
                            : attendee.status === "NO_SHOW"
                              ? "불참"
                              : "취소"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {canManage && isActivityActive && attendee.status === "RSVP" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleAdminCheckIn(attendee.userId, attendee.user?.name)}
                        disabled={adminCheckInMut.isPending}
                      >
                        대리 체크인
                      </Button>
                    )}
                    {attendee.checkedAt && <TimeAgo date={attendee.checkedAt} />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 7. Meta info (creator + creation time) */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pb-4">
        {creator && (
          <>
            <UserAvatar
              user={{
                id: creator.user.id,
                name: creator.user.name,
                profileImage: creator.user.profileImage,
              }}
              size="sm"
              linkToProfile
            />
            <span>{creator.user.name}</span>
            <span>·</span>
          </>
        )}
        <TimeAgo date={activity.createdAt} />
        <span>생성됨</span>
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="활동 삭제"
        description="정말 이 활동을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmLabel="삭제"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleteActivity.isPending}
      />

      <ConfirmDialog
        open={showCompleteDialog}
        onOpenChange={setShowCompleteDialog}
        title="활동 종료"
        description="활동을 종료하면 참석 신청만 하고 체크인하지 않은 멤버는 불참(NO_SHOW) 처리됩니다."
        confirmLabel="종료"
        onConfirm={handleCompleteActivity}
        loading={completeActivity.isPending}
      />

      <ConfirmDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title="활동 취소"
        description="활동을 취소하시겠습니까?"
        confirmLabel="취소"
        variant="destructive"
        onConfirm={handleCancelActivity}
        loading={cancelActivityMut.isPending}
      />
    </div>
  );
}
