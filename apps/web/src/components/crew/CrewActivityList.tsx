import { Calendar, MapPin, Plus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { EmptyState } from "@/components/common/EmptyState";
import { TimeAgo } from "@/components/common/TimeAgo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ActivitiesResponse } from "@/hooks/useCrewActivities";
import { useCrewActivities } from "@/hooks/useCrewActivities";

import { getCrewActivityIcon } from "./crew-activity-icons";
import CrewActivityForm from "./CrewActivityForm";

interface CrewActivityListProps {
  canOpenActivityDetails: boolean;
  crewId: string;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isMember: boolean;
  onRequireAuth: () => void;
  defaultShowForm?: boolean;
  composerNonce?: number;
  showInlineCreateAction?: boolean;
  showEmptyCreateAction?: boolean;
  isActive?: boolean;
  onComposerHandled?: () => void;
}

function getLocalDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function isSameLocalDay(left: Date, right: Date) {
  return getLocalDateKey(left) === getLocalDateKey(right);
}

export default function CrewActivityList({
  canOpenActivityDetails,
  crewId,
  isAdmin,
  isAuthenticated,
  isMember,
  onRequireAuth,
  defaultShowForm = false,
  composerNonce = 0,
  showInlineCreateAction = true,
  showEmptyCreateAction = showInlineCreateAction,
  isActive = true,
  onComposerHandled,
}: CrewActivityListProps) {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(defaultShowForm);

  const { data, isLoading, refetch } = useCrewActivities(crewId);

  const activities = (data as ActivitiesResponse | undefined)?.items ?? [];
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const handleActivityCreated = () => {
    setShowForm(false);
    refetch();
  };

  const visibleActivities = activities
    .map((activity) => ({
      activity,
      scheduledDate: new Date(activity.activityDate),
    }))
    .filter(({ scheduledDate }) => scheduledDate >= today)
    .sort((left, right) => {
      const leftIsToday = isSameLocalDay(left.scheduledDate, now);
      const rightIsToday = isSameLocalDay(right.scheduledDate, now);

      if (leftIsToday !== rightIsToday) {
        return leftIsToday ? -1 : 1;
      }

      if (leftIsToday && rightIsToday) {
        return left.scheduledDate.getTime() - right.scheduledDate.getTime();
      }

      return right.scheduledDate.getTime() - left.scheduledDate.getTime();
    });

  // POP_UP은 일반 멤버도 생성 가능
  const canCreate = isAdmin || isMember;

  useEffect(() => {
    if (!isActive || !composerNonce || !canCreate) {
      return;
    }
    setShowForm(true);
    onComposerHandled?.();
  }, [composerNonce, canCreate, isActive, onComposerHandled]);

  useEffect(() => {
    if (isActive) {
      return;
    }
    setShowForm(false);
  }, [isActive]);

  const handleOpenActivity = (activityId: string) => {
    if (!isAuthenticated) {
      onRequireAuth();
      return;
    }
    if (!canOpenActivityDetails) {
      return;
    }

    navigate(`/crews/${crewId}/activities/${activityId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    );
  }

  const closeCreateForm = () => {
    setShowForm(false);
  };

  if (showForm) {
    return (
      <section className="space-y-4 border-t border-border/50 pt-4">
        <h3 className="text-base font-semibold">새 활동 만들기</h3>
        <CrewActivityForm
          crewId={crewId}
          onSuccess={handleActivityCreated}
          onCancel={closeCreateForm}
        />
      </section>
    );
  }

  return (
    <div className="space-y-4">
      {canCreate && showInlineCreateAction && (
        <div className="flex justify-end">
          <Button onClick={() => setShowForm(true)}>
            <Plus className="size-4 mr-2" />
            활동 만들기
          </Button>
        </div>
      )}

      {visibleActivities.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="활동이 없습니다"
          description={canCreate ? "아직 잡힌 일정이 없습니다." : "예정된 활동이 아직 없습니다."}
          actionLabel={canCreate && showEmptyCreateAction ? "활동 만들기" : undefined}
          onAction={canCreate && showEmptyCreateAction ? () => setShowForm(true) : undefined}
        />
      ) : (
        <div className="grid gap-4">
          {visibleActivities.map(({ activity, scheduledDate }) => {
            const isToday = isSameLocalDay(scheduledDate, now);
            const hasStarted = isToday && scheduledDate.getTime() <= now.getTime();
            const checkedInCount = activity.attendances.filter(
              (a) => a.status === "CHECKED_IN",
            ).length;
            const rsvpCount = activity.attendances.filter((a) => a.status === "RSVP").length;
            const totalActive = checkedInCount + rsvpCount;
            const canAttemptOpen = canOpenActivityDetails || !isAuthenticated;

            return (
              <Card
                key={activity.id}
                className={[
                  hasStarted ? "border-border/70 bg-muted/20" : "border-border/60",
                  canAttemptOpen ? "cursor-pointer transition-shadow hover:shadow-md" : "",
                ].join(" ")}
                onClick={() => handleOpenActivity(activity.id)}
              >
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 gap-3">
                      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground">
                        {getCrewActivityIcon(activity.activityType, activity.activityIcon).node}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold">{activity.title}</h3>
                        <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Calendar className="size-3.5" />
                          <span>
                            {scheduledDate.toLocaleDateString("ko-KR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {isToday ? <span className="text-xs font-medium">당일</span> : null}
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <Badge
                        variant={activity.activityType === "OFFICIAL" ? "default" : "secondary"}
                      >
                        {activity.activityType === "OFFICIAL" ? "공식" : "번개"}
                      </Badge>
                      {isToday ? (
                        <Badge variant={hasStarted ? "secondary" : "outline"}>
                          {hasStarted ? "진행됨" : "당일"}
                        </Badge>
                      ) : (
                        <Badge variant="outline">예정</Badge>
                      )}
                    </div>
                  </div>

                  {activity.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {activity.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    {activity.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate">{activity.location}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 ml-auto">
                      <Users className="w-3.5 h-3.5" />
                      <span>{totalActive}명 참석</span>
                    </div>
                  </div>

                  <div className="border-t border-border/50 pt-2">
                    <TimeAgo date={activity.createdAt} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
