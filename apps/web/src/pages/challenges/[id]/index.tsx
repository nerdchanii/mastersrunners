import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Users, Target, User, Trash2, LogOut, UserPlus, Edit } from "lucide-react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import ProgressBar from "@/components/challenge/ProgressBar";
import LeaderboardTable from "@/components/challenge/LeaderboardTable";
import ChallengeTeams from "@/components/challenge/ChallengeTeams";

interface ChallengeUser {
  id: string;
  name: string;
  profileImage: string | null;
}

interface ChallengeDetail {
  id: string;
  name: string;
  description: string | null;
  goalType: string;
  goalValue: number;
  startDate: string;
  endDate: string;
  isPublic: boolean;
  createdBy: string;
  creator?: ChallengeUser;
  _count?: { participants: number };
  isJoined?: boolean;
  myProgress?: number | null;
}

interface LeaderboardEntry {
  rank: number;
  progress: number;
  user: ChallengeUser;
}

function goalTypeLabel(type: string): string {
  switch (type) {
    case "DISTANCE": return "거리";
    case "FREQUENCY": return "횟수";
    case "STREAK": return "연속";
    case "PACE": return "페이스";
    default: return type;
  }
}

function goalTypeUnit(type: string): string {
  switch (type) {
    case "DISTANCE": return "KM";
    case "FREQUENCY": return "COUNT";
    case "STREAK": return "DAYS";
    case "PACE": return "SEC_PER_KM";
    default: return type;
  }
}

function goalTypeDisplayUnit(type: string): string {
  switch (type) {
    case "DISTANCE": return "km";
    case "FREQUENCY": return "회";
    case "STREAK": return "일";
    case "PACE": return "";
    default: return "";
  }
}

type DetailTab = "info" | "leaderboard" | "teams";

