import { useCallback } from "react";
import { toast } from "sonner";

import {
  useChallenge,
  useChallengeLeaderboard,
  useDeleteChallenge,
  useInvalidateDeletedChallenges,
  useJoinChallenge,
  useLeaveChallenge,
  useUpdateChallengeProgress,
} from "@/hooks/useChallenges";

type DetailTab = "info" | "leaderboard" | "teams";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useChallengeDetailPage(
  challengeId: string,
  activeTab: DetailTab,
  onDeleteSuccess: () => void,
) {
  const challengeQuery = useChallenge(challengeId);
  const challenge = challengeQuery.data ?? null;
  const canLoadAuxiliaryQueries = challengeQuery.isSuccess && !!challengeId && challengeId !== "_";
  const leaderboardQuery = useChallengeLeaderboard(challengeId, {
    enabled: canLoadAuxiliaryQueries && activeTab === "leaderboard",
  });
  const joinMutation = useJoinChallenge();
  const leaveMutation = useLeaveChallenge();
  const deleteMutation = useDeleteChallenge();
  const invalidateDeletedChallenges = useInvalidateDeletedChallenges();
  const updateProgressMutation = useUpdateChallengeProgress();
  const error = challengeQuery.error
    ? getErrorMessage(challengeQuery.error, "챌린지 정보를 불러올 수 없습니다.")
    : null;
  const leaderboardError = leaderboardQuery.error
    ? getErrorMessage(leaderboardQuery.error, "리더보드를 불러오지 못했습니다.")
    : null;
  const actionLoading =
    joinMutation.isPending ||
    leaveMutation.isPending ||
    deleteMutation.isPending ||
    updateProgressMutation.isPending;

  const joinChallenge = useCallback(async () => {
    try {
      await joinMutation.mutateAsync(challengeId);
    } catch (err) {
      toast.error(getErrorMessage(err, "참가에 실패했습니다."));
    }
  }, [challengeId, joinMutation]);

  const leaveChallenge = useCallback(async () => {
    try {
      await leaveMutation.mutateAsync(challengeId);
      toast.success("챌린지에서 나갔습니다.");
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err, "챌린지 나가기에 실패했습니다."));
      return false;
    }
  }, [challengeId, leaveMutation]);

  const deleteChallenge = useCallback(async () => {
    try {
      await deleteMutation.mutateAsync(challengeId);
      toast.success("챌린지가 삭제되었습니다.");
      onDeleteSuccess();
      await invalidateDeletedChallenges();
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err, "삭제에 실패했습니다."));
      return false;
    }
  }, [challengeId, deleteMutation, invalidateDeletedChallenges, onDeleteSuccess]);

  const updateProgress = useCallback(
    async (currentValue: number) => {
      try {
        await updateProgressMutation.mutateAsync({ challengeId, currentValue });
        return true;
      } catch (err) {
        toast.error(getErrorMessage(err, "진행도 업데이트에 실패했습니다."));
        return false;
      }
    },
    [challengeId, updateProgressMutation],
  );

  return {
    actionLoading,
    challenge,
    error,
    isLoading: challengeQuery.isLoading,
    leaderboard: leaderboardQuery.data ?? [],
    leaderboardError,
    leaderboardLoading: leaderboardQuery.isLoading || leaderboardQuery.isFetching,
    deleteChallenge,
    joinChallenge,
    leaveChallenge,
    retryChallenge: challengeQuery.refetch,
    retryLeaderboard: leaderboardQuery.refetch,
    updateProgress,
  };
}
