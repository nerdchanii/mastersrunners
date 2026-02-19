import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowLeft, Loader2, QrCode, AlertTriangle } from "lucide-react";
import { QrScanner } from "@/components/crew/QrScanner";
import { useQrCheckIn, useCrewActivity } from "@/hooks/useCrewActivities";
import { useCrew } from "@/hooks/useCrews";

export default function QrCheckInPage() {
  const { id: crewId, activityId } = useParams<{ id: string; activityId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const qrCheckIn = useQrCheckIn();
  const { data: activity } = useCrewActivity(crewId ?? "", activityId ?? "");
  const { data: crew } = useCrew(crewId ?? "");

  const [checkInSuccess, setCheckInSuccess] = useState(false);

  // Check if user is a member
  const isMember = crew?.members?.some((m) => m.user.id === user?.id);
  const myAttendance = activity?.attendances?.find((a) => a.userId === user?.id);
  const isAlreadyCheckedIn = myAttendance?.status === "CHECKED_IN";

  // Auto-submit if qrCode is in URL params
  const urlQrCode = searchParams.get("code");

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
    // Parse QR code URL to extract the code parameter
    try {
      const url = new URL(decodedText);
      const code = url.searchParams.get("code");
      if (code) {
        handleQrCheckIn(code);
      } else {
        toast.error("유효하지 않은 QR 코드입니다.");
      }
    } catch {
      // If not a URL, try using the raw text as the code
      handleQrCheckIn(decodedText);
    }
  };

  // Success screen
  if (checkInSuccess || isAlreadyCheckedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-6">
          <CheckCircle className="size-16 text-green-600 dark:text-green-400" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">체크인 완료!</h1>
          <p className="text-muted-foreground">
            {activity?.title ?? "활동"}에 체크인되었습니다.
          </p>
        </div>
        <Button
          onClick={() => navigate(`/crews/${crewId}/activities/${activityId}`)}
        >
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
          size="icon"
          onClick={() => navigate(`/crews/${crewId}/activities/${activityId}`)}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="text-xl font-bold">QR 체크인</h1>
      </div>

      {activity && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{activity.title}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {new Date(activity.activityDate).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </CardContent>
        </Card>
      )}

      {/* URL에 code 파라미터가 있으면 자동 체크인 */}
      {urlQrCode && !checkInSuccess ? (
        <Card>
          <CardContent className="py-8 flex flex-col items-center gap-4">
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
              <Button
                onClick={() => handleQrCheckIn(urlQrCode)}
                className="w-full"
                size="lg"
              >
                <QrCode className="size-5 mr-2" />
                QR 코드로 체크인
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        /* 카메라 QR 스캐너 */
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <QrCode className="size-5" />
              QR 코드 스캔
            </CardTitle>
          </CardHeader>
          <CardContent>
            <QrScanner onScan={handleScan} />
          </CardContent>
        </Card>
      )}

      {/* 수동 체크인 fallback */}
      {!urlQrCode && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            카메라를 사용할 수 없나요?
          </p>
          <Button
            variant="link"
            onClick={() => navigate(`/crews/${crewId}/activities/${activityId}`)}
          >
            수동 체크인으로 이동
          </Button>
        </div>
      )}
    </div>
  );
}
