import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/common/UserAvatar";
import { TimeAgo } from "@/components/common/TimeAgo";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  QrCode,
  CheckCircle,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
  Download,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { QRCodeSVG } from "qrcode.react";
import {
  useCrewActivity,
  useDeleteActivity,
  useCheckIn,
} from "@/hooks/useCrewActivities";
import { useCrew } from "@/hooks/useCrews";

// Vite Leaflet icon fix
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function CrewActivityDetailPage() {
  const { id: crewId, activityId } = useParams<{ id: string; activityId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const {
    data: activity,
    isLoading: isActivityLoading,
    error,
  } = useCrewActivity(crewId!, activityId!);

  const { data: crew } = useCrew(crewId!);
  const deleteActivity = useDeleteActivity();
  const checkIn = useCheckIn();

  const currentMember = crew?.members?.find((m) => m.user.id === user?.id);
  const isAdmin =
    currentMember?.role === "OWNER" || currentMember?.role === "ADMIN";

  const creator = activity
    ? crew?.members?.find((m) => m.user.id === activity.createdBy)
    : undefined;

  const handleDelete = () => {
    deleteActivity.mutate(
      { crewId: crewId!, activityId: activityId! },
      {
        onSuccess: () => {
          toast.success("활동이 삭제되었습니다.");
          navigate(`/crews/${crewId}`);
        },
        onError: () => {
          toast.error("활동 삭제에 실패했습니다.");
        },
      },
    );
  };

  const handleCheckIn = () => {
    checkIn.mutate(
      { crewId: crewId!, activityId: activityId!, method: "MANUAL" },
      {
        onSuccess: () => toast.success("체크인 완료!"),
        onError: () => toast.error("체크인에 실패했습니다."),
      },
    );
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById("activity-qr-code");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const link = document.createElement("a");
      link.download = `activity-${activityId}-qr.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgData)));
  };

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
        <Button variant="outline" onClick={() => navigate(`/crews/${crewId}`)}>
          크루로 돌아가기
        </Button>
      </div>
    );
  }

  const scheduledDate = new Date(activity.activityDate);
  const isPast = scheduledDate < new Date();
  const myAttendance = activity.attendances.find((a) => a.userId === user?.id);
  const isCheckedIn = !!myAttendance;

  const qrCount = activity.attendances.filter((a) => a.method === "QR").length;
  const manualCount = activity.attendances.filter(
    (a) => a.method === "MANUAL",
  ).length;
  const totalCount = activity.attendances.length;

  return (
    <div className="space-y-6">
      {/* 1. Back button + Admin dropdown */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/crews/${crewId}`)}
          className="gap-1.5"
        >
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
              <DropdownMenuItem
                onClick={() =>
                  navigate(
                    `/crews/${crewId}/activities/${activityId}/edit`,
                  )
                }
              >
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
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold">{activity.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="size-4 shrink-0" />
                <span>
                  {scheduledDate.toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    weekday: "short",
                  })}{" "}
                  {scheduledDate.toLocaleTimeString("ko-KR", {
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
            <Badge variant={isPast ? "secondary" : "default"} className="shrink-0">
              {isPast ? "종료" : "예정"}
            </Badge>
          </div>
        </CardHeader>

        {activity.description && (
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {activity.description}
            </p>
          </CardContent>
        )}
      </Card>

      {/* 3. Map card (lat/lng 있을 때만) */}
      {activity.latitude && activity.longitude && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="size-5" />
              위치
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      )}

      {/* 4. Check-in card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <QrCode className="size-5" />
            체크인
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isAdmin ? (
            /* Admin: QR 코드 표시 */
            <div className="space-y-4">
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
          ) : (
            /* 일반 멤버: 수동 체크인 버튼 */
            <>
              {isCheckedIn && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="size-5" />
                  <span className="font-medium">체크인 완료</span>
                  <span className="text-xs text-muted-foreground">
                    (
                    {new Date(myAttendance!.checkedAt).toLocaleTimeString(
                      "ko-KR",
                      { hour: "2-digit", minute: "2-digit" },
                    )}
                    )
                  </span>
                </div>
              )}
              {isPast && !isCheckedIn && (
                <p className="text-sm text-muted-foreground">
                  이 활동은 종료되었습니다.
                </p>
              )}
              {!isPast && !isCheckedIn && (
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
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 5. Attendees card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="size-5" />
            참석자 ({totalCount}명)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* 통계 바 */}
          {totalCount > 0 && (
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">
                  전체 <strong>{totalCount}</strong>명
                </span>
                <span className="text-blue-600">
                  QR <strong>{qrCount}</strong>명
                </span>
                <span className="text-green-600">
                  수동 <strong>{manualCount}</strong>명
                </span>
              </div>
              <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
                {qrCount > 0 && (
                  <div
                    className="bg-blue-500 transition-all"
                    style={{ width: `${(qrCount / totalCount) * 100}%` }}
                  />
                )}
                {manualCount > 0 && (
                  <div
                    className="bg-green-500 transition-all"
                    style={{ width: `${(manualCount / totalCount) * 100}%` }}
                  />
                )}
              </div>
            </div>
          )}

          {totalCount === 0 ? (
            <p className="text-muted-foreground text-sm">
              아직 체크인한 멤버가 없습니다.
            </p>
          ) : (
            <div className="max-h-[400px] overflow-y-auto space-y-3">
              {activity.attendances.map((attendee) => (
                <div
                  key={attendee.id}
                  className="flex items-center justify-between"
                >
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
                      <p className="text-xs text-muted-foreground">
                        {attendee.method === "QR" ? "QR 체크인" : "수동 체크인"}
                      </p>
                    </div>
                  </div>
                  <TimeAgo date={attendee.checkedAt} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 6. Meta info (creator + creation time) */}
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

      {/* 7. Delete confirm dialog */}
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
    </div>
  );
}