export default function ChallengeDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const challengeId = params.id as string;

  const [challenge, setChallenge] = useState<ChallengeDetail | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activeTab, setActiveTab] = useState<DetailTab>("info");
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showProgressForm, setShowProgressForm] = useState(false);
  const [progressValue, setProgressValue] = useState("");

  useEffect(() => {
    if (!challengeId || challengeId === "_") return;
    fetchChallenge();
  }, [challengeId]);

  useEffect(() => {
    if (activeTab === "leaderboard" && challengeId && challengeId !== "_") {
      fetchLeaderboard();
    }
  }, [activeTab, challengeId]);

  const fetchChallenge = async () => {
    try {
      setIsLoading(true);
      const data = await api.fetch<ChallengeDetail>(`/challenges/${challengeId}`);
      setChallenge(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "챌린지 정보를 불러올 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLeaderboardLoading(true);
      const data = await api.fetch<LeaderboardEntry[]>(`/challenges/${challengeId}/leaderboard?limit=50`);
      setLeaderboard(data);
    } catch {
      // silently fail
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const handleJoin = async () => {
    setActionLoading(true);
    try {
      await api.fetch(`/challenges/${challengeId}/join`, { method: "POST" });
      await fetchChallenge();
    } catch (err) {
      alert(err instanceof Error ? err.message : "참가에 실패했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!confirm("챌린지를 나가시겠습니까?")) return;
    setActionLoading(true);
    try {
      await api.fetch(`/challenges/${challengeId}/leave`, { method: "DELETE" });
      await fetchChallenge();
    } catch (err) {
      alert(err instanceof Error ? err.message : "챌린지 나가기에 실패했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteChallenge = async () => {
    if (!confirm("챌린지를 삭제하시겠습니까?")) return;
    try {
      await api.fetch(`/challenges/${challengeId}`, { method: "DELETE" });
      navigate("/challenges");
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    }
  };

  const handleUpdateProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!progressValue || Number(progressValue) < 0) return;
    setActionLoading(true);
    try {
      await api.fetch(`/challenges/${challengeId}/progress`, {
        method: "PATCH",
        body: JSON.stringify({ currentValue: Number(progressValue) }),
      });
      setShowProgressForm(false);
      setProgressValue("");
      await fetchChallenge();
      if (activeTab === "leaderboard") await fetchLeaderboard();
    } catch (err) {
      alert(err instanceof Error ? err.message : "진행도 업데이트에 실패했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  if (!challengeId || challengeId === "_") {
    return (
      <div className="container max-w-3xl py-12 text-center">
        <p className="text-muted-foreground">챌린지 ID가 필요합니다.</p>
        <Button variant="link" onClick={() => navigate("/challenges")} className="mt-4">
          챌린지 목록으로 돌아가기
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-6">
        <div className="space-y-6">
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="container max-w-3xl py-6">
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-destructive mb-2">오류</h2>
            <p className="text-destructive/90">{error || "챌린지를 찾을 수 없습니다."}</p>
            <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">
              돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwner = user?.id === challenge.createdBy;
  const now = new Date();
  const startDate = new Date(challenge.startDate);
  const endDate = new Date(challenge.endDate);
  const isActive = now >= startDate && now <= endDate;
  const isUpcoming = now < startDate;
  const participantCount = challenge._count?.participants ?? 0;

  const statusBadge = () => {
    if (isActive) return { label: "진행중", variant: "default" as const };
    if (isUpcoming) return { label: "예정", variant: "secondary" as const };
    return { label: "완료", variant: "outline" as const };
  };

  const badge = statusBadge();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 min-w-0 flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{challenge.name}</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={badge.variant}>{badge.label}</Badge>
            {!challenge.isPublic && (
              <Badge variant="outline" className="bg-yellow-50">비공개</Badge>
            )}
            {challenge.isJoined && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                참가중
              </Badge>
            )}
          </div>
        </div>
        {isOwner && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteChallenge}
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DetailTab)}>
        <TabsList variant="line">
          <TabsTrigger value="info">정보</TabsTrigger>
          <TabsTrigger value="leaderboard">리더보드</TabsTrigger>
          <TabsTrigger value="teams">팀</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-6">
              {challenge.description && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">설명</h3>
                  <p className="text-foreground whitespace-pre-wrap">{challenge.description}</p>
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="size-4" />
                    <span className="text-sm font-medium">기간</span>
                  </div>
                  <p className="text-sm">{formatDate(challenge.startDate)} ~ {formatDate(challenge.endDate)}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Target className="size-4" />
                    <span className="text-sm font-medium">목표</span>
                  </div>
                  <p className="text-sm">
                    {goalTypeLabel(challenge.goalType)} {challenge.goalValue} {goalTypeDisplayUnit(challenge.goalType)}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="size-4" />
                    <span className="text-sm font-medium">참가자</span>
                  </div>
                  <p className="text-sm">{participantCount}명</p>
                </div>

                {challenge.creator && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="size-4" />
                      <span className="text-sm font-medium">만든이</span>
                    </div>
                    <p className="text-sm">{challenge.creator.name}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {!isOwner && (
            <div className="flex gap-3">
              {challenge.isJoined ? (
                <Button
                  variant="destructive"
                  onClick={handleLeave}
                  disabled={actionLoading}
                >
                  <LogOut className="mr-2 size-4" />
                  {actionLoading ? "처리중..." : "나가기"}
                </Button>
              ) : (
                <Button
                  onClick={handleJoin}
                  disabled={actionLoading || (!isActive && !isUpcoming)}
                >
                  <UserPlus className="mr-2 size-4" />
                  {actionLoading ? "처리중..." : "참가하기"}
                </Button>
              )}
            </div>
          )}

          {challenge.isJoined && (
            <Card>
              <CardHeader>
                <CardTitle>내 진행 현황</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ProgressBar
                  current={challenge.myProgress ?? 0}
                  target={challenge.goalValue}
                  unit={goalTypeUnit(challenge.goalType)}
                />

                {isActive && (
                  <div>
                    {!showProgressForm ? (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => setShowProgressForm(true)}
                        className="px-0"
                      >
                        <Edit className="mr-2 size-4" />
                        진행도 업데이트
                      </Button>
                    ) : (
                      <form onSubmit={handleUpdateProgress} className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            type="number"
                            value={progressValue}
                            onChange={(e) => setProgressValue(e.target.value)}
                            min="0"
                            step="any"
                            placeholder="새 진행 값"
                          />
                          {goalTypeDisplayUnit(challenge.goalType) && (
                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                              <span className="text-xs text-muted-foreground">
                                {goalTypeDisplayUnit(challenge.goalType)}
                              </span>
                            </div>
                          )}
                        </div>
                        <Button
                          type="submit"
                          disabled={actionLoading || !progressValue}
                          size="sm"
                        >
                          {actionLoading ? "..." : "업데이트"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowProgressForm(false);
                            setProgressValue("");
                          }}
                        >
                          취소
                        </Button>
                      </form>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle>개인 리더보드</CardTitle>
            </CardHeader>
            <CardContent>
              <LeaderboardTable
                entries={leaderboard}
                goalValue={challenge.goalValue}
                goalType={challenge.goalType}
                isLoading={leaderboardLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams">
          <ChallengeTeams challengeId={challengeId} isJoined={challenge.isJoined ?? false} />
        </TabsContent>
      </Tabs>

      <div className="flex justify-center pt-4">
        <Button variant="outline" onClick={() => navigate("/challenges")}>
          목록으로
        </Button>
      </div>
    </div>
  );
}
