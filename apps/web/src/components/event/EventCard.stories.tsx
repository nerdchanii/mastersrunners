import type { Meta, StoryObj } from "@storybook/react-vite";

import EventCard from "@/components/event/EventCard";
import { storybookEvent } from "@/storybook/storybook-fixtures";

const meta = {
  title: "Surfaces/Event/EventCard",
  component: EventCard,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EventCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    event: storybookEvent as never,
  },
};
