import { useState } from "react";
import { Calendar, MapPin, Users, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { TimeAgo } from "@/components/common/TimeAgo";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CrewActivityForm from "./CrewActivityForm";
import { useCrewActivities } from "@/hooks/useCrewActivities";
import type { ActivitiesResponse } from "@/hooks/useCrewActivities";

interface CrewActivityListProps {
  crewId: string;
  isAdmin: boolean;
  isMember: boolean;
}

type ActivityTypeFilter = "ALL" | "OFFICIAL" | "POP_UP";
type StatusFilter = "ALL" | "SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export default function CrewActivityList({ crewId, isAdmin, isMember }: CrewActivityListProps) {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [typeFilter, setTypeFilter] = useState<ActivityTypeFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const { data, isLoading, refetch } = useCrewActivities(crewId);

  const activities = (data as ActivitiesResponse | undefined)?.items ?? [];

  const handleActivityCreated = () => {
    setShowForm(false);
    refetch();
  };

  // 클라이언트 사이드 필터링
  const filtered = activities.filter((a) => {
    if (typeFilter !== "ALL" && a.activityType !== typeFilter) return false;
    if (statusFilter !== "ALL" && a.status !== statusFilter) return false;
    return true;
  });

  // POP_UP은 일반 멤버도 생성 가능
  const canCreate = isAdmin || isMember;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    );
  }

  if (showForm) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>새 활동 만들기</CardTitle>
        </CardHeader>
        <CardContent>
          <CrewActivityForm
            crewId={crewId}
            onSuccess={handleActivityCreated}
            onCancel={() => setShowForm(false)}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* 헤더: 생성 버튼 */}
      {canCreate && (
        <div className="flex justify-end">
          <Button onClick={() => setShowForm(true)}>
            <Plus className="size-4 mr-2" />
            활동 만들기
          </Button>
        </div>
      )}

      {/* 타입 탭 필터 */}
      <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as ActivityTypeFilter)}>
        <TabsList>
          <TabsTrigger value="ALL">전체</TabsTrigger>
          <TabsTrigger value="OFFICIAL">공식 모임</TabsTrigger>
          <TabsTrigger value="POP_UP">번개</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* 상태 필터 버튼 */}
      <div className="flex flex-wrap gap-2">
        {(["ALL", "SCHEDULED", "ACTIVE", "COMPLETED", "CANCELLED"] as StatusFilter[]).map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(s)}
          >
            {s === "ALL" ? "전체" : s === "SCHEDULED" ? "예정" : s === "ACTIVE" ? "진행중" : s === "COMPLETED" ? "종료" : "취소됨"}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="활동이 없습니다"
          description={canCreate ? "첫 번째 크루 활동을 만들어보세요!" : "아직 생성된 활동이 없습니다."}
          actionLabel={canCreate ? "활동 만들기" : undefined}
          onAction={canCreate ? () => setShowForm(true) : undefined}
        />
      ) : (
        <div className="grid gap-4">
          {filtered.map((activity) => {
            const scheduledDate = new Date(activity.activityDate);
            const checkedInCount = activity.attendances.filter((a) => a.status === "CHECKED_IN").length;
            const rsvpCount = activity.attendances.filter((a) => a.status === "RSVP").length;
            const totalActive = checkedInCount + rsvpCount;

            return (
              <Card
                key={activity.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/crews/${crewId}/activities/${activity.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="truncate">{activity.title}</CardTitle>
                      <CardDescription className="mt-1">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {scheduledDate.toLocaleDateString("ko-KR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
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
                </CardHeader>

                <CardContent className="space-y-2">
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

                  <div className="pt-2 border-t">
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
