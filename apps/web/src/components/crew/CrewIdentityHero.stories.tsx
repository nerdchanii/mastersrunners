import type { Meta, StoryObj } from "@storybook/react-vite";
import { MoreHorizontal, Settings, Share2, UserPlus } from "lucide-react";
import { useState } from "react";

import { AuthGateDialog } from "@/components/common/AuthGateDialog";
import CrewIdentityHero from "@/components/crew/CrewIdentityHero";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { storybookCrew, storybookMedia } from "@/storybook/storybook-fixtures";

function GuestJoinActions() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton
        onClick={() => setOpen(true)}
        aria-label="크루 가입"
      >
        <UserPlus className="size-4" />
      </IconButton>
      <AuthGateDialog
        open={open}
        onOpenChange={setOpen}
        nextPath="/crews/storybook-crew?invite=1"
        title="크루 참여"
        description="로그인이나 회원가입 후 지금 보고 있는 크루로 바로 돌아올 수 있습니다."
      />
    </>
  );
}

function MemberActions() {
  return (
    <IconButton variant="outline" aria-label="크루 페이지 공유">
      <Share2 className="size-4" />
    </IconButton>
  );
}

function MemberTopActions() {
  return (
    <div className="rounded-md border border-background/35 bg-background/55 p-1 shadow-xs backdrop-blur-sm">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton variant="ghost" aria-label="크루 멤버 메뉴">
            <MoreHorizontal className="size-4" />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem variant="destructive">크루 탈퇴</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

const meta = {
  title: "Surfaces/Crew/CrewIdentityHero",
  component: CrewIdentityHero,
  parameters: {
    layout: "fullscreen",
    storybook: {
      route: "/crews/storybook-crew",
    },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-5xl bg-background">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CrewIdentityHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GuestJoin: Story = {
  args: {
    name: storybookCrew.name,
    description: "아침 러닝과 주말 롱런을 함께하는 도시형 크루",
    creatorName: "김러너",
    createdAt: "2026-03-01T08:00:00.000Z",
    memberCount: 28,
    maxMembers: 40,
    isPublic: true,
    profileImageUrl: storybookMedia.crewBadge,
    coverImageUrl: storybookMedia.feedCover,
    chatHref: "/messages/crew/storybook-crew",
  },
  render: (args) => <CrewIdentityHero {...args} actions={<GuestJoinActions />} />,
};

export const MemberView: Story = {
  args: {
    name: storybookCrew.name,
    description: "아침 러닝과 주말 롱런을 함께하는 도시형 크루",
    creatorName: "김러너",
    createdAt: "2026-03-01T08:00:00.000Z",
    memberCount: 28,
    maxMembers: 40,
    isPublic: true,
    profileImageUrl: storybookMedia.crewBadge,
    coverImageUrl: storybookMedia.feedCover,
    chatHref: "/messages/crew/storybook-crew",
  },
  render: (args) => (
    <CrewIdentityHero {...args} topActions={<MemberTopActions />} actions={<MemberActions />} />
  ),
};

export const OwnerAdminManage: Story = {
  args: {
    name: storybookCrew.name,
    description: "아침 러닝과 주말 롱런을 함께하는 도시형 크루",
    creatorName: "김러너",
    createdAt: "2026-03-01T08:00:00.000Z",
    memberCount: 28,
    maxMembers: 40,
    isPublic: true,
    profileImageUrl: storybookMedia.crewBadge,
    coverImageUrl: storybookMedia.feedCover,
    chatHref: "/messages/crew/storybook-crew",
    actions: (
      <>
        <IconButton variant="outline" aria-label="크루 페이지 공유">
          <Share2 className="size-4" />
        </IconButton>
        <IconButton variant="outline" aria-label="설정">
          <Settings className="size-4" />
        </IconButton>
      </>
    ),
  },
};

export const PrivatePending: Story = {
  args: {
    name: "하프 준비반",
    description: "레이스 전까지 주 4회 루틴을 맞추는 소규모 훈련 그룹",
    creatorName: "이페이서",
    createdAt: "2026-03-15T08:00:00.000Z",
    memberCount: 18,
    maxMembers: 24,
    isPublic: false,
    profileImageUrl: null,
    coverImageUrl: null,
    chatHref: "/messages/crew/storybook-crew",
    actions: (
      <IconButton variant="secondary" aria-label="가입 요청 대기 중">
        <UserPlus className="size-4" />
      </IconButton>
    ),
  },
};
