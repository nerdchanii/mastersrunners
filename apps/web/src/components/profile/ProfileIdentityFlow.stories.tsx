import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import {
  storybookCrewPosts,
  storybookMedia,
  storybookProfileStats,
  storybookProfileTabs,
  storybookUser,
} from "@/storybook/storybook-fixtures";

type StoryPost = (typeof storybookProfileTabs.posts)[number];
type StoryWorkout = (typeof storybookProfileTabs.workouts)[number];
type StoryCrewPost = (typeof storybookCrewPosts.items)[number];

const crews = storybookProfileTabs.crews.map((crew) => ({
  id: crew.id,
  name: crew.name,
  description: crew.description,
  imageUrl: crew.imageUrl,
  _count: {
    members: crew.memberCount,
  },
}));

const expandedPosts = Array.from({ length: 7 }, (_, index) => {
  const basePost = storybookProfileTabs.posts[
    index % storybookProfileTabs.posts.length
  ] as StoryPost;
  return {
    ...basePost,
    id: `${basePost.id}-story-${index + 1}`,
    content:
      index % 2 === 0
        ? `${basePost.content} 서울숲 인터벌 후 쿨다운까지 정리했습니다. ${index + 1}회차 기록입니다.`
        : `${basePost.content} 호흡과 보폭을 점검하면서 리듬을 더 안정적으로 가져갔습니다. ${index + 1}회차 기록입니다.`,
    createdAt: new Date(Date.parse(basePost.createdAt) - index * 1000 * 60 * 60 * 18).toISOString(),
    _count: {
      likes: (basePost._count?.likes ?? 0) + index,
      comments: (basePost._count?.comments ?? 0) + (index % 3),
    },
  };
});

const expandedWorkouts = Array.from({ length: 6 }, (_, index) => {
  const baseWorkout = storybookProfileTabs.workouts[
    index % storybookProfileTabs.workouts.length
  ] as StoryWorkout;
  return {
    ...baseWorkout,
    id: `${baseWorkout.id}-story-${index + 1}`,
    distance: Number((baseWorkout.distance + index * 1.4).toFixed(1)),
    duration: baseWorkout.duration + index * 420,
    createdAt: new Date(
      Date.parse(baseWorkout.createdAt) - index * 1000 * 60 * 60 * 14,
    ).toISOString(),
    date: new Date(Date.parse(baseWorkout.date) - index * 1000 * 60 * 60 * 14).toISOString(),
    memo:
      index % 2 === 0
        ? `${baseWorkout.memo} 오르막 구간도 일정한 리듬으로 정리했습니다.`
        : `${baseWorkout.memo} 회복 구간에서 호흡을 충분히 가다듬었습니다.`,
    _count: {
      likes: (baseWorkout._count?.likes ?? 0) + index,
      comments: (baseWorkout._count?.comments ?? 0) + (index % 2),
    },
  };
});

const expandedCrewPosts = Array.from({ length: 6 }, (_, index) => {
  const baseCrewPost = storybookCrewPosts.items[
    index % storybookCrewPosts.items.length
  ] as StoryCrewPost;
  const crew = crews[index % crews.length] ?? crews[0];

  return {
    ...baseCrewPost,
    id: `${baseCrewPost.id}-story-${index + 1}`,
    crewId: crew?.id ?? baseCrewPost.crewId,
    content:
      index % 2 === 0
        ? `${baseCrewPost.content} 페이스 그룹은 5'10, 5'30, 5'50 세 그룹으로 나눌 예정입니다.`
        : `${baseCrewPost.content} 집결 이후 스트레칭과 급수 포인트 안내까지 함께 진행할게요.`,
    createdAt: new Date(
      Date.parse(baseCrewPost.createdAt) - index * 1000 * 60 * 60 * 20,
    ).toISOString(),
    _count: {
      likes: baseCrewPost._count.likes + index,
      comments: baseCrewPost._count.comments + (index % 3),
    },
    images: baseCrewPost.images.map((image, imageIndex) => ({
      ...image,
      id: `${image.id}-story-${index + 1}-${imageIndex + 1}`,
    })),
    crew: {
      id: crew?.id ?? "crew-1",
      name: crew?.name ?? "서울 새벽 러너스",
      imageUrl: crew?.imageUrl ?? null,
    },
  };
});

function ProfileIdentityFlowStory({
  isOwnProfile,
  showWorkoutsTab,
  isPrivate,
  isPending,
}: {
  isOwnProfile: boolean;
  showWorkoutsTab: boolean;
  isPrivate?: boolean;
  isPending?: boolean;
}) {
  const [activeTab, setActiveTab] = useState("posts");

  return (
    <div className="mx-auto max-w-4xl bg-background">
      <ProfileHeader
        user={{
          ...storybookUser,
          profileImage: storybookMedia.feedCover,
          bio: isOwnProfile
            ? "새벽 러닝과 장거리 LSD를 좋아하는 서울 러너"
            : "서울숲과 중랑천을 오가며 하프를 준비하는 러너입니다.",
        }}
        isOwnProfile={isOwnProfile}
        isPrivate={isPrivate}
        isPending={isPending}
        stats={
          showWorkoutsTab
            ? storybookProfileStats
            : {
                postCount: storybookProfileStats.postCount,
                followerCount: storybookProfileStats.followerCount,
                followingCount: storybookProfileStats.followingCount,
                crewCount: storybookProfileStats.crewCount,
              }
        }
        crews={crews}
        onFollowToggle={() => undefined}
        onMessageClick={isOwnProfile ? undefined : () => undefined}
        onFollowersClick={() => undefined}
        onFollowingClick={() => undefined}
      />
      <ProfileTabs
        posts={expandedPosts as never}
        workouts={expandedWorkouts as never}
        crews={crews as never}
        crewPosts={expandedCrewPosts as never}
        isLoading={false}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        showWorkoutsTab={showWorkoutsTab}
        postsEmptyDescription="공개로 보여줄 게시글이 아직 없습니다."
        crewsEmptyDescription="참여 중인 공개 크루가 아직 없습니다."
      />
    </div>
  );
}

const meta = {
  title: "Surfaces/Profile/ProfileIdentityFlow",
  component: ProfileIdentityFlowStory,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ProfileIdentityFlowStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OwnRunner: Story = {
  args: {
    isOwnProfile: true,
    showWorkoutsTab: true,
  },
};

export const PublicRunner: Story = {
  args: {
    isOwnProfile: false,
    showWorkoutsTab: false,
  },
};

export const PendingPrivateRunner: Story = {
  args: {
    isOwnProfile: false,
    showWorkoutsTab: false,
    isPrivate: true,
    isPending: true,
  },
};
