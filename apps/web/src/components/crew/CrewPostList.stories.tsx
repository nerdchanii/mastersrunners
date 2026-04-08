import type { Meta, StoryObj } from "@storybook/react-vite";

import CrewPostList from "@/components/crew/CrewPostList";

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
  },
};

export const Empty: Story = {
  args: {
    crewId: "crew-1",
    isOwner: false,
  },
  parameters: {
    storybook: {
      apiScenario: "empty",
    },
  },
};
