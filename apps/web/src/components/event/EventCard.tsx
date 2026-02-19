import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description?: string | null;
    date: string;
    location?: string | null;
    maxParticipants?: number | null;
    _count?: { participants: number };
    status?: string;
  };
}

export default function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(event.date);
  const isPast = eventDate < new Date();
  const participantCount = event._count?.participants ?? 0;

  const month = eventDate.toLocaleDateString("ko-KR", { month: "short" });
  const day = eventDate.getDate();

  return (
    <Link to={`/events/${event.id}`}>
      <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-primary/50">
        <CardHeader className="pb-3">
          <div className="flex gap-4">
            {/* Calendar Date Badge */}
            <div
              className={cn(
                "flex flex-col items-center justify-center w-16 h-16 rounded-lg flex-shrink-0",
                isPast ? "bg-gray-100" : "bg-primary/10"
              )}
            >
              <span
                className={cn(
                  "text-xs font-medium uppercase",
                  isPast ? "text-gray-600" : "text-primary"
                )}
              >
                {month}
              </span>
              <span
                className={cn(
                  "text-2xl font-bold leading-none",
                  isPast ? "text-gray-700" : "text-primary"
                )}
              >
                {day}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
                  {event.title}
                </h3>
              </div>
              <Badge variant={isPast ? "secondary" : "default"} className="text-xs">
                {isPast ? "종료" : "예정"}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          {event.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {event.description}
            </p>
          )}

          <div className="space-y-1.5 text-sm text-muted-foreground pt-2">
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="line-clamp-1">{event.location}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 flex-shrink-0" />
              <span>
                {participantCount}명 참가
                {event.maxParticipants ? ` / ${event.maxParticipants}명` : ""}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}