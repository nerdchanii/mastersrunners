import type { Meta, StoryObj } from "@storybook/react-vite";

import EventResultsTable from "@/components/event/EventResultsTable";
import { storybookEventResults } from "@/storybook/storybook-fixtures";

const meta = {
  title: "Surfaces/Event/EventResultsTable",
  component: EventResultsTable,
  parameters: { layout: "padded" },
  args: {
    results: storybookEventResults as never,
    isLoading: false,
  },
} satisfies Meta<typeof EventResultsTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
