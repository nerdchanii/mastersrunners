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
  activityIcon?: string | null;
  location?: string | null;
  total: number;
  checkedIn: number;
  noShow: number;
  rate: number;
}

export interface CrewAttendanceMemberRow {
  userId: string;
  user: { id: string; name: string; profileImage: string | null };
  totalEligible: number;
  checkedIn: number;
  noShow: number;
  rate: number;
  lastActivityAt: string | null;
  lastCheckedInAt: string | null;
}

export interface CrewAttendanceStatsSummary {
  overallRate: number;
  activityCount: number;
  totalEligible: number;
  totalCheckedIn: number;
  totalNoShow: number;
}

export interface CrewAttendanceStats {
  summary: CrewAttendanceStatsSummary;
  activities: ActivityStat[];
  members: CrewAttendanceMemberRow[];
}

export interface CrewAttendanceHistoryItem {
  id: string;
  activityId: string;
  title: string;
  activityDate: string;
  activityType: string;
  activityIcon?: string | null;
  status: string;
  checkedAt: string | null;
  rsvpAt: string | null;
}

export interface CrewAttendanceMemberHistory {
  member: {
    userId: string;
    user: { id: string; name: string; profileImage: string | null };
    totalEligible: number;
    checkedIn: number;
    noShow: number;
    rate: number;
    lastActivityAt: string | null;
    lastCheckedInAt: string | null;
  };
  history: CrewAttendanceHistoryItem[];
}

export interface CrewAttendanceStatsQuery {
  range?: string;
  type?: string;
  sort?: string;
  order?: string;
  q?: string;
  checkInLte?: number;
  noShowGte?: number;
  limit?: number;
}

export interface CrewAttendanceMemberHistoryQuery {
  range?: string;
  type?: string;
}

export const attendanceKeys = {
  member: (crewId: string, userId: string) => ["crews", crewId, "attendance", userId] as const,
  memberHistory: (crewId: string, userId: string, opts?: CrewAttendanceMemberHistoryQuery) =>
    ["crews", crewId, "attendance-history", userId, opts] as const,
  crew: (crewId: string, opts?: CrewAttendanceStatsQuery) =>
    ["crews", crewId, "attendance-stats", opts] as const,
};

function buildAttendanceQueryParams<T extends object>(opts?: T) {
  const params = new URLSearchParams();
  Object.entries((opts ?? {}) as Record<string, string | number | undefined>).forEach(
    ([key, value]) => {
      if (value !== undefined && value !== "") {
        params.set(key, String(value));
      }
    },
  );
  return params.toString();
}

export function useMemberAttendanceStats(crewId: string, userId: string) {
  return useQuery({
    queryKey: attendanceKeys.member(crewId, userId),
    queryFn: () =>
      api.fetch<MemberAttendanceStats>(`/crews/${crewId}/members/${userId}/attendance-stats`),
    enabled: !!crewId && !!userId,
  });
}

export function useMemberAttendanceHistory(
  crewId: string,
  userId: string | null,
  opts?: CrewAttendanceMemberHistoryQuery,
) {
  return useQuery({
    queryKey: attendanceKeys.memberHistory(crewId, userId ?? "_", opts),
    queryFn: () => {
      const qs = buildAttendanceQueryParams(opts);
      return api.fetch<CrewAttendanceMemberHistory>(
        `/crews/${crewId}/members/${userId}/attendance-history${qs ? `?${qs}` : ""}`,
      );
    },
    enabled: !!crewId && !!userId,
  });
}

export function useCrewAttendanceStats(crewId: string, opts?: CrewAttendanceStatsQuery) {
  return useQuery({
    queryKey: attendanceKeys.crew(crewId, opts),
    queryFn: () => {
      const qs = buildAttendanceQueryParams(opts);
      return api.fetch<CrewAttendanceStats>(
        `/crews/${crewId}/attendance-stats${qs ? `?${qs}` : ""}`,
      );
    },
    enabled: !!crewId,
  });
}
