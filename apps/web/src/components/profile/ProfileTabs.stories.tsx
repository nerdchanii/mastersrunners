import type { Meta, StoryObj } from "@storybook/react-vite";

import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { storybookProfileTabs } from "@/storybook/storybook-fixtures";

const meta = {
  title: "Surfaces/Profile/ProfileTabs",
  component: ProfileTabs,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-4xl bg-background p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProfileTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    posts: [...storybookProfileTabs.posts] as never,
    workouts: [...storybookProfileTabs.workouts] as never,
    crews: storybookProfileTabs.crews.map((crew) => ({
      id: crew.id,
      name: crew.name,
      description: crew.description,
      imageUrl: crew.imageUrl,
      _count: {
        members: crew.memberCount,
      },
    })) as never,
    isLoading: false,
    activeTab: "posts",
    onTabChange: () => undefined,
  },
};
