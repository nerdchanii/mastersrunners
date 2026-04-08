import type { Meta, StoryObj } from "@storybook/react-vite";

import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { storybookMedia, storybookUser } from "@/storybook/storybook-fixtures";

const meta = {
  title: "Surfaces/Profile/ProfileHeader",
  component: ProfileHeader,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof ProfileHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OwnProfile: Story = {
  args: {
    user: {
      ...storybookUser,
      profileImage: storybookMedia.feedCover,
    },
    stats: {
      postCount: 42,
      followerCount: 318,
      followingCount: 167,
      workoutCount: 121,
      crewCount: 4,
    },
    isOwnProfile: true,
  },
};

export const FollowingRunner: Story = {
  args: {
    user: {
      ...storybookUser,
      id: "runner-3",
      name: "박지구력",
      profileImage: storybookMedia.crewBadge,
      bio: "주말마다 서울숲과 중랑천을 오가며 하프를 준비합니다.",
    },
    stats: {
      postCount: 17,
      followerCount: 128,
      followingCount: 84,
      workoutCount: 88,
    },
    isOwnProfile: false,
    isFollowing: true,
    onFollowToggle: () => undefined,
    onMessageClick: () => undefined,
  },
};

export const PrivateRunner: Story = {
  args: {
    user: {
      ...storybookUser,
      id: "runner-4",
      name: "최조용",
      profileImage: null,
      bio: "기록보다 꾸준함을 더 중요하게 생각합니다.",
    },
    stats: {
      postCount: 9,
      followerCount: 52,
      followingCount: 40,
      workoutCount: 64,
    },
    isOwnProfile: false,
    isPrivate: true,
    onFollowToggle: () => undefined,
  },
};
