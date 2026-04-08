import type { Meta, StoryObj } from "@storybook/react-vite";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

const meta = {
  title: "Primitives/Sonner",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button onClick={() => toast.success("공유 링크를 복사했습니다.")}>성공 토스트</Button>
      <Button variant="outline" onClick={() => toast.error("다시 시도해주세요.")}>
        에러 토스트
      </Button>
    </div>
  ),
};
