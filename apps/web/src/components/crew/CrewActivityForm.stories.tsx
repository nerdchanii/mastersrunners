import type { Meta, StoryObj } from "@storybook/react-vite";

import CrewActivityForm from "@/components/crew/CrewActivityForm";

const meta = {
  title: "Surfaces/Crew/CrewActivityForm",
  component: CrewActivityForm,
  parameters: { layout: "padded" },
} satisfies Meta<typeof CrewActivityForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Create: Story = {
  args: {
    crewId: "crew-1",
    onSuccess: () => undefined,
    onCancel: () => undefined,
  },
};

export const Edit: Story = {
  args: {
    crewId: "crew-1",
    mode: "edit",
    onSuccess: () => undefined,
    onCancel: () => undefined,
    initialValues: {
      title: "토요일 롱런",
      description: "잠실대교 남단 집결",
      location: "잠실한강공원",
      activityDate: "2026-04-13T22:00:00.000Z",
      activityType: "OFFICIAL",
    },
  },
};
