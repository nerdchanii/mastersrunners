import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "@storybook/test";
import { LogOut, MoreHorizontal, Settings, Share2, UserPlus } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { AuthGateDialog } from "@/components/common/AuthGateDialog";
import {
  crewActivityCreatePath,
  crewBoardCreatePath,
  crewBoardPostPath,
  crewHubPath,
  type CrewHubTab,
  resolveCrewHubRoute,
} from "@/components/crew/crew-hub-routes";
import CrewActivityList from "@/components/crew/CrewActivityList";
import CrewAttendanceStats from "@/components/crew/CrewAttendanceStats";
import CrewBoardList, { BoardPostComposer } from "@/components/crew/CrewBoardList";
import CrewHubQuickActions, { CrewHubInlineActions } from "@/components/crew/CrewHubQuickActions";
import CrewIdentityHero from "@/components/crew/CrewIdentityHero";
import CrewMemberList from "@/components/crew/CrewMemberList";
import PendingMemberList from "@/components/crew/PendingMemberList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconButton } from "@/components/ui/icon-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  storybookCrew,
  storybookCrewAttendanceStats,
  storybookCrewBoards,
  storybookCrewMembers,
  storybookMedia,
  storybookPendingCrewMembers,
  storybookUser,
} from "@/storybook/storybook-fixtures";

type HubRole = "guest" | "member" | "owner";

const crewAttendanceStats = {
  ...storybookCrewAttendanceStats,
  activities: [...storybookCrewAttendanceStats.activities],
  members: [...storybookCrewAttendanceStats.members],
};

const pendingMembers = [...storybookPendingCrewMembers];
const crewMembers = [...storybookCrewMembers];

const memberHubMembers = [
  {
    ...storybookCrewMembers[0],
    id: "member-owner",
    userId: "user-owner",
    user: {
      id: "user-owner",
      name: "김크루장",
      profileImage: null,
    },
  },
  {
    ...storybookCrewMembers[1],
    id: "member-viewer",
    userId: storybookUser.id,
    user: {
      id: storybookUser.id,
      name: storybookUser.name,
      profileImage: storybookUser.profileImage,
    },
  },
  {
    ...storybookCrewMembers[2],
  },
];

