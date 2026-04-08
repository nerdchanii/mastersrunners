import type { Meta, StoryObj } from "@storybook/react-vite";

import CrewIdentityHero from "@/components/crew/CrewIdentityHero";
import { Button } from "@/components/ui/button";
import { storybookCrew, storybookMedia } from "@/storybook/storybook-fixtures";

const meta = {
  title: "Surfaces/Crew/CrewIdentityHero",
  component: CrewIdentityHero,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-5xl bg-background p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CrewIdentityHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    eyebrow: "공식 크루",
    name: storybookCrew.name,
    description: "아침 러닝과 주말 롱런을 함께하는 도시형 크루",
    creatorName: "김러너",
    createdAt: "2026-03-01T08:00:00.000Z",
    memberCount: 28,
    maxMembers: 40,
    isPublic: true,
    profileImageUrl: storybookMedia.crewBadge,
    coverImageUrl: storybookMedia.feedCover,
    actions: (
      <>
        <Button variant="outline">공유</Button>
        <Button>가입 신청</Button>
      </>
    ),
  },
};
