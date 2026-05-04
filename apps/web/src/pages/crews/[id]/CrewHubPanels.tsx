import { CalendarDays, MapPin } from "lucide-react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";

import { useCrewHubContext } from "@/components/crew/crew-hub-context";
import {
  crewActivityCreatePath,
  crewBoardPostPath,
  crewHubPath,
} from "@/components/crew/crew-hub-routes";
import CrewActivityForm from "@/components/crew/CrewActivityForm";
import CrewActivityList from "@/components/crew/CrewActivityList";
import CrewAttendanceStats from "@/components/crew/CrewAttendanceStats";
import CrewBoardList, { BoardPostComposer } from "@/components/crew/CrewBoardList";
import CrewMemberList from "@/components/crew/CrewMemberList";
import PendingMemberList from "@/components/crew/PendingMemberList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBoards } from "@/hooks/useCrewBoards";
import { useCrewProfile } from "@/hooks/useCrewPosts";

const panelClassName = "mt-0 px-4 focus-visible:outline-none lg:px-0";
const activityPanelClassName = "mt-0 px-4 pt-4 focus-visible:outline-none sm:pt-5 lg:px-0";

function formatHomeActivityDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function CrewHomePanel() {
  const { crew, crewId, homeHero } = useCrewHubContext();
  const { data, isError, isLoading } = useCrewProfile(crewId);
  const upcomingActivities = data?.upcomingActivities.slice(0, 2) ?? [];

  return (
    <div className="mt-0 focus-visible:outline-none">
      {homeHero}

      <section className="space-y-3 px-5 py-5 sm:px-10 lg:px-10">
        <h2 className="text-lg font-bold tracking-tight text-foreground">크루 소개</h2>
        <p className="max-w-3xl whitespace-pre-wrap text-[15px] leading-relaxed text-muted-foreground/90 sm:text-base">
          {crew.description ?? "소개가 없습니다."}
        </p>
      </section>

      <section className="space-y-4 px-5 pb-6 pt-2 sm:px-10 sm:pb-8 lg:px-10">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold tracking-tight text-foreground">예정 활동</h2>
          <Button asChild variant="ghost" size="sm" className="px-2">
            <Link to={crewHubPath(crewId, "activities")}>전체 보기</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : isError ? (
          <div className="border-t border-border/50 py-6 text-sm text-muted-foreground">
            예정 활동을 불러오지 못했습니다.
          </div>
        ) : upcomingActivities.length === 0 ? (
          <div className="border-t border-border/50 py-6 text-sm text-muted-foreground">
            예정된 활동이 없습니다.
          </div>
        ) : (
          <div className="divide-y divide-border/50 border-y border-border/50">
            {upcomingActivities.map((activity) => (
              <Link
                key={activity.id}
                to={crewHubPath(crewId, "activities")}
                className="block py-4 transition-colors hover:bg-muted/30"
              >
                <div className="space-y-2">
                  <p className="text-base font-semibold text-foreground">{activity.title}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-4" />
                      {formatHomeActivityDate(activity.activityDate)}
                    </span>
                    {activity.location ? (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="size-4" />
                        {activity.location}
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export function CrewActivitiesPanel() {
  const navigate = useNavigate();
  const { crewId, isAuthenticated, isMember, isOwnerOrAdmin, openAuthGate } = useCrewHubContext();

  return (
    <div className={activityPanelClassName}>
      <CrewActivityList
        canOpenActivityDetails={isMember}
        crewId={crewId}
        isAdmin={isOwnerOrAdmin}
        isMember={isMember}
        isAuthenticated={isAuthenticated}
        showInlineCreateAction={false}
        showEmptyCreateAction
        onCreateActivity={() => navigate(crewActivityCreatePath(crewId))}
        onRequireAuth={() => openAuthGate("활동 자세히 보기")}
      />
    </div>
  );
}

export function CrewActivityCreatePanel() {
  const navigate = useNavigate();
  const { crewId, isMember, isOwnerOrAdmin } = useCrewHubContext();
  const canCreateActivity = isMember || isOwnerOrAdmin;

  if (!canCreateActivity) {
    return <Navigate to={crewHubPath(crewId, "activities")} replace />;
  }

  return (
    <div className={panelClassName}>
      <section className="space-y-4 border-t border-border/50 pt-4">
        <h3 className="text-base font-semibold">새 활동 만들기</h3>
        <CrewActivityForm
          crewId={crewId}
          onSuccess={() => navigate(crewHubPath(crewId, "activities"))}
          onCancel={() => navigate(crewHubPath(crewId, "activities"))}
        />
      </section>
    </div>
  );
}

export function CrewBoardPanel() {
  const navigate = useNavigate();
  const params = useParams();
  const { crewId, isAuthenticated, isMember, isOwnerOrAdmin, openAuthGate } = useCrewHubContext();

  return (
    <div className={panelClassName}>
      <CrewBoardList
        canOpenBoardPosts={isMember}
        crewId={crewId}
        isAuthenticated={isAuthenticated}
        isMember={isMember}
        isAdmin={isOwnerOrAdmin}
        routedBoardId={params.boardId}
        routedPostId={params.postId}
        composerDefaultBoardType="FREE"
        allowedBoardTypes={["ANNOUNCEMENT", "GENERAL", "FREE"]}
        onCloseRoutedPost={() => navigate(crewHubPath(crewId, "board"))}
        onSelectRoutedPost={(board, postId) =>
          navigate(crewBoardPostPath(crewId, board.id, postId))
        }
        hideBoardHeader
        showInlineCreateAction={false}
        onRequireAuth={() => openAuthGate("게시판 열기")}
      />
    </div>
  );
}

export function CrewBoardCreatePanel() {
  const navigate = useNavigate();
  const { crewId, isMember, isOwnerOrAdmin } = useCrewHubContext();
  const canWritePost = isMember || isOwnerOrAdmin;
  const { data: boards, isLoading } = useBoards(crewId);
  const visibleBoards = boards?.filter((board) =>
    ["ANNOUNCEMENT", "GENERAL", "FREE"].includes(board.type),
  );
  const announcementBoard = visibleBoards?.find((board) => board.type === "ANNOUNCEMENT") ?? null;
  const defaultComposerBoard =
    visibleBoards?.find((board) => board.type === "FREE") ?? visibleBoards?.[0];

  if (!canWritePost) {
    return <Navigate to={crewHubPath(crewId, "board")} replace />;
  }

  if (isLoading) {
    return (
      <div className={panelClassName}>
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  if (!defaultComposerBoard) {
    return (
      <div className={panelClassName}>
        <div className="border-t border-border/50 py-8 text-center text-muted-foreground">
          글을 작성할 수 있는 게시판이 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className={panelClassName}>
      <BoardPostComposer
        crewId={crewId}
        board={defaultComposerBoard}
        announcementBoard={announcementBoard}
        isAdmin={isOwnerOrAdmin}
        onCancel={() => navigate(crewHubPath(crewId, "board"))}
        onCreated={() => navigate(crewHubPath(crewId, "board"))}
      />
    </div>
  );
}

export function CrewMembersPanel() {
  const { activeMembers, crewId, currentUserId, currentUserRole, onMembersUpdate } =
    useCrewHubContext();

  return (
    <div className={panelClassName}>
      <div className="border-t border-border/40 pt-4">
        <CrewMemberList
          crewId={crewId}
          members={activeMembers}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          onUpdate={onMembersUpdate}
        />
      </div>
    </div>
  );
}

export function CrewManagePanel() {
  const { crew, crewId, isOwnerOrAdmin } = useCrewHubContext();

  if (!isOwnerOrAdmin) {
    return <Navigate to={crewHubPath(crewId, "home")} replace />;
  }

  return (
    <div className={panelClassName}>
      <section className="space-y-6 pt-4 sm:pt-5">
        <CrewAttendanceStats crewId={crewId} crewName={crew.name} />
      </section>
    </div>
  );
}

export function CrewPendingMembersPanel() {
  const { crew, crewId, isOwnerOrAdmin, onMembersUpdate } = useCrewHubContext();

  if (!isOwnerOrAdmin) {
    return <Navigate to={crewHubPath(crewId, "home")} replace />;
  }

  return (
    <div className={panelClassName}>
      <section className="space-y-4 border-t border-border/40 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-foreground">가입대기</h2>
          <Badge variant="secondary" className="rounded-full px-2.5 font-bold">
            {crew.members.filter((member) => member.status === "PENDING").length}
          </Badge>
        </div>
        <PendingMemberList crewId={crewId} onUpdate={onMembersUpdate} />
      </section>
    </div>
  );
}
