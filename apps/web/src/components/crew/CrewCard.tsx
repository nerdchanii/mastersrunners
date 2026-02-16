import { Link } from "react-router-dom";
import { Users, Lock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CrewCardProps {
  crew: {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    isPublic: boolean;
    createdAt: string;
    creator: {
      id: string;
      name: string;
      profileImage: string | null;
    };
    _count: {
      members: number;
    };
  };
}

export default function CrewCard({ crew }: CrewCardProps) {
  return (
    <Link to={`/crews/${crew.id}`} className="block h-full">
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer flex flex-col">
        <CardHeader className="space-y-2">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              {crew.imageUrl ? (
                <img
                  src={crew.imageUrl}
                  alt={crew.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <Users className="w-6 h-6 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg truncate">{crew.name}</CardTitle>
                {!crew.isPublic && (
                  <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
              </div>
              <CardDescription className="text-xs">
                {crew.creator.name}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col justify-between">
          {crew.description ? (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {crew.description}
            </p>
          ) : (
            <div className="flex-1" />
          )}

          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{crew._count.members}명</span>
            </div>
            <Badge variant={crew.isPublic ? "default" : "secondary"}>
              {crew.isPublic ? "공개" : "비공개"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
