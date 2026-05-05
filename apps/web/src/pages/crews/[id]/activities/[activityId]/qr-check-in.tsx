import { AlertTriangle, ArrowLeft, CheckCircle, Loader2, QrCode } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import CrewAttendance from "@/components/crew/CrewAttendance";
import { QrScanner } from "@/components/crew/QrScanner";
import { Button } from "@/components/ui/button";
import { useCrewActivity, useQrCheckIn } from "@/hooks/useCrewActivities";
import { useCrew } from "@/hooks/useCrews";
import { useAuth } from "@/lib/auth-context";

function formatActivityDateLabel(value: string | undefined) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  })
    .format(new Date(value))
    .replace(/\s+\(/, "(");
}

export default function QrCheckInPage() {
  const { id: crewId, activityId } = useParams<{
    id: string;
    activityId: string;
  }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const qrCheckIn = useQrCheckIn();
  const { data: activity } = useCrewActivity(crewId ?? "", activityId ?? "");
  const { data: crew } = useCrew(crewId ?? "");

  const [checkInSuccess, setCheckInSuccess] = useState(false);

  const myAttendance = activity?.attendances?.find((attendance) => attendance.userId === user?.id);
  const isAlreadyCheckedIn = myAttendance?.status === "CHECKED_IN";
  const urlQrCode = searchParams.get("code");
  const currentMember = crew?.members?.find((member) => member.user.id === user?.id);
  const hasCrewAdminRole = currentMember?.role === "OWNER" || currentMember?.role === "ADMIN";
  const isPopupHost = activity?.activityType === "POP_UP" && activity.createdBy === user?.id;
  const isOperatorView = Boolean(activity && !urlQrCode && (hasCrewAdminRole || isPopupHost));

  if (isOperatorView && activity) {
    return (
      <CrewAttendance
        crewId={crewId ?? activity.crewId}
        activityId={activityId ?? activity.id}
        canManageAttendance
        activityTitle={activity.title}
        crewName={crew?.name ?? "크루"}
        activityDateLabel={formatActivityDateLabel(activity.activityDate)}
        qrCode={activity.qrCode}
        roster={activity.attendances.map((attendance) => ({
          id: attendance.id,
          userId: attendance.userId,
          status: attendance.status,
          rsvpAt: attendance.rsvpAt,
          checkedAt: attendance.checkedAt,
          user: attendance.user ?? {
            id: attendance.userId,
            name: "이름 없음",
            profileImage: null,
          },
        }))}
      />
    );
  }

  const handleQrCheckIn = (qrCode: string) => {
    if (!crewId || !activityId) return;

    qrCheckIn.mutate(
      { crewId, activityId, qrCode },
      {
        onSuccess: () => {
          setCheckInSuccess(true);
          toast.success("QR 체크인 완료!");
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "체크인에 실패했습니다.");
        },
      },
    );
  };

  const handleScan = (decodedText: string) => {
    try {
      const url = new URL(decodedText);
      const code = url.searchParams.get("code");
      if (code) {
        handleQrCheckIn(code);
        return;
      }
    } catch {
      // noop
    }

    handleQrCheckIn(decodedText);
  };

  if (checkInSuccess || isAlreadyCheckedIn) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
        <div className="rounded-full bg-green-100 p-6 dark:bg-green-900/30">
          <CheckCircle className="size-16 text-green-600 dark:text-green-400" />
        </div>
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">체크인 완료!</h1>
          <p className="text-muted-foreground">{activity?.title ?? "활동"}에 체크인되었습니다.</p>
        </div>
        <Button onClick={() => navigate(`/crews/${crewId}/activities/${activityId}`)}>
          활동으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="활동 상세로 돌아가기"
          onClick={() => navigate(`/crews/${crewId}/activities/${activityId}`)}
        >
          <ArrowLeft className="size-4" />
        </Button>
      </div>

      {activity ? (
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {activity.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {crew?.name ?? "크루"} · {formatActivityDateLabel(activity.activityDate)}
          </p>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <QrCode className="size-4" />
            QR 체크인
          </div>
        </header>
      ) : null}

      {urlQrCode && !checkInSuccess ? (
        <section className="flex flex-col items-center gap-4 py-6">
          {qrCheckIn.isPending ? (
            <>
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-muted-foreground">체크인 처리 중...</p>
            </>
          ) : qrCheckIn.isError ? (
            <>
              <AlertTriangle className="size-8 text-destructive" />
              <p className="text-destructive">
                {qrCheckIn.error instanceof Error
                  ? qrCheckIn.error.message
                  : "체크인에 실패했습니다."}
              </p>
              <Button variant="outline" onClick={() => handleQrCheckIn(urlQrCode)}>
                다시 시도
              </Button>
            </>
          ) : (
            <Button onClick={() => handleQrCheckIn(urlQrCode)} className="w-full" size="lg">
              <QrCode className="mr-2 size-5" />
              QR 코드로 체크인
            </Button>
          )}
        </section>
      ) : (
        <section className="space-y-4 pt-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <QrCode className="size-5" />
            QR 코드 스캔
          </h2>
          <QrScanner onScan={handleScan} />
        </section>
      )}

      {!urlQrCode ? (
        <div className="text-center">
          <p className="mb-2 text-sm text-muted-foreground">카메라를 사용할 수 없나요?</p>
          <Button
            variant="link"
            onClick={() => navigate(`/crews/${crewId}/activities/${activityId}`)}
          >
            활동 상세로 돌아가기
          </Button>
        </div>
      ) : null}
    </div>
  );
}
