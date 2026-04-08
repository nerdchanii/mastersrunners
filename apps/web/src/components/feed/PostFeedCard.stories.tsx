import type { Meta, StoryObj } from "@storybook/react-vite";

import PostFeedCard from "@/components/feed/PostFeedCard";
import { storybookMedia, storybookUser } from "@/storybook/storybook-fixtures";

const meta = {
  title: "Surfaces/Feed/PostFeedCard",
  component: PostFeedCard,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-xl bg-background py-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PostFeedCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithGallery: Story = {
  args: {
    post: {
      id: "post-1",
      content:
        "퇴근 후 8km 템포런. 바람은 차가웠지만 마지막 2km 구간 페이스가 잘 붙어서 기분 좋게 마무리했습니다.",
      visibility: "PUBLIC",
      hashtags: ["템포런", "성수러닝", "주중훈련"],
      createdAt: "2026-04-08T10:30:00.000Z",
      user: {
        id: storybookUser.id,
        name: storybookUser.name,
        profileImage: storybookUser.profileImage,
      },
      _count: {
        likes: 18,
        comments: 4,
      },
      isLiked: true,
      images: [
        { id: "image-1", url: storybookMedia.postGalleryOne, order: 1 },
        { id: "image-2", url: storybookMedia.postGalleryTwo, order: 2 },
        { id: "image-3", url: storybookMedia.postGalleryOne, order: 3 },
      ],
      workouts: [],
    },
    onDelete: () => undefined,
  },
};

export const WithWorkoutSummary: Story = {
  args: {
    post: {
      id: "post-2",
      content: "아침 롱런 끝. 한강 바람이 좋아서 페이스보다 리듬에 집중했습니다.",
      visibility: "PUBLIC",
      hashtags: ["롱런", "한강", "주말루틴"],
      createdAt: "2026-04-07T22:00:00.000Z",
      user: {
        id: "runner-2",
        name: "이페이서",
        profileImage: null,
      },
      _count: {
        likes: 9,
        comments: 1,
      },
      workouts: [
        {
          workout: {
            id: "workout-2",
            distance: 18.4,
            duration: 5890,
            pace: 320,
            date: "2026-04-07T06:10:00.000Z",
          },
        },
        {
          workout: {
            id: "workout-3",
            distance: 6.2,
            duration: 1760,
            pace: 284,
            date: "2026-04-05T07:10:00.000Z",
          },
        },
      ],
    },
  },
};

export const GuestPreview: Story = {
  args: WithGallery.args,
  globals: {
    authMode: "guest",
  },
};
