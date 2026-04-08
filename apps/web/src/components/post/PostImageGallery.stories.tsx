import type { Meta, StoryObj } from "@storybook/react-vite";

import { PostImageGallery } from "@/components/post/PostImageGallery";
import { storybookPost } from "@/storybook/storybook-fixtures";

const meta = {
  title: "Surfaces/Post/PostImageGallery",
  component: PostImageGallery,
  parameters: { layout: "padded" },
  args: {
    images: storybookPost.images as never,
  },
} satisfies Meta<typeof PostImageGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
