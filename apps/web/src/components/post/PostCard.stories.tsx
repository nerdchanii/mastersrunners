import type { Meta, StoryObj } from "@storybook/react-vite";

import { PostCard } from "@/components/post/PostCard";
import { storybookPost } from "@/storybook/storybook-fixtures";

const meta = {
  title: "Surfaces/Post/PostCard",
  component: PostCard,
  parameters: {
    layout: "padded",
    storybook: {
      route: "/posts/post-1",
    },
  },
} satisfies Meta<typeof PostCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: storybookPost.id,
    user: storybookPost.user,
    content: storybookPost.content,
    hashtags: [...storybookPost.hashtags],
    likesCount: storybookPost._count.likes,
    commentsCount: storybookPost._count.comments,
    isLiked: storybookPost.isLiked,
    createdAt: storybookPost.createdAt,
    images: [...storybookPost.images],
    onShare: () => undefined,
  },
};
