import type { Meta, StoryObj } from "@storybook/react-vite";

import { LikeButton } from "@/components/social/LikeButton";

const meta = {
  title: "Surfaces/Social/LikeButton",
  component: LikeButton,
  parameters: {
    layout: "padded",
    storybook: {
      route: "/posts/post-1",
    },
  },
  argTypes: {
    entityType: {
      control: "select",
      options: ["post", "workout"],
    },
    initialLiked: {
      control: "boolean",
    },
    initialCount: {
      control: {
        type: "number",
        min: 0,
        step: 1,
      },
    },
    compact: {
      control: "boolean",
    },
  },
  args: {
    entityType: "post",
    entityId: "post-1",
    initialLiked: true,
    initialCount: 12,
    compact: false,
  },
} satisfies Meta<typeof LikeButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <LikeButton
      key={`${args.entityType}-${args.entityId}-${args.initialLiked}-${args.initialCount}-${args.compact}`}
      {...args}
    />
  ),
};

export const Liked: Story = {
  args: {
    initialLiked: true,
    initialCount: 12,
  },
  render: Playground.render,
};

export const Unliked: Story = {
  args: {
    initialLiked: false,
    initialCount: 0,
  },
  render: Playground.render,
};

export const Compact: Story = {
  args: {
    compact: true,
    initialLiked: true,
    initialCount: 3,
  },
  render: Playground.render,
};

export const Guest: Story = {
  args: {
    initialLiked: false,
    initialCount: 8,
  },
  globals: {
    authMode: "guest",
  },
  render: Playground.render,
};
