import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const meta = {
  title: "Primitives/Select",
  component: Select,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

function SelectPreview() {
  const [value, setValue] = useState("tempo");

  return (
    <div className="w-[240px]">
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger>
          <SelectValue placeholder="훈련 유형 선택" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>러닝 타입</SelectLabel>
            <SelectItem value="easy">이지런</SelectItem>
            <SelectItem value="tempo">템포런</SelectItem>
            <SelectItem value="long">롱런</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectItem value="rest">휴식</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

export const Playground: Story = {
  render: () => <SelectPreview />,
};

function CrewRegionPreview() {
  const [region, setRegion] = useState("");

  return (
    <div className="w-[320px] space-y-4">
      <div className="space-y-2">
        <Label htmlFor="crew-region">지역</Label>
        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger id="crew-region" aria-invalid={region ? undefined : true}>
            <SelectValue placeholder="지역 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="서울특별시">서울특별시</SelectItem>
            <SelectItem value="경기도">경기도</SelectItem>
            <SelectItem value="부산광역시">부산광역시</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          크루 탐색과 참여 요청에서 먼저 보이는 필터 기준입니다.
        </p>
      </div>

      {!region && (
        <p className="text-xs text-destructive">
          지역을 선택하면 멤버가 활동권을 더 빠르게 이해할 수 있습니다.
        </p>
      )}
    </div>
  );
}

export const CrewRegionState: Story = {
  render: () => <CrewRegionPreview />,
};

function IconPickerPreview() {
  const [icon, setIcon] = useState("🏃");

  return (
    <div className="space-y-2">
      <Label htmlFor="activity-icon">활동 아이콘</Label>
      <Select value={icon} onValueChange={setIcon}>
        <SelectTrigger
          id="activity-icon"
          size="lg"
          className="h-11 w-11 justify-center rounded-xl px-0 text-xl [&_[data-slot=select-value]]:justify-center [&>svg]:hidden"
        >
          <SelectValue placeholder="선택" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="🏃">
            <span className="text-base leading-none">🏃</span>
          </SelectItem>
          <SelectItem value="🚴">
            <span className="text-base leading-none">🚴</span>
          </SelectItem>
          <SelectItem value="🏊">
            <span className="text-base leading-none">🏊</span>
          </SelectItem>
          <SelectItem value="⛰️">
            <span className="text-base leading-none">⛰️</span>
          </SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        아이콘 선택 필드는 별도 primitive 대신 Select 변형으로 사용합니다.
      </p>
    </div>
  );
}

export const IconPicker: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile2",
    },
  },
  render: () => <IconPickerPreview />,
};
