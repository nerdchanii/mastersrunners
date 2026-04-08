import type { Meta, StoryObj } from "@storybook/react-vite";

import PendingMemberList from "@/components/crew/PendingMemberList";

const meta = {
  title: "Surfaces/Crew/PendingMemberList",
  component: PendingMemberList,
  parameters: { layout: "padded" },
} satisfies Meta<typeof PendingMemberList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    crewId: "crew-1",
    onUpdate: () => undefined,
  },
};
