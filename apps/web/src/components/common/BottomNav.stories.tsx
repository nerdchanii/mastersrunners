import type { Meta, StoryObj } from "@storybook/react-vite";

import { BottomNav } from "@/components/common/BottomNav";

const meta = {
  title: "Common/BottomNav",
  component: BottomNav,
  parameters: {
    layout: "fullscreen",
    storybook: {
      route: "/feed",
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-[240px] bg-background pb-24">
        <div className="mx-auto max-w-sm px-4 py-6 text-sm text-muted-foreground">
          모바일 하단 내비게이션 preview
        </div>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BottomNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignedIn: Story = {
  globals: {
    authMode: "signed-in",
  },
};

export const ComposerOpen: Story = {
  args: {
    initialCreateSheetOpen: true,
  },
  globals: {
    authMode: "signed-in",
  },
};

export const Guest: Story = {
  globals: {
    authMode: "guest",
  },
};
