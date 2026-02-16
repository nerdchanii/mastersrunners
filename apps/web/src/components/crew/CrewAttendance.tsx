import { useState, useEffect } from "react";
import { QrCode, Check } from "lucide-react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { UserAvatar } from "@/components/common/UserAvatar";
import { TimeAgo } from "@/components/common/TimeAgo";

interface Attendee {
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
  isAdmin: boolean;
  isMember: boolean;
}

export default function CrewAttendance({ crewId, activityId, isAdmin, isMember }: CrewAttendanceProps) {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const fetchAttendees = async () => {
    setIsLoading(true);
    try {
      const data = await api.fetch<Attendee[]>(
        `/crews/${crewId}/activities/${activityId}/attendance`
      );
      setAttendees(data);
    } catch (err) {
      console.error("Failed to load attendees:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendees();
  }, [crewId, activityId]);

  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    try {
      await api.fetch(`/crews/${crewId}/activities/${activityId}/attendance`, {
        method: "POST",
      });
      await fetchAttendees();
    } catch (err) {
      alert(err instanceof Error ? err.message : "출석 체크에 실패했습니다.");
    } finally {
      setIsCheckingIn(false);
    }
  };

  // QR code URL for this activity (fixed for all members)
  const qrCodeUrl = `${window.location.origin}/crews/${crewId}/activities/${activityId}/checkin`;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 rounded-lg" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* QR Code Section */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              출석 QR 코드
            </CardTitle>
            <CardDescription>
              멤버들에게 이 QR 코드를 스캔하도록 안내하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {/* QR code placeholder - in production, use a QR code library */}
            <div className="w-64 h-64 bg-muted rounded-lg flex items-center justify-center mb-4">
              <div className="text-center space-y-2">
                <QrCode className="w-16 h-16 mx-auto text-muted-foreground" />
                <p className="text-xs text-muted-foreground">QR 코드</p>
                <p className="text-xs font-mono text-muted-foreground px-4 break-all">
                  {qrCodeUrl}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              이 QR 코드는 활동 종료 시까지 유효합니다
            </p>
          </CardContent>
        </Card>
      )}

      {/* Check-in Button for Members */}
      {isMember && !isAdmin && (
        <Card>
          <CardContent className="p-6 flex flex-col items-center">
            <Button
              size="lg"
              onClick={handleCheckIn}
              disabled={isCheckingIn || attendees.some((a) => a.userId === "current-user-id")}
              className="w-full max-w-sm"
            >
              <Check className="w-5 h-5 mr-2" />
              {isCheckingIn ? "출석 체크 중..." : "출석 체크"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Attendee List */}
      <Card>
        <CardHeader>
          <CardTitle>참석자 ({attendees.length}명)</CardTitle>
        </CardHeader>
        <CardContent>
          {attendees.length === 0 ? (
            <EmptyState title="아직 출석한 멤버가 없습니다" />
          ) : (
            <div className="space-y-2">
              {attendees.map((attendee) => (
                <div
                  key={attendee.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <UserAvatar user={attendee.user} size="default" linkToProfile />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{attendee.user.name}</p>
                      <TimeAgo date={attendee.checkedInAt} />
                    </div>
                  </div>
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
