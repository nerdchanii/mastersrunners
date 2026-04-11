import type { Meta, StoryObj } from "@storybook/react-vite";

import CrewForm from "@/components/crew/CrewForm";

const meta = {
  title: "Surfaces/Crew/CrewForm",
  component: CrewForm,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof CrewForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CreateWithWrapper: Story = {
  args: {
    submitLabel: "크루 만들기",
    isSubmitting: false,
    onCancel: () => undefined,
    onSubmit: async () => undefined,
  },
};

export const EditWithWrapper: Story = {
  args: {
    submitLabel: "수정 저장",
    isSubmitting: false,
    onCancel: () => undefined,
    onSubmit: async () => undefined,
    initialValues: {
      name: "서울 새벽 러너스",
      description: "주중 아침 러닝과 주말 장거리 훈련 중심 크루",
      isPublic: true,
      maxMembers: 40,
      location: "서울숲",
      region: "서울특별시",
      subRegion: "성동구",
      profileImageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=640&q=80",
      coverImageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1280&q=80",
    },
  },
};
