import { Link } from "react-router-dom";
import { formatDistance, formatDuration, formatPace } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ShareToggle from "./ShareToggle";
import { MiniRouteMap } from "./MiniRouteMap";

type Visibility = "PRIVATE" | "FOLLOWERS" | "PUBLIC";

const VISIBILITY_BADGE: Record<Visibility, { label: string; variant: "default" | "secondary" | "outline" }> = {
  PUBLIC: { label: "전체 공개", variant: "default" },
  FOLLOWERS: { label: "팔로워 공개", variant: "secondary" },
  PRIVATE: { label: "비공개", variant: "outline" },
};

interface WorkoutCardProps {
  workout: {
    id: string;
    distance: number;
    duration: number;
    pace: number;
    date: Date | string;
    memo: string | null;
    visibility: Visibility;
    userId?: string;
    encodedPolyline?: string | null;
  };
  currentUserId?: string;
  showShareToggle?: boolean;
}

export default function WorkoutCard({
  workout,
  currentUserId,
  showShareToggle = true,
}: WorkoutCardProps) {
  const isOwner = currentUserId && workout.userId === currentUserId;
  const date = new Date(workout.date);
  const dateString = date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  const vis = VISIBILITY_BADGE[workout.visibility];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex justify-between items-start mb-4">
          <Link to={`/workouts/${workout.id}`} className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-foreground">{dateString}</h3>
          </Link>
          <div className="ml-4 flex-shrink-0">
            {isOwner && showShareToggle ? (
              <ShareToggle workoutId={workout.id} initialVisibility={workout.visibility} />
            ) : (
              <Badge variant={vis.variant}>{vis.label}</Badge>
            )}
          </div>
        </div>

        <Link to={`/workouts/${workout.id}`} className="block">
          <div className="flex items-start gap-3">
            <div className="grid grid-cols-3 gap-4 flex-1">
              <div>
                <p className="text-xs text-muted-foreground mb-1">거리</p>
                <p className="text-2xl font-bold tabular-nums">
                  {formatDistance(workout.distance)}
                  <span className="text-sm font-normal text-muted-foreground ml-1">km</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">시간</p>
                <p className="text-2xl font-bold tabular-nums">
                  {formatDuration(workout.duration)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">페이스</p>
                <p className="text-2xl font-bold tabular-nums">
                  {formatPace(workout.pace)}
                  <span className="text-sm font-normal text-muted-foreground ml-1">/km</span>
                </p>
              </div>
            </div>
            {workout.encodedPolyline && (
              <MiniRouteMap
                encodedPolyline={workout.encodedPolyline}
                size={64}
                strokeColor="hsl(var(--primary))"
                strokeWidth={2}
                className="shrink-0 opacity-75 mt-1"
              />
            )}
          </div>

          {workout.memo && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">{workout.memo}</p>
            </div>
          )}
        </Link>
      </CardContent>
    </Card>
  );
}
