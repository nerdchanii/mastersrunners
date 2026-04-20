import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import CrewAttendance from "@/components/crew/CrewAttendance";
import { storybookCrewAttendance, storybookUser } from "@/storybook/storybook-fixtures";

const recentAttendance = storybookCrewAttendance.map((attendee, index) => ({
  ...attendee,
  checkedInAt: new Date(Date.now() - (index + 2) * 60 * 1000).toISOString(),
}));

function CrewAttendanceWorkbench() {
  const [role, setRole] = useState<"member" | "operator">("member");
  const [memberState, setMemberState] = useState<"ready" | "checked-in">("ready");
  const [dataState, setDataState] = useState<"fixture" | "empty" | "loading">("fixture");

  const currentUserId =
    role === "member" && memberState === "checked-in" ? storybookUser.id : "user-2";
  const attendees =
    dataState === "empty"
      ? []
      : dataState === "fixture"
        ? [...recentAttendance]
        : [...recentAttendance];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {[
          { value: "member", label: "Member" },
          { value: "operator", label: "Operator" },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setRole(option.value as "member" | "operator")}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              role === option.value
                ? "border-zinc-950 bg-zinc-950 text-white"
                : "border-border bg-background text-foreground hover:border-foreground/20"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { value: "ready", label: "Ready" },
          { value: "checked-in", label: "Checked In" },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setMemberState(option.value as "ready" | "checked-in")}
            disabled={role === "operator"}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              memberState === option.value
                ? "border-zinc-950 bg-zinc-950 text-white"
                : "border-border bg-background text-foreground hover:border-foreground/20"
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { value: "fixture", label: "Fixture" },
          { value: "empty", label: "Empty" },
          { value: "loading", label: "Loading" },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setDataState(option.value as "fixture" | "empty" | "loading")}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              dataState === option.value
                ? "border-zinc-950 bg-zinc-950 text-white"
                : "border-border bg-background text-foreground hover:border-foreground/20"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mx-auto max-w-[1180px] px-4 py-4 sm:px-6">
        <CrewAttendance
          crewId="한강 러닝 크루"
          activityId="목요 인터벌"
          isAdmin={role === "operator"}
          currentUserId={currentUserId}
          initialAttendees={attendees}
        />
      </div>
    </div>
  );
}

const meta = {
  title: "Surfaces/Crew/CrewAttendance",
  component: CrewAttendance,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof CrewAttendance>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Admin: Story = {
  args: {
    crewId: "한강 러닝 크루",
    activityId: "목요 인터벌",
    isAdmin: true,
    initialAttendees: [...recentAttendance],
  },
};

export const MemberReady: Story = {
  args: {
    crewId: "한강 러닝 크루",
    activityId: "목요 인터벌",
    isAdmin: false,
    currentUserId: "user-2",
    initialAttendees: [...recentAttendance],
  },
};

export const MemberCheckedIn: Story = {
  args: {
    crewId: "한강 러닝 크루",
    activityId: "목요 인터벌",
    isAdmin: false,
    currentUserId: storybookUser.id,
    initialAttendees: [...recentAttendance],
  },
};

export const Empty: Story = {
  args: {
    crewId: "한강 러닝 크루",
    activityId: "목요 인터벌",
    isAdmin: true,
    initialAttendees: [],
  },
};

export const Workbench: Story = {
  args: {
    crewId: "한강 러닝 크루",
    activityId: "목요 인터벌",
  },
  render: () => <CrewAttendanceWorkbench />,
};
