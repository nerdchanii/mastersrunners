import type { Meta, StoryObj } from "@storybook/react-vite";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const meta = {
  title: "Primitives/Textarea",
  component: Textarea,
  parameters: { layout: "padded" },
  args: {
    placeholder: "오늘 러닝 메모를 남겨보세요",
    defaultValue: "호흡이 안정적이어서 후반부에 조금 더 밀어봤습니다.",
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <div className="w-full max-w-[360px]">
      <Textarea {...args} />
    </div>
  ),
};

export const CrewCopyStates: Story = {
  render: () => (
    <div className="w-full max-w-[420px] space-y-4">
      <div className="space-y-2">
        <Label htmlFor="crew-description">크루 소개</Label>
        <Textarea
          id="crew-description"
          rows={5}
          defaultValue="주중 아침 러닝과 주말 롱런을 함께 이어갑니다."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="activity-note">활동 설명</Label>
        <Textarea
          id="activity-note"
          rows={4}
          placeholder="집결 지점, 페이스, 보급 여부처럼 필요한 정보만 적어주세요."
        />
        <p className="text-xs text-muted-foreground">
          설명은 이미 보이는 제목과 버튼을 반복하지 않도록 짧게 유지합니다.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="error-copy">게시글 내용</Label>
        <Textarea id="error-copy" aria-invalid="true" rows={4} defaultValue="" />
        <p className="text-xs text-destructive">내용을 입력해주세요.</p>
      </div>
    </div>
  ),
};
