import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "@storybook/test";
import { LogOut, MoreHorizontal, Settings, Share2, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";

import { AuthGateDialog } from "@/components/common/AuthGateDialog";
import CrewActivityList from "@/components/crew/CrewActivityList";
import CrewAttendanceStats from "@/components/crew/CrewAttendanceStats";
import CrewBoardList from "@/components/crew/CrewBoardList";
import CrewHubQuickActions, { CrewHubInlineActions } from "@/components/crew/CrewHubQuickActions";
import CrewIdentityHero from "@/components/crew/CrewIdentityHero";
import CrewMemberList from "@/components/crew/CrewMemberList";
import CrewTagManager from "@/components/crew/CrewTagManager";
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
  storybookCrewMembers,
  storybookCrewTags,
  storybookMedia,
  storybookPendingCrewMembers,
  storybookUser,
} from "@/storybook/storybook-fixtures";

type HubRole = "guest" | "member" | "owner";

const crewAttendanceStats = {
  ...storybookCrewAttendanceStats,
  activities: [...storybookCrewAttendanceStats.activities],
  memberStats: [...storybookCrewAttendanceStats.memberStats],
};

const crewTags = storybookCrewTags.map((tag) => ({
  ...tag,
  members: [...tag.members],
}));

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
  const defaultTab = isGuest ? "activities" : "announcement";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [boardComposerNonce, setBoardComposerNonce] = useState(0);
  const [activityComposerNonce, setActivityComposerNonce] = useState(0);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const openAuthGate = (title: string) => {
    setAuthDialogTitle(title);
    setShowAuthDialog(true);
  };

  const openBoardComposer = () => {
    if (activeTab === "announcement" && isOwnerOrAdmin) {
      setBoardComposerNonce((value) => value + 1);
      return;
    }
    setActiveTab("board");
    setBoardComposerNonce((value) => value + 1);
  };

  const openActivityComposer = () => {
    setActiveTab("activities");
    setActivityComposerNonce((value) => value + 1);
  };

  const handleBoardComposerHandled = () => {
    setBoardComposerNonce(0);
  };

  const handleActivityComposerHandled = () => {
    setActivityComposerNonce(0);
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-md">
              <div className="flex items-center justify-between gap-3">
                <TabsList
                  variant="line"
                  className="h-12 min-w-0 flex-1 justify-start gap-0 rounded-none border-0 px-0"
                >
                  {!isGuest && (
                    <TabsTrigger
                      value="announcement"
                      className="h-full flex-none rounded-none px-2 text-base font-semibold text-foreground/55 data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none after:bottom-0 after:h-[3px] after:rounded-full after:bg-foreground"
                    >
                      공지
                    </TabsTrigger>
                  )}
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
                    <TabsTrigger
                      value="manage"
                      className="h-full flex-none rounded-none px-2 text-base font-semibold text-foreground/55 data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none after:bottom-0 after:h-[3px] after:rounded-full after:bg-foreground"
                    >
                      관리
                    </TabsTrigger>
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
              {!isGuest && (
                <TabsContent
                  value="announcement"
                  className="mt-0 px-4 focus-visible:outline-none lg:px-0"
                >
                  <CrewBoardList
                    crewId={storybookCrew.id}
                    canOpenBoardPosts={isMember}
                    isAuthenticated={!isGuest}
                    isMember={isMember}
                    isAdmin={isOwnerOrAdmin}
                    isActive={activeTab === "announcement"}
                    defaultSelectedBoardType="ANNOUNCEMENT"
                    allowedBoardTypes={["ANNOUNCEMENT"]}
                    composerNonce={boardComposerNonce}
                    onComposerHandled={handleBoardComposerHandled}
                    hideBoardHeader
                    showInlineCreateAction={false}
                    onRequireAuth={() => openAuthGate("공지 열기")}
                  />
                </TabsContent>
              )}

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
                  composerNonce={activityComposerNonce}
                  onComposerHandled={handleActivityComposerHandled}
                  showInlineCreateAction={false}
                  onRequireAuth={() => openAuthGate("활동 자세히 보기")}
                />
              </TabsContent>

              <TabsContent value="board" className="mt-0 px-4 focus-visible:outline-none lg:px-0">
                <CrewBoardList
                  crewId={storybookCrew.id}
                  canOpenBoardPosts={isMember}
                  isAuthenticated={!isGuest}
                  isMember={isMember}
                  isAdmin={isOwnerOrAdmin}
                  isActive={activeTab === "board"}
                  defaultSelectedBoardType="FREE"
                  allowedBoardTypes={["GENERAL", "FREE"]}
                  composerNonce={boardComposerNonce}
                  onComposerHandled={handleBoardComposerHandled}
                  hideBoardHeader
                  showInlineCreateAction={false}
                  onRequireAuth={() => openAuthGate("게시판 열기")}
                />
              </TabsContent>

              {isOwnerOrAdmin && (
                <TabsContent
                  value="manage"
                  className="mt-0 px-4 focus-visible:outline-none lg:px-0"
                >
                  <div className="space-y-10">
                    <section className="space-y-6">
                      <div>
                        <h2 className="text-xl font-bold tracking-tight">운영 현황</h2>
                      </div>
                      <div className="rounded-3xl border bg-muted/10 p-6">
                        <CrewAttendanceStats
                          crewId={storybookCrew.id}
                          initialData={crewAttendanceStats}
                        />
                      </div>
                    </section>

                    <section className="space-y-4">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        태그 관리
                      </h3>
                      <CrewTagManager
                        crewId={storybookCrew.id}
                        isAdmin={isOwnerOrAdmin}
                        members={members}
                        initialTags={crewTags}
                      />
                    </section>

                    <section className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                          가입 대기
                        </h3>
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
                  </div>
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
    await expect(canvas.getByText("이번 주말 롱런 페이스 제안")).toBeVisible();

    await userEvent.click(canvas.getByRole("tab", { name: "게시판" }));
    await waitFor(() =>
      expect(canvas.queryByText("이번 주말 롱런 페이스 제안")).not.toBeInTheDocument(),
    );
    await expect(canvas.getByText("토요일 잠실 집결 같이 가실 분")).toBeVisible();
  },
};
