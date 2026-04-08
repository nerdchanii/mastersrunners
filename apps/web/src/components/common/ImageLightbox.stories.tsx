import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { ImageLightbox } from "@/components/common/ImageLightbox";
import { Button } from "@/components/ui/button";
import { storybookMedia } from "@/storybook/storybook-fixtures";

function ImageLightboxPreview() {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex min-h-[560px] items-center justify-center bg-muted/20">
      <Button onClick={() => setOpen(true)}>라이트박스 다시 열기</Button>
      <ImageLightbox
        open={open}
        onOpenChange={setOpen}
        initialIndex={1}
        images={[
          { url: storybookMedia.postGalleryOne, alt: "Tempo night" },
          { url: storybookMedia.postGalleryTwo, alt: "Recovery loop" },
          { url: storybookMedia.feedCover, alt: "Community run" },
        ]}
      />
    </div>
  );
}

const meta = {
  title: "Common/ImageLightbox",
  component: ImageLightbox,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ImageLightbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Opened: Story = {
  args: {
    images: [],
    open: true,
    onOpenChange: () => undefined,
  },
  render: () => <ImageLightboxPreview />,
};
