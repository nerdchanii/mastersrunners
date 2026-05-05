import { useMemo, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type CrewAttendanceStats as CrewAttendanceStatsData,
  useCrewAttendanceStats,
} from "@/hooks/useAttendanceStats";

import { CrewAttendanceActivitySection } from "./CrewAttendanceActivitySection";
import { CrewAttendanceMemberSection } from "./CrewAttendanceMemberSection";
import { EmptyPanel, type MemberSortOption } from "./CrewAttendanceStats.shared";

interface Props {
  crewId: string;
  crewName?: string;
  initialData?: CrewAttendanceStatsData | null;
  initialLoading?: boolean;
}

export default function CrewAttendanceStats({
  crewId,
  crewName: _crewName,
  initialData,
  initialLoading = false,
}: Props) {
  const [view, setView] = useState("activities");
  const [sort, setSort] = useState<MemberSortOption>("checkedIn");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  const { data, isLoading } = useCrewAttendanceStats(crewId, { sort, order, limit: 20 });

  const statsData = initialData ?? data;
  const isPending = initialData !== undefined ? initialLoading : isLoading;

  const filteredMembers = useMemo(() => statsData?.members ?? [], [statsData]);

  const handleSortChange = (nextSort: MemberSortOption) => {
    if (sort === nextSort) {
      setOrder((prev) => (prev === "desc" ? "asc" : "desc"));
      return;
    }
    setSort(nextSort);
    setOrder(nextSort === "noShow" ? "asc" : "desc");
  };

  if (isPending) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (!statsData) {
    return (
      <EmptyPanel
        title="출석 데이터가 없습니다."
        body="완료된 활동이 생기면 운영 통계가 표시됩니다."
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 md:space-y-6">
      <section className="space-y-3">
        <Tabs value={view} onValueChange={setView} className="space-y-0">
          <TabsList className="grid h-10 w-full grid-cols-2 rounded-lg bg-muted/40 p-1 md:w-80">
            <TabsTrigger value="activities" className="rounded-md text-sm font-semibold">
              월별
            </TabsTrigger>
            <TabsTrigger value="members" className="rounded-md text-sm font-semibold">
              멤버별
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activities" className="m-0 pt-5">
            <CrewAttendanceActivitySection crewId={crewId} activities={statsData.activities} />
          </TabsContent>

          <TabsContent value="members" className="m-0 pt-5">
            <CrewAttendanceMemberSection
              crewId={crewId}
              members={filteredMembers}
              sort={sort}
              order={order}
              onSortChange={handleSortChange}
            />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
