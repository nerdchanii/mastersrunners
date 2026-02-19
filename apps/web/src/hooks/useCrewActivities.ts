import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

interface Attendee {
  id: string;
  userId: string;
  status: string; // "RSVP" | "CHECKED_IN" | "NO_SHOW" | "CANCELLED"
  method: string | null;
  rsvpAt: string;
  checkedAt: string | null;
  checkedBy: string | null;
  user?: {
    id: string;
    name: string;
    profileImage: string | null;
  };
}

export interface ActivityDetail {
  id: string;
  crewId: string;
  title: string;
  description: string | null;
  activityDate: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  createdBy: string;
  createdAt: string;
  qrCode: string;
  activityType: string; // "OFFICIAL" | "POP_UP"
  status: string; // "SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELLED"
  completedAt: string | null;
  workoutTypeId: string | null;
  attendances: Attendee[];
}

export const crewActivityKeys = {
  all: (crewId: string) => ["crews", crewId, "activities"] as const,
  list: (crewId: string) => [...crewActivityKeys.all(crewId), "list"] as const,
  detail: (crewId: string, activityId: string) =>
    [...crewActivityKeys.all(crewId), "detail", activityId] as const,
};

export function useCrewActivity(crewId: string, activityId: string) {
  return useQuery({
    queryKey: crewActivityKeys.detail(crewId, activityId),
    queryFn: () => api.fetch<ActivityDetail>(`/crews/${crewId}/activities/${activityId}`),
    enabled: !!crewId && !!activityId,
  });
}

export interface ActivitiesResponse {
  items: ActivityDetail[];
  nextCursor: string | null;
}

export function useCrewActivities(
  crewId: string,
  opts?: { type?: string; status?: string },
) {
  return useQuery({
    queryKey: [...crewActivityKeys.list(crewId), opts] as const,
    queryFn: () => {
      const params = new URLSearchParams();
      if (opts?.type) params.set("type", opts.type);
      if (opts?.status) params.set("status", opts.status);
      const qs = params.toString();
      return api.fetch<ActivitiesResponse>(
        `/crews/${crewId}/activities${qs ? `?${qs}` : ""}`,
      );
    },
    enabled: !!crewId,
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      crewId,
      activityId,
      data,
    }: {
      crewId: string;
      activityId: string;
      data: {
        title?: string;
        description?: string;
        location?: string;
        activityDate?: string;
        activityType?: string;
      };
    }) =>
      api.fetch(`/crews/${crewId}/activities/${activityId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: (_result, { crewId }) => {
      queryClient.invalidateQueries({ queryKey: crewActivityKeys.all(crewId) });
    },
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ crewId, activityId }: { crewId: string; activityId: string }) =>
      api.fetch(`/crews/${crewId}/activities/${activityId}`, {
        method: "DELETE",
      }),
    onSuccess: (_result, { crewId }) => {
      queryClient.invalidateQueries({ queryKey: crewActivityKeys.all(crewId) });
    },
  });
}

export function useCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      crewId,
      activityId,
      method,
    }: {
      crewId: string;
      activityId: string;
      method: string;
    }) =>
      api.fetch(`/crews/${crewId}/activities/${activityId}/check-in`, {
        method: "POST",
        body: JSON.stringify({ method }),
      }),
    onSuccess: (_result, { crewId, activityId }) => {
      queryClient.invalidateQueries({
        queryKey: crewActivityKeys.detail(crewId, activityId),
      });
    },
  });
}

export function useRsvp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ crewId, activityId }: { crewId: string; activityId: string }) =>
      api.fetch(`/crews/${crewId}/activities/${activityId}/rsvp`, { method: "POST" }),
    onSuccess: (_r, { crewId, activityId }) => {
      queryClient.invalidateQueries({ queryKey: crewActivityKeys.detail(crewId, activityId) });
    },
  });
}

export function useCancelRsvp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ crewId, activityId }: { crewId: string; activityId: string }) =>
      api.fetch(`/crews/${crewId}/activities/${activityId}/rsvp`, { method: "DELETE" }),
    onSuccess: (_r, { crewId, activityId }) => {
      queryClient.invalidateQueries({ queryKey: crewActivityKeys.detail(crewId, activityId) });
    },
  });
}

export function useCompleteActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ crewId, activityId }: { crewId: string; activityId: string }) =>
      api.fetch(`/crews/${crewId}/activities/${activityId}/complete`, { method: "POST" }),
    onSuccess: (_r, { crewId }) => {
      queryClient.invalidateQueries({ queryKey: crewActivityKeys.all(crewId) });
    },
  });
}

export function useCancelActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ crewId, activityId }: { crewId: string; activityId: string }) =>
      api.fetch(`/crews/${crewId}/activities/${activityId}/cancel`, { method: "POST" }),
    onSuccess: (_r, { crewId }) => {
      queryClient.invalidateQueries({ queryKey: crewActivityKeys.all(crewId) });
    },
  });
}

export function useAdminCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ crewId, activityId, userId }: { crewId: string; activityId: string; userId: string }) =>
      api.fetch(`/crews/${crewId}/activities/${activityId}/admin-check-in`, {
        method: "POST",
        body: JSON.stringify({ userId }),
      }),
    onSuccess: (_r, { crewId, activityId }) => {
      queryClient.invalidateQueries({ queryKey: crewActivityKeys.detail(crewId, activityId) });
    },
  });
}
