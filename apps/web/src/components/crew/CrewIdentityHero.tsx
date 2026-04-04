import { Lock, Users } from "lucide-react";
import type { ReactNode } from "react";

import { TimeAgo } from "@/components/common/TimeAgo";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface CrewIdentityHeroProps {
  eyebrow?: string;
  name: string;
  description?: string | null;
  creatorName: string;
  createdAt: string;
  memberCount: number;
  maxMembers?: number | null;
  isPublic: boolean;
  profileImageUrl?: string | null;
  coverImageUrl?: string | null;
  actions?: ReactNode;
}

export default function CrewIdentityHero({
  eyebrow,
  name,
  description,
  creatorName,
  createdAt,
  memberCount,
  maxMembers,
  isPublic,
  profileImageUrl,
  coverImageUrl,
  actions,
}: CrewIdentityHeroProps) {
  const memberLabel = maxMembers ? `${memberCount}명 / ${maxMembers}명` : `${memberCount}명`;

  return (
    <Card className="overflow-hidden border-border/60 shadow-sm">
      <div className="relative">
        <div className="relative h-44 overflow-hidden bg-gradient-to-br from-primary/20 via-background to-muted sm:h-56">
          {coverImageUrl ? (
            <>
              <img
                src={coverImageUrl}
                alt={`${name} 커버 이미지`}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-background" />
            </>
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_hsl(var(--primary)/0.22),_transparent_34%),radial-gradient(circle_at_bottom_left,_hsl(var(--muted)/0.55),_transparent_36%)]" />
          )}

          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background via-background/80 to-transparent" />

          <div className="absolute left-5 top-5 flex flex-wrap items-center gap-2">
            {eyebrow && (
              <Badge variant="secondary" className="backdrop-blur">
                {eyebrow}
              </Badge>
            )}
            <Badge variant={isPublic ? "default" : "secondary"} className="backdrop-blur">
              {isPublic ? "공개" : "비공개"}
            </Badge>
          </div>

          <div className="absolute -bottom-10 left-5 flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl border border-background/80 bg-background p-1.5 shadow-xl">
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt={`${name} 프로필 이미지`}
                className="h-full w-full rounded-[1rem] object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-[1rem] bg-primary/10 text-primary">
                <Users className="size-8" />
              </div>
            )}
          </div>
        </div>

        <CardContent className="space-y-6 pt-14 sm:pt-16">
          <div className="space-y-5">
            <div className="space-y-3 sm:flex sm:items-start sm:justify-between sm:gap-6">
              <div className="min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    {name}
                  </h1>
                  {!isPublic && <Lock className="size-5 text-muted-foreground" />}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="truncate">만든이 {creatorName}</span>
                  <TimeAgo date={createdAt} />
                  <span>{memberLabel}</span>
                </div>

                {description ? (
                  <p className="max-w-3xl whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                    {description}
                  </p>
                ) : null}
              </div>

              {actions && (
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">{actions}</div>
              )}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
