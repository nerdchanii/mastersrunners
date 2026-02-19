import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "@/components/common/UserAvatar";
import { TimeAgo } from "@/components/common/TimeAgo";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  QrCode,
  CheckCircle,
  Loader2,
} from "lucide-react";

interface Attendee {
  id: string;
  userId: string;
  method: string;
  checkedAt: string;
  user?: {
    id: string;
    name: string;
    profileImage: string | null;
  };
}

interface ActivityDetail {
  id: string;
  crewId: string;
  title: string;
  description: string | null;
  activityDate: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  createdBy: string;
  createdAt: string;
  qrCode: string;
  attendances: Attendee[];
}

export default function CrewActivityDetailPage() {
  const { id: crewId, activityId } = useParams<{ id: string; activityId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activity, setActivity] = useState<ActivityDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivity = async () => {
    try {
      const data = await api.fetch<ActivityDetail>(
        `/crews/${crewId}/activities/${activityId}`,
      );
      setActivity(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "활동을 불러올 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, [crewId, activityId]);

  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    try {
      await api.fetch(`/crews/${crewId}/activities/${activityId}/check-in`, {
        method: "POST",
        body: JSON.stringify({ method: "MANUAL" }),
      });
      toast.success("체크인 완료!");
      fetchActivity();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "체크인에 실패했습니다.";
      toast.error(msg);
    } finally {
      setIsCheckingIn(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <h2 className="text-xl font-semibold">오류</h2>
        <p className="text-muted-foreground">{error ?? "활동을 찾을 수 없습니다."}</p>
        <Button variant="outline" onClick={() => navigate(`/crews/${crewId}`)}>
          크루로 돌아가기
        </Button>
      </div>
    );
  }

  const scheduledDate = new Date(activity.activityDate);
  const isPast = scheduledDate < new Date();
  const isCheckedIn = activity.attendances.some((a) => a.userId === user?.id);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(`/crews/${crewId}`)}
        className="gap-1.5"
      >
        <ArrowLeft className="size-4" />
        크루로 돌아가기
      </Button>

      {/* Activity info card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <CardTitle className="text-2xl">{activity.title}</CardTitle>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="size-4" />
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
                  <MapPin className="size-4" />
                  <span>{activity.location}</span>
                </div>
              )}
            </div>
            <Badge variant={isPast ? "secondary" : "default"}>
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

      {/* Check-in section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <QrCode className="size-5" />
            체크인
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isCheckedIn ? (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="size-5" />
              <span className="font-medium">체크인 완료</span>
            </div>
          ) : (
            <Button onClick={handleCheckIn} disabled={isCheckingIn}>
              {isCheckingIn ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  체크인 중...
                </>
              ) : (
                "수동 체크인"
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Attendees section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="size-5" />
            참석자 ({activity.attendances.length}명)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activity.attendances.length === 0 ? (
            <p className="text-muted-foreground text-sm">아직 체크인한 멤버가 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {activity.attendances.map((attendee) => (
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

      {/* Meta info */}
      <div className="text-sm text-muted-foreground text-center">
        <TimeAgo date={activity.createdAt} /> 생성됨
      </div>
    </div>
  );
}
