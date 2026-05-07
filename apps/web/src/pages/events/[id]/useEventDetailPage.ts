import { useCallback } from "react";
import { toast } from "sonner";

import {
  useCancelEventRegistration,
  useDeleteEvent,
  useEvent,
  useEventMyResult,
  useEventResults,
  useInvalidateDeletedEvents,
  useLinkEventWorkout,
  useRegisterEvent,
  useSubmitEventResult,
  useUnlinkEventWorkout,
} from "@/hooks/useEvents";

type DetailTab = "info" | "results";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useEventDetailPage(
  eventId: string,
  activeTab: DetailTab,
  onDeleteSuccess: () => void,
) {
  const eventQuery = useEvent(eventId);
  const event = eventQuery.data ?? null;
  const canLoadAuxiliaryQueries = eventQuery.isSuccess && !!eventId && eventId !== "_";
  const myResultQuery = useEventMyResult(eventId, {
    enabled: canLoadAuxiliaryQueries && event?.isRegistered === true,
  });
  const resultsQuery = useEventResults(eventId, {
    enabled: canLoadAuxiliaryQueries && activeTab === "results",
  });
  const registerMutation = useRegisterEvent();
  const cancelMutation = useCancelEventRegistration();
  const deleteMutation = useDeleteEvent();
  const invalidateDeletedEvents = useInvalidateDeletedEvents();
  const submitResultMutation = useSubmitEventResult();
  const linkWorkoutMutation = useLinkEventWorkout();
  const unlinkWorkoutMutation = useUnlinkEventWorkout();
  const error = eventQuery.error
    ? getErrorMessage(eventQuery.error, "대회 정보를 불러올 수 없습니다.")
    : null;
  const myResultError = myResultQuery.error
    ? getErrorMessage(myResultQuery.error, "내 결과를 불러오지 못했습니다.")
    : null;
  const resultsError = resultsQuery.error
    ? getErrorMessage(resultsQuery.error, "대회 결과를 불러오지 못했습니다.")
    : null;
  const actionLoading =
    registerMutation.isPending ||
    cancelMutation.isPending ||
    deleteMutation.isPending ||
    submitResultMutation.isPending ||
    linkWorkoutMutation.isPending ||
    unlinkWorkoutMutation.isPending;

  const registerEvent = useCallback(async () => {
    try {
      await registerMutation.mutateAsync(eventId);
    } catch (err) {
      toast.error(getErrorMessage(err, "참가 등록에 실패했습니다."));
    }
  }, [eventId, registerMutation]);

  const cancelRegistration = useCallback(async () => {
    try {
      await cancelMutation.mutateAsync(eventId);
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err, "참가 취소에 실패했습니다."));
      return false;
    }
  }, [cancelMutation, eventId]);

  const deleteEvent = useCallback(async () => {
    try {
      await deleteMutation.mutateAsync(eventId);
      onDeleteSuccess();
      await invalidateDeletedEvents();
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err, "삭제에 실패했습니다."));
      return false;
    }
  }, [deleteMutation, eventId, invalidateDeletedEvents, onDeleteSuccess]);

  const submitResult = useCallback(
    async (body: Record<string, unknown>) => {
      try {
        await submitResultMutation.mutateAsync({ body, eventId });
        return true;
      } catch (err) {
        toast.error(getErrorMessage(err, "결과 등록에 실패했습니다."));
        return false;
      }
    },
    [eventId, submitResultMutation],
  );

  const linkWorkout = useCallback(
    async (workoutId: string) => {
      try {
        await linkWorkoutMutation.mutateAsync({ eventId, workoutId });
        return true;
      } catch (err) {
        toast.error(getErrorMessage(err, "워크아웃 연결에 실패했습니다."));
        return false;
      }
    },
    [eventId, linkWorkoutMutation],
  );

  const unlinkWorkout = useCallback(async () => {
    try {
      await unlinkWorkoutMutation.mutateAsync({ eventId });
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err, "워크아웃 연결 해제에 실패했습니다."));
      return false;
    }
  }, [eventId, unlinkWorkoutMutation]);

  return {
    actionLoading,
    error,
    event,
    isLoading: eventQuery.isLoading,
    myResult: myResultQuery.data ?? null,
    myResultError,
    myResultLoading: myResultQuery.isLoading || myResultQuery.isFetching,
    results: resultsQuery.data ?? [],
    resultsError,
    resultsLoading: resultsQuery.isLoading || resultsQuery.isFetching,
    cancelRegistration,
    deleteEvent,
    linkWorkout,
    registerEvent,
    retryMyResult: myResultQuery.refetch,
    retryResults: resultsQuery.refetch,
    submitResult,
    unlinkWorkout,
  };
}
