import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { api } from "@/lib/api-client";

interface EventUser {
  id: string;
  name: string;
  profileImage: string | null;
}

export interface EventDetail {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string | null;
  eventType: string | null;
  distance: number | null;
  maxParticipants: number | null;
  registrationDeadline: string | null;
  externalUrl: string | null;
  organizerId: string;
  creator?: EventUser;
  _count?: { participants: number };
  isRegistered?: boolean;
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
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [results, setResults] = useState<EventResult[]>([]);
  const [myResult, setMyResult] = useState<MyResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchEvent = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.fetch<EventDetail>(`/events/${eventId}`);
      setEvent(data);

      try {
        const my = await api.fetch<MyResult>(`/events/${eventId}/results/me`);
        setMyResult(my);
      } catch {
        setMyResult(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "대회 정보를 불러올 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

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

    void fetchEvent();
  }, [eventId, fetchEvent]);

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
      await fetchEvent();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "참가 등록에 실패했습니다.");
    } finally {
      setActionLoading(false);
    }
  }, [eventId, fetchEvent]);

  const cancelRegistration = useCallback(async () => {
    setActionLoading(true);
    try {
      await api.fetch(`/events/${eventId}/cancel`, { method: "DELETE" });
      await fetchEvent();
      setMyResult(null);
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "참가 취소에 실패했습니다.");
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [eventId, fetchEvent]);

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
        await fetchEvent();
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
    [activeTab, eventId, fetchEvent, fetchResults],
  );

  const linkWorkout = useCallback(
    async (workoutId: string) => {
      setActionLoading(true);
      try {
        await api.fetch(`/events/${eventId}/link-workout`, {
          method: "POST",
          body: JSON.stringify({ workoutId }),
        });
        await fetchEvent();
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "워크아웃 연결에 실패했습니다.");
        return false;
      } finally {
        setActionLoading(false);
      }
    },
    [eventId, fetchEvent],
  );

  const unlinkWorkout = useCallback(async () => {
    setActionLoading(true);
    try {
      await api.fetch(`/events/${eventId}/link-workout`, { method: "DELETE" });
      await fetchEvent();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "워크아웃 연결 해제에 실패했습니다.");
    } finally {
      setActionLoading(false);
    }
  }, [eventId, fetchEvent]);

  return {
    actionLoading,
    error,
    event,
    isLoading,
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
