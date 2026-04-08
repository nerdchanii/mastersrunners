import type { Meta, StoryObj } from "@storybook/react-vite";
import { Check } from "lucide-react";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";
import { storybookMedia, storybookUser } from "@/storybook/storybook-fixtures";

const meta = {
  title: "Primitives/Avatar",
  component: Avatar,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <Avatar size="lg">
      <AvatarImage src={storybookUser.profileImage ?? undefined} alt={storybookUser.name} />
      <AvatarFallback>김</AvatarFallback>
      <AvatarBadge>
        <Check />
      </AvatarBadge>
    </Avatar>
  ),
};

export const Group: Story = {
  render: () => (
    <AvatarGroup>
      <Avatar>
        <AvatarImage src={storybookUser.profileImage ?? undefined} alt={storybookUser.name} />
        <AvatarFallback>김</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src={storybookMedia.crewBadge} alt="크루" />
        <AvatarFallback>크</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>+4</AvatarGroupCount>
    </AvatarGroup>
  ),
};
