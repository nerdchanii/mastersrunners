import type { Meta, StoryObj } from "@storybook/react-vite";

import { CommentList } from "@/components/social/CommentList";

const meta = {
  title: "Surfaces/Social/CommentList",
  component: CommentList,
  parameters: {
    layout: "padded",
    storybook: {
      route: "/posts/post-1",
    },
  },
  args: {
    entityType: "post",
    entityId: "post-1",
  },
} satisfies Meta<typeof CommentList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  parameters: {
    storybook: {
      route: "/posts/post-1",
      apiScenario: "empty",
    },
  },
};

export const GuestEntry: Story = {
  globals: {
    authMode: "guest",
  },
};
