import type { Meta, StoryObj } from "@storybook/react-vite";

import { CommentSection } from "@/components/post/CommentSection";

const meta = {
  title: "Surfaces/Post/CommentSection",
  component: CommentSection,
  parameters: {
    layout: "padded",
    storybook: {
      route: "/posts/post-1",
    },
  },
  args: {
    postId: "post-1",
  },
} satisfies Meta<typeof CommentSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
