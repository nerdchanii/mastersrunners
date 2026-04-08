import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";

import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { Button } from "@/components/ui/button";

function ThrowingSample(): ReactElement {
  throw new Error("Storybook에서 강제한 렌더 오류");
}

const meta = {
  title: "Common/ErrorBoundary",
  component: ErrorBoundary,
  parameters: { layout: "padded" },
} satisfies Meta<typeof ErrorBoundary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Fallback: Story = {
  args: {
    children: null,
  },
  render: () => (
    <ErrorBoundary>
      <ThrowingSample />
    </ErrorBoundary>
  ),
};

export const HealthyTree: Story = {
  args: {
    children: null,
  },
  render: () => (
    <ErrorBoundary>
      <div className="rounded-2xl border border-border/60 bg-background p-6">
        <p className="text-sm text-muted-foreground">
          정상 상태에서는 자식 tree를 그대로 렌더링합니다.
        </p>
        <Button className="mt-4">계속 진행</Button>
      </div>
    </ErrorBoundary>
  ),
};
