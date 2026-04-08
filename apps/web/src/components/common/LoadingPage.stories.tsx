import type { Meta, StoryObj } from "@storybook/react-vite";

import { LoadingPage } from "@/components/common/LoadingPage";

const meta = {
  title: "Common/LoadingPage",
  component: LoadingPage,
  parameters: { layout: "padded" },
} satisfies Meta<typeof LoadingPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Feed: Story = { args: { variant: "feed" } };
export const Profile: Story = { args: { variant: "profile" } };
