import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const meta = {
  title: "Primitives/DropdownMenu",
  component: DropdownMenu,
  parameters: { layout: "padded" },
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">더보기</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>수정</DropdownMenuItem>
        <DropdownMenuItem>공유</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">삭제</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
