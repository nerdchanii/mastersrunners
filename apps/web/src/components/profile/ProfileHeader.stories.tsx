import type { Meta, StoryObj } from "@storybook/react-vite";

import { ProfileHeader } from "@/components/profile/ProfileHeader";
import {
  storybookMedia,
  storybookProfileStats,
  storybookProfileTabs,
  storybookUser,
} from "@/storybook/storybook-fixtures";

const crewMentions = storybookProfileTabs.crews.map((crew) => ({
  id: crew.id,
  name: crew.name,
}));

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
    isOwnProfile: true,
    stats: storybookProfileStats,
    crews: crewMentions,
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
    isOwnProfile: false,
    isFollowing: true,
    stats: {
      postCount: 17,
      followerCount: 128,
      followingCount: 84,
      crewCount: 3,
    },
    crews: crewMentions,
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
      bio: null,
      pb5kSeconds: null,
      pb10kSeconds: null,
      pbHalfMarathonSeconds: null,
      pbMarathonSeconds: null,
    },
    isOwnProfile: false,
    isPrivate: true,
    stats: {
      postCount: 17,
      followerCount: 128,
      followingCount: 84,
      crewCount: 3,
    },
    crews: crewMentions,
    onFollowToggle: () => undefined,
  },
};

export const PendingRunner: Story = {
  args: {
    user: {
      ...storybookUser,
      id: "runner-5",
      name: "윤새벽",
      profileImage: storybookMedia.feedCover,
      bio: null,
      pb5kSeconds: null,
      pb10kSeconds: null,
      pbHalfMarathonSeconds: null,
      pbMarathonSeconds: null,
    },
    isOwnProfile: false,
    isPrivate: true,
    isPending: true,
    stats: {
      postCount: 17,
      followerCount: 128,
      followingCount: 84,
      crewCount: 3,
    },
    crews: crewMentions,
    onFollowToggle: () => undefined,
  },
};
