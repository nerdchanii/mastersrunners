import type { Meta, StoryObj } from "@storybook/react-vite";

import CrewCard from "@/components/crew/CrewCard";
import { storybookMedia } from "@/storybook/storybook-fixtures";

const meta = {
  title: "Surfaces/Crew/CrewCard",
  component: CrewCard,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof CrewCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PublicCrew: Story = {
  args: {
    crew: {
      id: "crew-1",
      name: "성수 브릭 런클럽",
      description: "평일 새벽 6시에 모여 템포런과 인터벌을 함께 달립니다.",
      imageUrl: storybookMedia.crewBadge,
      isPublic: true,
      createdAt: "2026-03-12T00:00:00.000Z",
      creator: {
        id: "runner-1",
        name: "김러너",
        profileImage: null,
      },
      _count: {
        members: 132,
      },
    },
  },
};

export const PrivateCrew: Story = {
  args: {
    crew: {
      id: "crew-2",
      name: "하프 준비반",
      description: "레이스 전까지 주 4회 루틴을 맞추는 소규모 훈련 그룹입니다.",
      imageUrl: null,
      isPublic: false,
      createdAt: "2026-03-19T00:00:00.000Z",
      creator: {
        id: "runner-2",
        name: "이페이서",
        profileImage: null,
      },
      _count: {
        members: 24,
      },
    },
  },
};
