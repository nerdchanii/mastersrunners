import type { Meta, StoryObj } from "@storybook/react-vite";

import Header from "@/components/layout/Header";

const meta = {
  title: "Layout/Header",
  component: Header,
  parameters: {
    layout: "fullscreen",
    storybook: {
      route: "/feed",
    },
  },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignedIn: Story = {};

export const Guest: Story = {
  globals: {
    authMode: "guest",
  },
};
