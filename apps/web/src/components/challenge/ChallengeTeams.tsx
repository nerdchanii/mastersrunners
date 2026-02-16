import { useState, useEffect } from "react";
import { Users, Plus, LogOut, UserPlus, Trophy } from "lucide-react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { cn } from "@/lib/utils";
import TeamLeaderboard from "./TeamLeaderboard";

interface TeamMember {
  id: string;
  name: string;
  profileImage: string | null;
}

interface Team {
  id: string;
  name: string;
  _count?: { members: number };
  members?: TeamMember[];
  aggregateProgress?: number;
}

interface ChallengeTeamsProps {
  challengeId: string;
  isJoined: boolean;
}

export default function ChallengeTeams({ challengeId, isJoined }: ChallengeTeamsProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, [challengeId]);

  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      const data = await api.fetch<Team[]>(`/challenges/${challengeId}/teams`);
      setTeams(data);

      // Find my team
      const myTeamData = data.find((team) => team.members?.some((member) => member.id === "me"));
      setMyTeam(myTeamData || null);
    } catch (err) {
      console.error("Failed to fetch teams:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    setActionLoading(true);
    try {
      await api.fetch(`/challenges/${challengeId}/teams`, {
        method: "POST",
        body: JSON.stringify({ name: newTeamName }),
      });
      setNewTeamName("");
      setShowCreateForm(false);
      await fetchTeams();
    } catch (err) {
      alert(err instanceof Error ? err.message : "팀 생성에 실패했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinTeam = async (teamId: string) => {
    setActionLoading(true);
    try {
      await api.fetch(`/challenges/${challengeId}/teams/${teamId}/join`, {
        method: "POST",
      });
      await fetchTeams();
    } catch (err) {
      alert(err instanceof Error ? err.message : "팀 가입에 실패했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveTeam = async (teamId: string) => {
    if (!confirm("팀을 나가시겠습니까?")) return;

    setActionLoading(true);
    try {
      await api.fetch(`/challenges/${challengeId}/teams/${teamId}/leave`, {
        method: "DELETE",
      });
      await fetchTeams();
    } catch (err) {
      alert(err instanceof Error ? err.message : "팀 나가기에 실패했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  if (!isJoined) {
    return (
      <Card>
        <CardContent className="pt-6">
          <EmptyState
            icon={Users}
            title="챌린지에 참가해주세요"
            description="팀 기능을 사용하려면 먼저 챌린지에 참가해야 합니다"
          />
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">팀</h3>
          <p className="text-sm text-muted-foreground">
            팀을 만들고 함께 목표를 달성하세요
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLeaderboard(!showLeaderboard)}
          >
            <Trophy className="mr-2 size-4" />
            {showLeaderboard ? "팀 목록" : "팀 순위"}
          </Button>
          {!myTeam && (
            <Button size="sm" onClick={() => setShowCreateForm(!showCreateForm)}>
              <Plus className="mr-2 size-4" />
              팀 만들기
            </Button>
          )}
        </div>
      </div>

      {showCreateForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleCreateTeam} className="flex gap-2">
              <Input
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="팀 이름"
                maxLength={50}
              />
              <Button type="submit" disabled={actionLoading || !newTeamName.trim()}>
                {actionLoading ? "생성중..." : "생성"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewTeamName("");
                }}
              >
                취소
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {showLeaderboard ? (
        <TeamLeaderboard challengeId={challengeId} />
      ) : (
        <>
          {myTeam && (
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="size-5 text-primary" />
                    내 팀: {myTeam.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLeaveTeam(myTeam.id)}
                    disabled={actionLoading}
                  >
                    <LogOut className="mr-2 size-4" />
                    나가기
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">멤버</span>
                    <span className="font-medium">{myTeam._count?.members ?? 0}명</span>
                  </div>
                  {myTeam.aggregateProgress !== undefined && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">팀 진행도</span>
                      <span className="font-medium">{myTeam.aggregateProgress.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {teams.length === 0 ? (
            <EmptyState
              icon={Users}
              title="아직 팀이 없습니다"
              description="첫 번째 팀을 만들어보세요"
              actionLabel="팀 만들기"
              onAction={() => setShowCreateForm(true)}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {teams
                .filter((team) => team.id !== myTeam?.id)
                .map((team) => (
                  <Card key={team.id} className={cn("hover:shadow-md transition-shadow")}>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Users className="size-4" />
                        {team.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">멤버</span>
                        <span className="font-medium">{team._count?.members ?? 0}명</span>
                      </div>
                      {team.aggregateProgress !== undefined && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">팀 진행도</span>
                          <span className="font-medium">{team.aggregateProgress.toFixed(1)}</span>
                        </div>
                      )}
                      {!myTeam && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => handleJoinTeam(team.id)}
                          disabled={actionLoading}
                        >
                          <UserPlus className="mr-2 size-4" />
                          가입하기
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
