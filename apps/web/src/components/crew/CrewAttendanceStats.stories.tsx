import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import CrewAttendanceStats from "@/components/crew/CrewAttendanceStats";
import { storybookCrewAttendanceStats } from "@/storybook/storybook-fixtures";

const crewAttendanceStats = {
  ...storybookCrewAttendanceStats,
  activities: [...storybookCrewAttendanceStats.activities],
  members: [...storybookCrewAttendanceStats.members],
};

function CrewAttendanceStatsPlayground() {
  const [mode, setMode] = useState<"mock" | "fixture" | "sparse" | "empty-members" | "loading">(
    "fixture",
  );
  const [frame, setFrame] = useState<"mobile" | "tablet" | "desktop">("mobile");

  const sparseData = {
    ...crewAttendanceStats,
    summary: {
      ...crewAttendanceStats.summary,
      overallRate: 67,
      activityCount: 2,
      totalEligible: 9,
      totalCheckedIn: 6,
      totalNoShow: 1,
    },
    activities: [
      {
        ...crewAttendanceStats.activities[0],
        activityDate: "2026-04-03T21:30:00.000Z",
        total: 5,
        checkedIn: 3,
        noShow: 1,
        rate: 60,
      },
      {
        ...crewAttendanceStats.activities[1],
        activityDate: "2026-04-10T11:00:00.000Z",
        total: 4,
        checkedIn: 3,
        noShow: 0,
        rate: 75,
      },
    ],
  };

  const resolvedProps =
    mode === "mock"
      ? { crewId: "crew-1", crewName: "마스터스 러너스" }
      : mode === "fixture"
        ? { crewId: "crew-1", crewName: "마스터스 러너스", initialData: crewAttendanceStats }
        : mode === "sparse"
          ? { crewId: "crew-1", crewName: "마스터스 러너스", initialData: sparseData }
          : mode === "empty-members"
            ? {
                crewId: "crew-1",
                crewName: "마스터스 러너스",
                initialData: { ...crewAttendanceStats, members: [] },
              }
            : {
                crewId: "crew-1",
                crewName: "마스터스 러너스",
                initialLoading: true,
                initialData: crewAttendanceStats,
              };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {[
          { value: "mock", label: "Mock API" },
          { value: "fixture", label: "Fixture" },
          { value: "sparse", label: "Sparse" },
          { value: "empty-members", label: "No Members" },
          { value: "loading", label: "Loading" },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() =>
              setMode(option.value as "mock" | "fixture" | "sparse" | "empty-members" | "loading")
            }
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === option.value
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
          { value: "mobile", label: "Mobile" },
          { value: "tablet", label: "Tablet" },
          { value: "desktop", label: "Desktop" },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFrame(option.value as "mobile" | "tablet" | "desktop")}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              frame === option.value
                ? "border-zinc-950 bg-zinc-950 text-white"
                : "border-border bg-background text-foreground hover:border-foreground/20"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div
        className={`${
          frame === "mobile"
            ? "mx-auto max-w-[390px]"
            : frame === "tablet"
              ? "mx-auto max-w-[820px]"
              : "w-full"
        }`}
      >
        <CrewAttendanceStats {...resolvedProps} />
      </div>
    </div>
  );
}

const meta = {
  title: "Surfaces/Crew/CrewAttendanceStats",
  component: CrewAttendanceStats,
  parameters: { layout: "padded" },
} satisfies Meta<typeof CrewAttendanceStats>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    crewId: "crew-1",
    crewName: "마스터스 러너스",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Storybook mock API와 연결된 기본 인터랙티브 스토리입니다. 기간 선택, 활동/멤버 탭, 멤버 accordion 확장이 실제 컴포넌트 상태로 동작합니다.",
      },
    },
  },
};

export const FixturePreview: Story = {
  args: {
    crewId: "crew-1",
    crewName: "마스터스 러너스",
    initialData: crewAttendanceStats,
  },
  parameters: {
    docs: {
      description: {
        story: "정적인 fixture 상태를 빠르게 시각 검토할 때 쓰는 스토리입니다.",
      },
    },
  },
};

export const Playground: Story = {
  args: {
    crewId: "crew-1",
    crewName: "마스터스 러너스",
  },
  render: () => <CrewAttendanceStatsPlayground />,
  parameters: {
    docs: {
      description: {
        story:
          "실제 상태 변경을 바로 확인할 수 있는 스토리입니다. Mock API, sparse timeline, empty state, loading 상태와 멤버 리스트 확장을 직접 전환해볼 수 있습니다.",
      },
    },
  },
};

export const SparseTimeline: Story = {
  args: {
    crewId: "crew-1",
    crewName: "마스터스 러너스",
    initialData: {
      ...crewAttendanceStats,
      summary: {
        ...crewAttendanceStats.summary,
        overallRate: 67,
        activityCount: 2,
        totalEligible: 9,
        totalCheckedIn: 6,
        totalNoShow: 1,
      },
      activities: [
        {
          ...crewAttendanceStats.activities[0],
          activityDate: "2026-04-03T21:30:00.000Z",
          total: 5,
          checkedIn: 3,
          noShow: 1,
          rate: 60,
        },
        {
          ...crewAttendanceStats.activities[1],
          activityDate: "2026-04-10T11:00:00.000Z",
          total: 4,
          checkedIn: 3,
          noShow: 0,
          rate: 75,
        },
      ],
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "전체 기간인데 활동 수가 적은 초기 크루 상태를 확인하는 스토리입니다. 차트가 너무 좁게 붙지 않고 축을 충분히 채우는지 볼 수 있습니다.",
      },
    },
  },
};

export const EmptyMembers: Story = {
  args: {
    crewId: "crew-1",
    initialData: {
      ...crewAttendanceStats,
      members: [],
    },
  },
};

export const Empty: Story = {
  args: {
    crewId: "crew-1",
    initialData: null,
  },
};

export const Loading: Story = {
  args: {
    crewId: "crew-1",
    initialLoading: true,
    initialData: crewAttendanceStats,
  },
};
