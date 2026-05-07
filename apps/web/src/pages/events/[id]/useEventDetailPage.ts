import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { type AppQueryKey, invalidateQueryKeys } from "@/hooks/query-key-utils";
import { eventInvalidationTargets, useEvent } from "@/hooks/useEvents";
import { api } from "@/lib/api-client";

interface EventUser {
  id: string;
  name: string;
  profileImage: string | null;
}

export interface EventResult {
  resultRank: number | null;
  bibNumber: string | null;
  resultTime: number | null;
  status: string;
  user: EventUser;
  workoutId?: string | null;
}

export interface MyResult {
  resultRank: number | null;
  bibNumber: string | null;
  resultTime: number | null;
  status: string;
  workoutId: string | null;
  goalTime?: number | null;
}

type DetailTab = "info" | "results";

export function useEventDetailPage(
  eventId: string,
  activeTab: DetailTab,
  onDeleteSuccess: () => void,
) {
  const queryClient = useQueryClient();
  const eventQuery = useEvent(eventId);
  const [results, setResults] = useState<EventResult[]>([]);
  const [myResult, setMyResult] = useState<MyResult | null>(null);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const event = eventQuery.data ?? null;
  const error = eventQuery.error
    ? eventQuery.error instanceof Error
      ? eventQuery.error.message
      : "대회 정보를 불러올 수 없습니다."
    : null;

  const fetchMyResult = useCallback(async () => {
    try {
      const my = await api.fetch<MyResult>(`/events/${eventId}/results/me`);
      setMyResult(my);
    } catch {
      setMyResult(null);
    }
  }, [eventId]);

  const refreshEventData = useCallback(
    async (queryKeys: readonly AppQueryKey[]) => {
      await invalidateQueryKeys(queryClient, queryKeys);
      await fetchMyResult();
    },
    [fetchMyResult, queryClient],
  );

  const fetchResults = useCallback(async () => {
    try {
      setResultsLoading(true);
      const data = await api.fetch<EventResult[]>(`/events/${eventId}/results`);
      setResults(Array.isArray(data) ? data : []);
    } catch {
      // silently fail
    } finally {
      setResultsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (!eventId || eventId === "_") {
      return;
    }

    void fetchMyResult();
  }, [eventId, fetchMyResult]);

  useEffect(() => {
    if (activeTab !== "results" || !eventId || eventId === "_") {
      return;
    }

    void fetchResults();
  }, [activeTab, eventId, fetchResults]);

  const registerEvent = useCallback(async () => {
    setActionLoading(true);
    try {
      await api.fetch(`/events/${eventId}/register`, { method: "POST" });
      await refreshEventData(eventInvalidationTargets.register(eventId));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "참가 등록에 실패했습니다.");
    } finally {
      setActionLoading(false);
    }
  }, [eventId, refreshEventData]);

  const cancelRegistration = useCallback(async () => {
    setActionLoading(true);
    try {
      await api.fetch(`/events/${eventId}/cancel`, { method: "DELETE" });
      await refreshEventData(eventInvalidationTargets.cancel(eventId));
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "참가 취소에 실패했습니다.");
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [eventId, refreshEventData]);

  const deleteEvent = useCallback(async () => {
    try {
      await api.fetch(`/events/${eventId}`, { method: "DELETE" });
      onDeleteSuccess();
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "삭제에 실패했습니다.");
      return false;
    }
  }, [eventId, onDeleteSuccess]);

  const submitResult = useCallback(
    async (body: Record<string, unknown>) => {
      setActionLoading(true);
      try {
        await api.fetch(`/events/${eventId}/results`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
        await refreshEventData(eventInvalidationTargets.submitResult(eventId));
        if (activeTab === "results") {
          await fetchResults();
        }
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "결과 등록에 실패했습니다.");
        return false;
      } finally {
        setActionLoading(false);
      }
    },
    [activeTab, eventId, fetchResults, refreshEventData],
  );

  const linkWorkout = useCallback(
    async (workoutId: string) => {
      setActionLoading(true);
      try {
        await api.fetch(`/events/${eventId}/link-workout`, {
          method: "POST",
          body: JSON.stringify({ workoutId }),
        });
        await refreshEventData(eventInvalidationTargets.linkWorkout(eventId));
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "워크아웃 연결에 실패했습니다.");
        return false;
      } finally {
        setActionLoading(false);
      }
    },
    [eventId, refreshEventData],
  );

  const unlinkWorkout = useCallback(async () => {
    setActionLoading(true);
    try {
      await api.fetch(`/events/${eventId}/link-workout`, { method: "DELETE" });
      await refreshEventData(eventInvalidationTargets.unlinkWorkout(eventId));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "워크아웃 연결 해제에 실패했습니다.");
    } finally {
      setActionLoading(false);
    }
  }, [eventId, refreshEventData]);

  return {
    actionLoading,
    error,
    event,
    isLoading: eventQuery.isLoading,
    myResult,
    results,
    resultsLoading,
    cancelRegistration,
    deleteEvent,
    linkWorkout,
    registerEvent,
    submitResult,
    unlinkWorkout,
  };
}
