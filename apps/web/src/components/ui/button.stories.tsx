import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowRight, Pencil, Plus } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

function ButtonWorkbench({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-3xl border border-border/60 bg-[linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted)/0.35))] p-6">
      {children}
    </div>
  );
}

const meta = {
  title: "Primitives/Button",
  component: Button,
  parameters: {
    layout: "padded",
  },
  args: {
    children: "러닝 시작",
    variant: "default",
    size: "default",
    asChild: false,
    disabled: false,
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "outline", "ghost", "destructive", "link"],
    },
    size: {
      control: "select",
      options: ["default", "xs", "sm", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"],
    },
    asChild: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
    onClick: {
      action: "clicked",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <ButtonWorkbench>
      <div className="flex items-center gap-3">
        <Button {...args} />
      </div>
    </ButtonWorkbench>
  ),
};

export const Default: Story = {
  args: {
    variant: "default",
    size: "default",
    children: "러닝 시작",
  },
  render: Playground.render,
};

export const Variants: Story = {
  render: () => (
    <ButtonWorkbench>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 rounded-2xl border border-border/60 bg-background p-4">
          <p className="text-xs font-medium text-muted-foreground">Filled</p>
          <div className="flex flex-wrap gap-3">
            <Button>기본</Button>
            <Button variant="secondary">보조</Button>
            <Button variant="destructive">삭제</Button>
          </div>
        </div>

        <div className="space-y-2 rounded-2xl border border-dashed border-border/60 bg-muted/25 p-4">
          <p className="text-xs font-medium text-muted-foreground">Subtle / Text</p>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">아웃라인</Button>
            <Button variant="ghost">고스트</Button>
            <Button variant="link">자세히 보기</Button>
          </div>
        </div>
      </div>
    </ButtonWorkbench>
  ),
};

export const Sizes: Story = {
  render: () => (
    <ButtonWorkbench>
      <div className="flex flex-wrap items-center gap-3">
        <Button size="xs">빠른 추가</Button>
        <Button size="sm">작게</Button>
        <Button>기본</Button>
        <Button size="lg">크게</Button>
        <Button size="icon" aria-label="새 글">
          <Plus />
        </Button>
        <Button size="icon-sm" aria-label="수정">
          <Pencil />
        </Button>
        <Button size="icon-lg" aria-label="다음">
          <ArrowRight />
        </Button>
      </div>
    </ButtonWorkbench>
  ),
};

export const States: Story = {
  render: () => (
    <ButtonWorkbench>
      <div className="flex flex-wrap items-center gap-3">
        <Button>기본</Button>
        <Button disabled>비활성화</Button>
        <Button variant="outline">보조 액션</Button>
        <Button variant="ghost">투명 액션</Button>
        <Button variant="link">텍스트 액션</Button>
      </div>
    </ButtonWorkbench>
  ),
};

export const GhostOnMutedSurface: Story = {
  args: {
    variant: "ghost",
    children: "정렬 열기",
  },
  render: (args) => (
    <div className="rounded-3xl bg-muted/40 p-6">
      <Button {...args} />
    </div>
  ),
};
