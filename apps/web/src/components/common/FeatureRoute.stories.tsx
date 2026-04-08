import type { Meta, StoryObj } from "@storybook/react-vite";

import { FeatureRoute } from "@/components/common/FeatureRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const meta = {
  title: "Common/FeatureRoute",
  component: FeatureRoute,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof FeatureRoute>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Enabled: Story = {
  args: {
    feature: "challenges",
    children: (
      <Card>
        <CardHeader>
          <CardTitle>챌린지 surface</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          feature flag가 열려 있을 때 실제 콘텐츠를 통과시킵니다.
        </CardContent>
      </Card>
    ),
  },
  parameters: {
    storybook: {
      featureOverrides: { challenges: true },
    },
  },
};

export const Disabled: Story = {
  args: {
    feature: "events",
    children: (
      <div className="rounded-2xl border p-6 text-sm">
        이 내용은 비활성화 시 렌더링되지 않습니다.
      </div>
    ),
  },
  parameters: {
    storybook: {
      featureOverrides: { events: false },
    },
  },
};
