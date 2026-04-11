import type { Meta, StoryObj } from "@storybook/react-vite";

import CrewPostList from "@/components/crew/CrewPostList";
import { storybookCrewPosts } from "@/storybook/storybook-fixtures";

const crewPosts = {
  ...storybookCrewPosts,
  items: storybookCrewPosts.items.map((item) => ({
    ...item,
    images: [...item.images],
  })),
};

const meta = {
  title: "Surfaces/Crew/CrewPostList",
  component: CrewPostList,
  parameters: { layout: "padded" },
} satisfies Meta<typeof CrewPostList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Owner: Story = {
  args: {
    crewId: "crew-1",
    isOwner: true,
    initialData: crewPosts,
  },
};

export const ComposerOpen: Story = {
  args: {
    crewId: "crew-1",
    isOwner: true,
    initialData: crewPosts,
    defaultShowComposer: true,
  },
};

export const Empty: Story = {
  args: {
    crewId: "crew-1",
    isOwner: false,
    initialData: {
      items: [],
      nextCursor: null,
    },
  },
};
