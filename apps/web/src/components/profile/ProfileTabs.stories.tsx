import type { Meta, StoryObj } from "@storybook/react-vite";

import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { storybookCrewPosts, storybookProfileTabs } from "@/storybook/storybook-fixtures";

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
        ? `${basePost.content} 잠실대교까지 이어서 달리며 주간 볼륨을 채웠습니다.`
        : `${basePost.content} 회복 구간과 가속 구간을 나눠서 리듬을 정리했습니다.`,
    createdAt: new Date(Date.parse(basePost.createdAt) - index * 1000 * 60 * 60 * 16).toISOString(),
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
    distance: Number((baseWorkout.distance + index * 1.1).toFixed(1)),
    duration: baseWorkout.duration + index * 360,
    createdAt: new Date(
      Date.parse(baseWorkout.createdAt) - index * 1000 * 60 * 60 * 14,
    ).toISOString(),
    date: new Date(Date.parse(baseWorkout.date) - index * 1000 * 60 * 60 * 14).toISOString(),
    memo:
      index % 2 === 0
        ? `${baseWorkout.memo} 마지막 2km는 리듬 유지에 집중했습니다.`
        : `${baseWorkout.memo} 초반엔 천천히, 후반엔 조금 더 밀어붙였습니다.`,
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
        ? `${baseCrewPost.content} 페이스별 그룹 운영과 사진 촬영 동선도 같이 안내합니다.`
        : `${baseCrewPost.content} 우천 시에는 출발 지점을 서울숲 쪽으로 조정할 예정입니다.`,
    createdAt: new Date(
      Date.parse(baseCrewPost.createdAt) - index * 1000 * 60 * 60 * 18,
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

const meta = {
  title: "Surfaces/Profile/ProfileTabs",
  component: ProfileTabs,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-4xl bg-background">
        <Story />
      </div>
    ),
  ],
  args: {
    posts: expandedPosts as never,
    workouts: expandedWorkouts as never,
    crews: crews as never,
    crewPosts: expandedCrewPosts as never,
    isLoading: false,
    activeTab: "posts",
    onTabChange: () => undefined,
  },
} satisfies Meta<typeof ProfileTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Posts: Story = {};

export const Workouts: Story = {
  args: {
    activeTab: "workouts",
  },
};

export const Crews: Story = {
  args: {
    activeTab: "crews",
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
    activeTab: "posts",
  },
};

export const PublicRunnerEmpty: Story = {
  args: {
    posts: [] as never,
    workouts: [] as never,
    crews: [] as never,
    crewPosts: [] as never,
    showWorkoutsTab: false,
    postsEmptyDescription: "공개로 보여줄 게시글이 아직 없습니다.",
    crewsEmptyDescription: "참여 중인 공개 크루가 아직 없습니다.",
  },
};

export const PublicRunnerFromHiddenWorkoutTab: Story = {
  args: {
    showWorkoutsTab: false,
    activeTab: "workouts",
  },
};
