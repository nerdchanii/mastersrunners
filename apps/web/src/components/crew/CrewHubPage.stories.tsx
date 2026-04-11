import type { Meta, StoryObj } from "@storybook/react-vite";
import { Lock, LogOut, MoreHorizontal, Settings, Share2, UserPlus } from "lucide-react";
import { useState } from "react";

import { AuthGateDialog } from "@/components/common/AuthGateDialog";
import CrewActivityList from "@/components/crew/CrewActivityList";
import CrewAttendanceStats from "@/components/crew/CrewAttendanceStats";
import CrewBoardList from "@/components/crew/CrewBoardList";
import CrewIdentityHero from "@/components/crew/CrewIdentityHero";
import CrewMemberList from "@/components/crew/CrewMemberList";
import CrewPostList from "@/components/crew/CrewPostList";
import CrewTagManager from "@/components/crew/CrewTagManager";
import GroupChat from "@/components/crew/GroupChat";
import PendingMemberList from "@/components/crew/PendingMemberList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  storybookCrew,
  storybookCrewAttendanceStats,
  storybookCrewChat,
  storybookCrewMembers,
  storybookCrewPosts,
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

const crewPosts = {
  ...storybookCrewPosts,
  items: storybookCrewPosts.items.map((item) => ({
    ...item,
    images: [...item.images],
  })),
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

function createCrewChatData() {
  return {
    ...storybookCrewChat,
    conversation: storybookCrewChat.conversation
      ? {
          ...storybookCrewChat.conversation,
          participants: [...storybookCrewChat.conversation.participants],
        }
      : null,
    messages: [...storybookCrewChat.messages],
  };
}

function SecondaryMemberMenu() {
  return (
    <div className="rounded-full border border-background/35 bg-background/55 p-1 shadow-xs backdrop-blur-sm">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="크루 멤버 메뉴">
            <MoreHorizontal className="size-4" />
          </Button>
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

function CrewHubPageStory({ role, inviteEntry = false }: { role: HubRole; inviteEntry?: boolean }) {
  const [activeTab, setActiveTab] = useState("activities");
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authDialogTitle, setAuthDialogTitle] = useState("크루 참여");

  const isGuest = role === "guest";
  const isMember = role === "member" || role === "owner";
  const isOwner = role === "owner";
  const isOwnerOrAdmin = isOwner;
  const currentUserRole = isOwner ? "OWNER" : role === "member" ? "MEMBER" : null;
  const currentUserId = isGuest ? undefined : storybookUser.id;
  const members = role === "member" ? memberHubMembers : crewMembers;
  const nextPath = `/crews/${storybookCrew.id}${inviteEntry ? "?invite=1" : ""}`;

  const openAuthGate = (title: string) => {
    setAuthDialogTitle(title);
    setShowAuthDialog(true);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-10 bg-background pb-20">
      {inviteEntry && isGuest && (
        <section className="mx-4 mt-6 rounded-3xl border border-primary/20 bg-primary/5 px-6 py-5 sm:mx-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <p className="text-base font-bold text-foreground">초대 링크로 들어왔어요.</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                이 크루가 마음에 드시나요? 지금 바로 가입하여 함께 달리세요.
              </p>
            </div>
            <Button
              size="lg"
              className="rounded-full shadow-md"
              onClick={() => openAuthGate("크루 참여")}
            >
              <UserPlus className="mr-2 size-4" />
              크루 가입하기
            </Button>
          </div>
        </section>
      )}

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
              <Button variant="outline" className="rounded-full">
                <Share2 className="mr-2 size-4" />
                초대 링크
              </Button>
            )}

            {isOwnerOrAdmin && (
              <Button variant="outline" className="rounded-full">
                <Settings className="mr-2 size-4" />
                설정
              </Button>
            )}
          </div>
        }
      />

      <div className="grid gap-12 px-0 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-6">
        <div className="space-y-16">
          <section>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-md">
                <TabsList className="flex h-14 w-full justify-start gap-8 rounded-none bg-transparent p-0">
                  <TabsTrigger
                    value="activities"
                    className="h-full rounded-none border-b-2 border-transparent px-2 text-base font-semibold data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
                  >
                    활동
                  </TabsTrigger>
                  <TabsTrigger
                    value="chat"
                    disabled={!isMember}
                    className="h-full rounded-none border-b-2 border-transparent px-2 text-base font-semibold data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
                  >
                    채팅
                  </TabsTrigger>
                  <TabsTrigger
                    value="board"
                    className="h-full rounded-none border-b-2 border-transparent px-2 text-base font-semibold data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
                  >
                    게시판
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="py-10">
                <TabsContent value="activities" className="mt-0 focus-visible:outline-none">
                  <div className="space-y-8">
                    <div className="flex items-center justify-between px-4 sm:px-0">
                      <h2 className="text-2xl font-bold tracking-tight">크루 활동</h2>
                    </div>
                    <CrewActivityList
                      crewId={storybookCrew.id}
                      isAdmin={isOwnerOrAdmin}
                      isAuthenticated={!isGuest}
                      isMember={isMember}
                      canOpenActivityDetails={isMember}
                      onRequireAuth={() => openAuthGate("활동 자세히 보기")}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="chat" className="mt-0 focus-visible:outline-none">
                  <div className="space-y-8">
                    <div className="flex items-center justify-between px-4 sm:px-0">
                      <h2 className="text-2xl font-bold tracking-tight">채팅</h2>
                    </div>
                    {isMember ? (
                      <GroupChat
                        crewId={storybookCrew.id}
                        data={createCrewChatData()}
                        isLoading={false}
                        title={`${storybookCrew.name} 크루 채팅`}
                        subtitle="멤버 전용"
                        emptyMessage="아직 메시지가 없습니다."
                        missingConversationMessage="크루 채팅방이 아직 준비되지 않았습니다."
                        composerPlaceholder={`${storybookCrew.name} 크루에 메시지 보내기`}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed py-20 text-muted-foreground">
                        <Lock className="mb-4 size-10 opacity-20" />
                        <p className="font-medium">멤버만 채팅에 참여할 수 있습니다.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="board" className="mt-0 focus-visible:outline-none">
                  <div className="space-y-16 px-4 sm:px-0">
                    <section className="space-y-8">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold tracking-tight">게시판</h2>
                      </div>
                      <CrewBoardList
                        crewId={storybookCrew.id}
                        canOpenBoardPosts={isMember}
                        isAuthenticated={!isGuest}
                        isMember={isMember}
                        isAdmin={isOwnerOrAdmin}
                        onRequireAuth={() => openAuthGate("게시판 열기")}
                      />
                    </section>

                    {isMember ? (
                      <section className="space-y-8 pt-8">
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-bold tracking-tight text-foreground">
                            최근 소식
                          </h2>
                        </div>
                        <CrewPostList
                          crewId={storybookCrew.id}
                          isOwner={isOwner}
                          initialData={crewPosts}
                        />
                      </section>
                    ) : null}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </section>
        </div>

        <aside className="space-y-16">
          <section className="space-y-6">
            <div className="px-4 sm:px-0">
              <h2 className="text-xl font-bold tracking-tight">멤버</h2>
            </div>
            <div className="border-t border-border/40 pt-4">
              <CrewMemberList
                crewId={storybookCrew.id}
                members={members}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
                onUpdate={() => undefined}
              />
            </div>
          </section>

          {isOwnerOrAdmin && (
            <section className="space-y-6">
              <div className="px-4 sm:px-0">
                <h2 className="text-xl font-bold tracking-tight">운영 현황</h2>
              </div>
              <div className="rounded-3xl border bg-muted/10 p-6">
                <CrewAttendanceStats
                  crewId={storybookCrew.id}
                  initialData={crewAttendanceStats}
                />
              </div>
            </section>
          )}

          {isOwnerOrAdmin && (
            <section className="space-y-8">
              <div className="px-4 sm:px-0">
                <h2 className="text-xl font-bold tracking-tight">운영 도구</h2>
              </div>
              <div className="space-y-12">
                <section className="space-y-4 px-4 sm:px-0">
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

                <section className="space-y-4 px-4 sm:px-0">
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
            </section>
          )}
        </aside>
      </div>

      <AuthGateDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        nextPath={nextPath}
        title={authDialogTitle}
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

export const GuestInviteEntry: Story = {
  args: {
    role: "guest",
    inviteEntry: true,
  },
  globals: {
    authMode: "guest",
  },
};

export const MemberHub: Story = {
  args: {
    role: "member",
  },
};

export const OwnerHub: Story = {
  args: {
    role: "owner",
  },
};
