import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const meta = {
  title: "Primitives/Card",
  component: Card,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Summary: Story = {
  render: () => (
    <Card className="w-[360px]">
      <CardHeader>
        <CardTitle>오늘의 러닝 요약</CardTitle>
        <CardDescription>아침 조깅과 저녁 회복주를 한 장에서 확인합니다.</CardDescription>
        <CardAction className="text-xs text-muted-foreground">업데이트됨 2분 전</CardAction>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>거리 12.4km</p>
        <p>시간 1시간 7분</p>
        <p>평균 페이스 5'24&quot;/km</p>
      </CardContent>
      <CardFooter className="text-sm font-medium">이번 주 누적 38.2km</CardFooter>
    </Card>
  ),
};
