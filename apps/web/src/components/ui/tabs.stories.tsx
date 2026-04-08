import type { Meta, StoryObj } from "@storybook/react-vite";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const meta = {
  title: "Primitives/Tabs",
  component: Tabs,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <Tabs defaultValue="posts" className="w-[360px]">
      <TabsList>
        <TabsTrigger value="posts">게시글</TabsTrigger>
        <TabsTrigger value="workouts">워크아웃</TabsTrigger>
        <TabsTrigger value="crews">크루</TabsTrigger>
      </TabsList>
      <TabsContent value="posts" className="rounded-xl border p-4 text-sm">
        최근 게시글 12개
      </TabsContent>
      <TabsContent value="workouts" className="rounded-xl border p-4 text-sm">
        이번 달 러닝 18회
      </TabsContent>
      <TabsContent value="crews" className="rounded-xl border p-4 text-sm">
        참여 중인 크루 4개
      </TabsContent>
    </Tabs>
  ),
};
