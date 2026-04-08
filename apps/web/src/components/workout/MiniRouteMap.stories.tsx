import type { Meta, StoryObj } from "@storybook/react-vite";

import { MiniRouteMap } from "@/components/workout/MiniRouteMap";

const meta = {
  title: "Surfaces/Workout/MiniRouteMap",
  component: MiniRouteMap,
  parameters: { layout: "padded" },
} satisfies Meta<typeof MiniRouteMap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    encodedPolyline: "}_seFf~ejVg@tCgBzDmBfCuCnB{A",
    size: 96,
    strokeWidth: 2.4,
  },
};
