import { useState, useEffect } from "react";
import { Calendar, MapPin, Users, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { TimeAgo } from "@/components/common/TimeAgo";
import CrewActivityForm from "./CrewActivityForm";

interface Activity {
  id: string;
  crewId: string;
  title: string;
  description: string | null;
  location: string | null;
  activityDate: string;
  createdAt: string;
  attendances: Array<{ userId: string }>;
}

interface ActivitiesResponse {
  items: Activity[];
  nextCursor: string | null;
}

interface CrewActivityListProps {
  crewId: string;
  isAdmin: boolean;
  isMember: boolean;
}

export default function CrewActivityList({ crewId, isAdmin, isMember }: CrewActivityListProps) {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const data = await api.fetch<ActivitiesResponse>(`/crews/${crewId}/activities`);
      setActivities(data.items ?? []);
    } catch (err) {
      console.error("Failed to load activities:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [crewId]);

  const handleActivityCreated = () => {
    setShowForm(false);
    fetchActivities();
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
      {isAdmin && (
        <div className="flex justify-end">
          <Button onClick={() => setShowForm(true)}>
            <Plus className="size-4 mr-2" />
            활동 만들기
          </Button>
        </div>
      )}

      {activities.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="활동이 없습니다"
          description={isAdmin ? "첫 번째 크루 활동을 만들어보세요!" : "아직 생성된 활동이 없습니다."}
          actionLabel={isAdmin ? "활동 만들기" : undefined}
          onAction={isAdmin ? () => setShowForm(true) : undefined}
        />
      ) : (
        <div className="grid gap-4">
          {activities.map((activity) => {
            const scheduledDate = new Date(activity.activityDate);
            const isPast = scheduledDate < new Date();

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
                    <Badge variant={isPast ? "secondary" : "default"}>
                      {isPast ? "종료" : "예정"}
                    </Badge>
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
                      <span>{activity.attendances.length}명 참석</span>
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
