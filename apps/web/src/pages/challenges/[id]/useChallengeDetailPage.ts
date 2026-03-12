import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { api } from "@/lib/api-client";

interface ChallengeUser {
  id: string;
  name: string;
  profileImage: string | null;
}

export interface ChallengeDetail {
  id: string;
  title: string;
  description: string | null;
  type: string;
  targetValue: number;
  targetUnit: string;
  startDate: string;
  endDate: string;
  isPublic: boolean;
  creatorId: string;
  creator?: ChallengeUser;
  _count?: { participants: number };
  isJoined?: boolean;
  myProgress?: number | null;
}

export interface LeaderboardEntry {
  rank: number;
  progress: number;
  user: ChallengeUser;
}

type DetailTab = "info" | "leaderboard" | "teams";

export function useChallengeDetailPage(
  challengeId: string,
  activeTab: DetailTab,
  onDeleteSuccess: () => void,
) {
  const [challenge, setChallenge] = useState<ChallengeDetail | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchChallenge = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.fetch<ChallengeDetail>(`/challenges/${challengeId}`);
      setChallenge(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "챌린지 정보를 불러올 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [challengeId]);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLeaderboardLoading(true);
      const data = await api.fetch<LeaderboardEntry[]>(
        `/challenges/${challengeId}/leaderboard?limit=50`,
      );
      setLeaderboard(Array.isArray(data) ? data : []);
    } catch {
      // silently fail
    } finally {
      setLeaderboardLoading(false);
    }
  }, [challengeId]);

  useEffect(() => {
    if (!challengeId || challengeId === "_") {
      return;
    }

    void fetchChallenge();
  }, [challengeId, fetchChallenge]);

  useEffect(() => {
    if (activeTab !== "leaderboard" || !challengeId || challengeId === "_") {
      return;
    }

    void fetchLeaderboard();
  }, [activeTab, challengeId, fetchLeaderboard]);

  const joinChallenge = useCallback(async () => {
    setActionLoading(true);
    try {
      await api.fetch(`/challenges/${challengeId}/join`, { method: "POST" });
      await fetchChallenge();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "참가에 실패했습니다.");
    } finally {
      setActionLoading(false);
    }
  }, [challengeId, fetchChallenge]);

  const leaveChallenge = useCallback(async () => {
    setActionLoading(true);
    try {
      await api.fetch(`/challenges/${challengeId}/leave`, { method: "DELETE" });
      await fetchChallenge();
      toast.success("챌린지에서 나갔습니다.");
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "챌린지 나가기에 실패했습니다.");
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [challengeId, fetchChallenge]);

  const deleteChallenge = useCallback(async () => {
    try {
      await api.fetch(`/challenges/${challengeId}`, { method: "DELETE" });
      toast.success("챌린지가 삭제되었습니다.");
      onDeleteSuccess();
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "삭제에 실패했습니다.");
      return false;
    }
  }, [challengeId, onDeleteSuccess]);

  const updateProgress = useCallback(
    async (currentValue: number) => {
      setActionLoading(true);
      try {
        await api.fetch(`/challenges/${challengeId}/progress`, {
          method: "PATCH",
          body: JSON.stringify({ currentValue }),
        });
        await fetchChallenge();
        if (activeTab === "leaderboard") {
          await fetchLeaderboard();
        }
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "진행도 업데이트에 실패했습니다.");
        return false;
      } finally {
        setActionLoading(false);
      }
    },
    [activeTab, challengeId, fetchChallenge, fetchLeaderboard],
  );

  return {
    actionLoading,
    challenge,
    error,
    isLoading,
    leaderboard,
    leaderboardLoading,
    deleteChallenge,
    joinChallenge,
    leaveChallenge,
    updateProgress,
  };
}
