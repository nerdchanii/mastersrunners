import type { Meta, StoryObj } from "@storybook/react-vite";

import { UserAvatar } from "@/components/common/UserAvatar";
import { storybookUser } from "@/storybook/storybook-fixtures";

const meta = {
  title: "Common/UserAvatar",
  component: UserAvatar,
  parameters: { layout: "padded" },
  args: {
    user: {
      id: storybookUser.id,
      name: storybookUser.name,
      profileImage: storybookUser.profileImage,
    },
    showName: true,
    subtitle: "3분 전",
  },
} satisfies Meta<typeof UserAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
