import type { Meta, StoryObj } from "@storybook/react-vite";

import { MentionLink } from "@/components/social/MentionLink";

const meta = {
  title: "Surfaces/Social/MentionLink",
  component: MentionLink,
  parameters: { layout: "padded" },
} satisfies Meta<typeof MentionLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "@김러너 오늘 템포런 정말 좋았어요.",
  },
  render: () => <MentionLink>@김러너 오늘 템포런 정말 좋았어요.</MentionLink>,
};