function SecondaryMemberMenu() {
  return (
    <div className="rounded-full border border-background/35 bg-background/55 p-1 shadow-xs backdrop-blur-sm">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton variant="ghost" aria-label="크루 멤버 메뉴">
            <MoreHorizontal className="size-4" />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem variant="destructive">
            <LogOut className="size-4" />
            크루 탈퇴
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function CrewHubPageStory({ role }: { role: HubRole }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authDialogTitle, setAuthDialogTitle] = useState("크루 참여");

  const isGuest = role === "guest";
  const isMember = role === "member" || role === "owner";
  const isOwner = role === "owner";
  const isOwnerOrAdmin = isOwner;
  const currentUserRole = isOwner ? "OWNER" : role === "member" ? "MEMBER" : null;
  const currentUserId = isGuest ? undefined : storybookUser.id;
  const members = role === "member" ? memberHubMembers : crewMembers;
  const nextPath = `/crews/${storybookCrew.id}`;
  const routeState = resolveCrewHubRoute(location.pathname, storybookCrew.id, isOwnerOrAdmin);
  const activeTab = routeState.activeTab;

  const openAuthGate = (title: string) => {
    setAuthDialogTitle(title);
    setShowAuthDialog(true);
  };

  const openBoardComposer = () => {
    navigate(crewBoardCreatePath(storybookCrew.id));
  };

  const openActivityComposer = () => {
    navigate(crewActivityCreatePath(storybookCrew.id));
  };

  return (
    <div className="mx-auto max-w-6xl space-y-10 bg-background pb-20">
      <CrewIdentityHero
        name={storybookCrew.name}
        description={storybookCrew.description}
        creatorName="김러너"
        createdAt="2026-03-01T08:00:00.000Z"
        memberCount={storybookCrew.memberCount}
        maxMembers={40}
        isPublic
        profileImageUrl={storybookMedia.crewBadge}
        coverImageUrl={storybookMedia.feedCover}
        crewId={storybookCrew.id}
        members={members}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        onMembersUpdate={() => undefined}
        chatHref={`/messages/crew/${storybookCrew.id}`}
        topActions={role === "member" ? <SecondaryMemberMenu /> : undefined}
        actions={
          <div className="flex items-center gap-3">
            {!isMember && (
              <Button
                size="lg"
                className="rounded-full shadow-lg"
                onClick={() => openAuthGate("크루 참여")}
              >
                <UserPlus className="mr-2 size-4" />
                크루 가입
              </Button>
            )}

            {isMember && (
              <IconButton
                variant="outline"
                size="icon-lg"
                className="rounded-full"
                aria-label="초대 링크 공유"
              >
                <Share2 className="size-4" />
              </IconButton>
            )}

            {isOwnerOrAdmin && (
              <IconButton
                variant="outline"
                size="icon-lg"
                className="rounded-full"
                aria-label="크루 설정"
              >
                <Settings className="size-4" />
              </IconButton>
            )}
          </div>
        }
      />

      <div className="px-0 lg:px-6">
        <section>
          <Tabs
            value={activeTab}
            onValueChange={(tab) => navigate(crewHubPath(storybookCrew.id, tab as CrewHubTab))}
            className="w-full"
          >
            <div className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-md">
              <div className="flex items-center justify-between gap-3">
                <TabsList
                  variant="line"
                  className="h-12 min-w-0 flex-1 justify-start gap-0 rounded-none border-0 px-0"
                >
                  <TabsTrigger
                    value="activities"
                    className="h-full flex-none rounded-none px-2 text-base font-semibold text-foreground/55 data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none after:bottom-0 after:h-[3px] after:rounded-full after:bg-foreground"
                  >
                    활동
                  </TabsTrigger>
                  <TabsTrigger
                    value="board"
                    className="h-full flex-none rounded-none px-2 text-base font-semibold text-foreground/55 data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none after:bottom-0 after:h-[3px] after:rounded-full after:bg-foreground"
                  >
                    게시판
                  </TabsTrigger>
                  <TabsTrigger
                    value="members"
                    className="h-full flex-none rounded-none px-2 text-base font-semibold text-foreground/55 data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none after:bottom-0 after:h-[3px] after:rounded-full after:bg-foreground"
                  >
                    멤버
                  </TabsTrigger>
                  {isOwnerOrAdmin && (
                    <>
                      <TabsTrigger
                        value="manage"
                        className="h-full flex-none rounded-none px-2 text-base font-semibold text-foreground/55 data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none after:bottom-0 after:h-[3px] after:rounded-full after:bg-foreground"
                      >
                        관리
                      </TabsTrigger>
                      <TabsTrigger
                        value="pending"
                        className="h-full flex-none rounded-none px-2 text-base font-semibold text-foreground/55 data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none after:bottom-0 after:h-[3px] after:rounded-full after:bg-foreground"
                      >
                        가입대기
                      </TabsTrigger>
                    </>
                  )}
                </TabsList>
                <CrewHubInlineActions
                  canWritePost={isMember}
                  canCreateActivity={isOwnerOrAdmin}
                  onWritePost={openBoardComposer}
                  onCreateActivity={openActivityComposer}
                />
              </div>
            </div>

            <div className="pb-8 pt-0 sm:pb-10">
              <TabsContent
                value="activities"
                className="mt-0 px-4 focus-visible:outline-none lg:px-0"
              >
                <CrewActivityList
                  crewId={storybookCrew.id}
                  isAdmin={isOwnerOrAdmin}
                  isAuthenticated={!isGuest}
                  isMember={isMember}
                  isActive={activeTab === "activities"}
                  canOpenActivityDetails={isMember}
                  defaultShowForm={routeState.isActivityCreateRoute}
                  showInlineCreateAction={false}
                  showEmptyCreateAction
                  onRequireAuth={() => openAuthGate("활동 자세히 보기")}
                />
              </TabsContent>

              <TabsContent value="board" className="mt-0 px-4 focus-visible:outline-none lg:px-0">
                {routeState.isBoardCreateRoute ? (
                  <BoardPostComposer
                    crewId={storybookCrew.id}
                    board={storybookCrewBoards.find((board) => board.type === "FREE")!}
                    announcementBoard={
                      storybookCrewBoards.find((board) => board.type === "ANNOUNCEMENT") ?? null
                    }
                    isAdmin={isOwnerOrAdmin}
                    onCancel={() => navigate(crewHubPath(storybookCrew.id, "board"))}
                    onCreated={() => navigate(crewHubPath(storybookCrew.id, "board"))}
                  />
                ) : (
                  <CrewBoardList
                    crewId={storybookCrew.id}
                    canOpenBoardPosts={isMember}
                    isAuthenticated={!isGuest}
                    isMember={isMember}
                    isAdmin={isOwnerOrAdmin}
                    isActive={activeTab === "board"}
                    routedBoardId={routeState.routedBoardId}
                    routedPostId={routeState.routedPostId}
                    composerDefaultBoardType="FREE"
                    allowedBoardTypes={["ANNOUNCEMENT", "GENERAL", "FREE"]}
                    onCloseRoutedPost={() => navigate(crewHubPath(storybookCrew.id, "board"))}
                    onSelectRoutedPost={(board, postId) =>
                      navigate(crewBoardPostPath(storybookCrew.id, board.id, postId))
                    }
                    hideBoardHeader
                    showInlineCreateAction={false}
                    onRequireAuth={() => openAuthGate("게시판 열기")}
                  />
                )}
              </TabsContent>

              {isOwnerOrAdmin && (
                <TabsContent
                  value="manage"
                  className="mt-0 px-4 focus-visible:outline-none lg:px-0"
                >
                  <div className="space-y-10">
                    <section className="space-y-6 pt-4 sm:pt-5">
                      <div>
                        <h2 className="text-xl font-bold tracking-tight">운영 현황</h2>
                      </div>
                      <CrewAttendanceStats
                        crewId={storybookCrew.id}
                        initialData={crewAttendanceStats}
                      />
                    </section>
                  </div>
                </TabsContent>
              )}
              {isOwnerOrAdmin && (
                <TabsContent
                  value="pending"
                  className="mt-0 px-4 focus-visible:outline-none lg:px-0"
                >
                  <section className="space-y-4 border-t border-border/40 pt-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold tracking-tight">가입대기</h2>
                      <Badge variant="secondary" className="rounded-full px-2.5 font-bold">
                        {storybookPendingCrewMembers.length}
                      </Badge>
                    </div>
                    <PendingMemberList
                      crewId={storybookCrew.id}
                      onUpdate={() => undefined}
                      initialPendingMembers={pendingMembers}
                    />
                  </section>
                </TabsContent>
              )}
              <TabsContent value="members" className="mt-0 px-4 focus-visible:outline-none lg:px-0">
                <div className="border-t border-border/40 pt-4">
                  <CrewMemberList
                    crewId={storybookCrew.id}
                    members={members}
                    currentUserId={currentUserId}
                    currentUserRole={currentUserRole}
                    onUpdate={() => undefined}
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </section>
      </div>

      <AuthGateDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        nextPath={nextPath}
        title={authDialogTitle}
      />

      <CrewHubQuickActions
        dismissKey={activeTab}
        canWritePost={isMember}
        canCreateActivity={isOwnerOrAdmin}
        onWritePost={openBoardComposer}
        onCreateActivity={openActivityComposer}
      />
    </div>
  );
}

const meta = {
  title: "Surfaces/Crew/CrewHubPage",
  component: CrewHubPageStory,
  parameters: {
    layout: "fullscreen",
    storybook: {
      route: `/crews/${storybookCrew.id}`,
    },
  },
} satisfies Meta<typeof CrewHubPageStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GuestExplorer: Story = {
  args: {
    role: "guest",
  },
  globals: {
    authMode: "guest",
  },
};

export const MemberHub: Story = {
  args: {
    role: "member",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "글쓰기" }));
    await expect(canvas.getByPlaceholderText("제목")).toBeInTheDocument();
    await expect(canvas.queryByRole("checkbox", { name: "공지" })).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole("tab", { name: "멤버" }));
    await waitFor(() => expect(canvas.queryByPlaceholderText("제목")).not.toBeInTheDocument());

    await userEvent.click(canvas.getByRole("tab", { name: "게시판" }));
    await waitFor(() => expect(canvas.queryByPlaceholderText("제목")).not.toBeInTheDocument());
  },
};

export const OwnerHub: Story = {
  args: {
    role: "owner",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("button", { name: "글쓰기" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "활동 만들기" })).toBeVisible();
    await expect(canvas.queryByRole("tab", { name: "공지" })).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole("tab", { name: "게시판" }));
    await expect(canvas.getAllByText("공지")[0]).toBeVisible();
    await expect(canvas.getByText("이번 주말 롱런 페이스 제안")).toBeVisible();
    await expect(canvas.getByText("토요일 잠실 집결 같이 가실 분")).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "글쓰기" }));
    await expect(canvas.getByRole("checkbox", { name: "공지" })).toBeVisible();

    await userEvent.click(canvas.getByRole("tab", { name: "관리" }));
    await expect(canvas.queryByText("태그 관리")).not.toBeInTheDocument();
  },
};
