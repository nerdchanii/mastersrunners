import type { Meta, StoryObj } from "@storybook/react-vite";
import { Route, Routes } from "react-router-dom";

import CrewActivityDetailPage from "./index";

function CrewActivityDetailPageStory() {
  return (
    <Routes>
      <Route path="/crews/:id/activities/:activityId" element={<CrewActivityDetailPage />} />
    </Routes>
  );
}

const meta = {
  title: "Pages/Crew/CrewActivityDetailPage",
  component: CrewActivityDetailPageStory,
  parameters: {
    layout: "fullscreen",
    storybook: {
      route: "/crews/crew-1/activities/activity-1",
    },
  },
} satisfies Meta<typeof CrewActivityDetailPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
