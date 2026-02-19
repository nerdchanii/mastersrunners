import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

interface AttendanceBucket {
  total: number;
  rsvp: number;
  checkedIn: number;
  noShow: number;
  rate: number;
}

interface MonthlyRate {
  month: string;
  officialRate: number;
  popUpRate: number;
}

export interface MemberAttendanceStats {
  official: AttendanceBucket;
  popUp: AttendanceBucket;
  monthly: MonthlyRate[];
}

interface ActivityStat {
  id: string;
  title: string;
  activityDate: string;
  activityType: string;
  total: number;
  checkedIn: number;
  noShow: number;
  rate: number;
}

export interface MemberStat {
  userId: string;
  user: { id: string; name: string; profileImage: string | null };
  total: number;
  checkedIn: number;
  noShow: number;
  rate: number;
}

export interface CrewAttendanceStats {
  activities: ActivityStat[];
  memberStats: MemberStat[];
  overallRate: number;
}

export const attendanceKeys = {
  member: (crewId: string, userId: string) =>
    ["crews", crewId, "attendance", userId] as const,
  crew: (crewId: string, opts?: { month?: string; type?: string }) =>
    ["crews", crewId, "attendance-stats", opts] as const,
};

export function useMemberAttendanceStats(crewId: string, userId: string) {
  return useQuery({
    queryKey: attendanceKeys.member(crewId, userId),
    queryFn: () =>
      api.fetch<MemberAttendanceStats>(
        `/crews/${crewId}/members/${userId}/attendance-stats`,
      ),
    enabled: !!crewId && !!userId,
  });
}

export function useCrewAttendanceStats(
  crewId: string,
  opts?: { month?: string; type?: string },
) {
  return useQuery({
    queryKey: attendanceKeys.crew(crewId, opts),
    queryFn: () => {
      const params = new URLSearchParams();
      if (opts?.month) params.set("month", opts.month);
      if (opts?.type) params.set("type", opts.type);
      const qs = params.toString();
      return api.fetch<CrewAttendanceStats>(
        `/crews/${crewId}/attendance-stats${qs ? `?${qs}` : ""}`,
      );
    },
    enabled: !!crewId,
  });
}
