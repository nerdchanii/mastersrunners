import type { Meta, StoryObj } from "@storybook/react-vite";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const meta = {
  title: "Primitives/Input",
  component: Input,
  parameters: {
    layout: "padded",
  },
  args: {
    type: "text",
    placeholder: "크루 이름을 입력하세요",
    disabled: false,
  },
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "number", "password", "search"],
    },
    disabled: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <div className="w-full max-w-[320px]">
      <Input {...args} />
    </div>
  ),
};

export const CrewFormStates: Story = {
  render: () => (
    <div className="w-full max-w-[360px] space-y-4">
      <div className="space-y-2">
        <Label htmlFor="crew-name">크루 이름</Label>
        <Input id="crew-name" placeholder="예: 서울 새벽 러너스" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="crew-location">활동 지역</Label>
        <Input id="crew-location" placeholder="예: 서울숲 문화예술공원 입구" />
        <p className="text-xs text-muted-foreground">
          멤버가 집결 지점을 빠르게 이해할 수 있게 적습니다.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image-url">프로필 이미지 URL</Label>
        <Input
          id="image-url"
          aria-invalid="true"
          defaultValue="ftp://crew-image"
          placeholder="https://example.com/crew-profile.jpg"
        />
        <p className="text-xs text-destructive">
          프로필 이미지는 http 또는 https URL로 입력해주세요.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="readonly-field">최대 인원</Label>
        <Input id="readonly-field" type="number" defaultValue="40" disabled />
      </div>
    </div>
  ),
};
