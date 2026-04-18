import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const meta = {
  title: "Primitives/Switch",
  component: Switch,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

function SwitchPreview() {
  const [checked, setChecked] = useState(true);

  return (
    <div className="flex items-center gap-3">
      <Switch checked={checked} onCheckedChange={setChecked} />
      <Label>활동 자동 공개</Label>
    </div>
  );
}

export const Playground: Story = {
  render: () => <SwitchPreview />,
};

function CrewVisibilityPreview() {
  const [isPublic, setIsPublic] = useState(true);

  return (
    <div className="w-[360px] rounded-2xl border border-border/60 bg-muted/20 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">공개 설정</p>
          <p className="text-xs leading-5 text-muted-foreground">
            {isPublic
              ? "누구나 검색하고 바로 가입할 수 있습니다."
              : "가입 요청은 대기 멤버 목록에서 승인합니다."}
          </p>
        </div>
        <Switch checked={isPublic} onCheckedChange={setIsPublic} />
      </div>
    </div>
  );
}

export const CrewVisibility: Story = {
  render: () => <CrewVisibilityPreview />,
};
