import { Lock, MessageCircle, Users } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { TimeAgo } from "@/components/common/TimeAgo";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";
import { IconButton } from "@/components/ui/icon-button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import CrewMemberList from "./CrewMemberList";

interface CrewMemberSummary {
  id: string;
  userId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  status: "ACTIVE" | "PENDING" | "LEFT";
  joinedAt: string;
  user: {
    id: string;
    name: string;
    profileImage: string | null;
  };
}

interface CrewIdentityHeroProps {
  className?: string;
  eyebrow?: string;
  crewId?: string;
  name: string;
  description?: string | null;
  creatorName: string;
  createdAt: string;
  memberCount: number;
  maxMembers?: number | null;
  isPublic: boolean;
  profileImageUrl?: string | null;
  coverImageUrl?: string | null;
  members?: CrewMemberSummary[];
  currentUserId?: string;
  currentUserRole?: "OWNER" | "ADMIN" | "MEMBER" | null;
  onMembersUpdate?: () => void;
  chatHref: string;
  topActions?: ReactNode;
  actions?: ReactNode;
}

export default function CrewIdentityHero({
  className,
  crewId,
  name,
  description,
  createdAt,
  memberCount,
  maxMembers,
  isPublic,
  profileImageUrl,
  coverImageUrl,
  members,
  currentUserId,
  currentUserRole,
  onMembersUpdate,
  chatHref,
  topActions,
  actions,
}: CrewIdentityHeroProps) {
  const [isMemberSheetOpen, setIsMemberSheetOpen] = useState(false);
  const memberLabel = maxMembers ? `${memberCount}명 / ${maxMembers}명` : `${memberCount}명`;
  const activeMembers = members?.filter((member) => member.status === "ACTIVE") ?? [];
  const visibleMembers = activeMembers.slice(0, 4);
  const hasMemberSummary = !!crewId && activeMembers.length > 0;

  return (
    <section className={cn("relative", className)}>
      <div className="relative">
        <div className="relative z-10">
          <div className="relative h-48 overflow-hidden bg-muted/20 sm:h-64 sm:rounded-3xl">
            {coverImageUrl ? (
              <img
                src={coverImageUrl}
                alt={`${name} 커버 이미지`}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-muted/5" />
            )}

            <div className="absolute right-4 top-4 z-30 flex items-center gap-2">{topActions}</div>
          </div>

          <div className="relative z-20 -mt-10 flex items-end justify-between px-4 sm:-mt-16 sm:px-10">
            <div className="flex size-24 items-center justify-center overflow-hidden rounded-[2.2rem] border-4 border-background bg-background shadow-xl transition-transform hover:scale-105 sm:size-36 sm:rounded-[3rem] sm:border-8">
              <div className="size-full overflow-hidden rounded-[1.6rem] sm:rounded-[2.2rem]">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt={`${name} 썸네일`}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-primary/5 text-primary">
                    <Users className="size-10 sm:size-14" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pb-1 sm:gap-3 sm:pb-3">
              {actions}
              <IconButton asChild variant="outline" aria-label="크루 채팅 열기">
                <Link to={chatHref}>
                  <MessageCircle className="size-4" />
                </Link>
              </IconButton>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-4 px-5 pt-6 pb-4 sm:px-10 sm:pt-8 sm:pb-8">
          <div className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
                {name}
              </h1>
              {!isPublic && (
                <div className="flex items-center gap-1 rounded-full bg-muted/50 px-2.5 py-1 text-muted-foreground">
                  <Lock className="size-3" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Private</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-muted-foreground">
              <TimeAgo date={createdAt} />
              {hasMemberSummary ? (
                <Sheet open={isMemberSheetOpen} onOpenChange={setIsMemberSheetOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <AvatarGroup className="items-center">
                        {visibleMembers.map((member) => (
                          <Avatar key={member.id} className="size-6">
                            {member.user.profileImage && (
                              <AvatarImage src={member.user.profileImage} alt={member.user.name} />
                            )}
                            <AvatarFallback className="text-[10px]">
                              {member.user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {activeMembers.length > visibleMembers.length ? (
                          <AvatarGroupCount className="size-6 text-[10px]">
                            +{activeMembers.length - visibleMembers.length}
                          </AvatarGroupCount>
                        ) : null}
                      </AvatarGroup>
                      <span className="font-medium">{memberLabel}</span>
                    </button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="max-h-[85vh] rounded-t-3xl">
                    <SheetHeader>
                      <SheetTitle>{name} 멤버</SheetTitle>
                    </SheetHeader>
                    <div className="max-h-[70vh] overflow-y-auto px-4 pb-4">
                      {crewId && (
                        <CrewMemberList
                          crewId={crewId}
                          members={members ?? []}
                          currentUserId={currentUserId}
                          currentUserRole={currentUserRole}
                          onUpdate={onMembersUpdate ?? (() => {})}
                        />
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Users className="size-4" />
                  {memberLabel}
                </span>
              )}
            </div>

            {description ? (
              <p className="max-w-3xl whitespace-pre-wrap text-[15px] leading-relaxed text-muted-foreground/90 sm:text-base">
                {description}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
