import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

interface Attendee {
  id: string;
  userId: string;
  method: string;
  checkedAt: string;
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

export function useCrewActivities(crewId: string) {
  return useQuery({
    queryKey: crewActivityKeys.list(crewId),
    queryFn: () => api.fetch<ActivityDetail[]>(`/crews/${crewId}/activities`),
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
