import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import EventResultsTable from "@/components/event/EventResultsTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { UserAvatar } from "@/components/common/UserAvatar";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ExternalLink,
  Trophy,
  Trash2,
  UserMinus,
  UserPlus,
  Link as LinkIcon,
  Unlink,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EventUser {
  id: string;
  name: string;
  profileImage: string | null;
}

interface EventDetail {
  id: string;
  name: string;
  description: string | null;
  date: string;
  location: string | null;
  eventType: string | null;
  distance: number | null;
  maxParticipants: number | null;
  registrationDeadline: string | null;
  externalUrl: string | null;
  createdBy: string;
  creator?: EventUser;
  _count?: { participants: number };
  isRegistered?: boolean;
}

interface EventResult {
  resultRank: number | null;
  bibNumber: string | null;
  resultTime: number | null;
  status: string;
  user: EventUser;
  workoutId?: string | null;
}

interface MyResult {
  resultRank: number | null;
  bibNumber: string | null;
  resultTime: number | null;
  status: string;
  workoutId: string | null;
  goalTime?: number | null;
}

type DetailTab = "info" | "results";

const EVENT_TYPE_LABELS: Record<string, string> = {
  MARATHON: "마라톤",
  HALF: "하프",
  TEN_K: "10K",
  FIVE_K: "5K",
  ULTRA: "울트라",
  TRAIL: "트레일",
  OTHER: "기타",
};

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function parseTimeInput(input: string): number | null {
  const parts = input.split(":").map(Number);
  if (parts.some(isNaN)) return null;

  let seconds = 0;
  if (parts.length === 3) {
    seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    seconds = parts[0] * 60 + parts[1];
  } else {
    return null;
  }
  return seconds;
}

export default function EventDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [results, setResults] = useState<EventResult[]>([]);
  const [myResult, setMyResult] = useState<MyResult | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>("info");
  const [isLoading, setIsLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Dialogs
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Result input state
  const [showResultForm, setShowResultForm] = useState(false);
  const [resultTime, setResultTime] = useState("");
  const [resultRank, setResultRank] = useState("");
  const [resultBib, setResultBib] = useState("");
  const [resultStatus, setResultStatus] = useState("COMPLETED");

  // Workout link state
  const [showWorkoutLink, setShowWorkoutLink] = useState(false);
  const [workoutId, setWorkoutId] = useState("");

  useEffect(() => {
    if (!eventId || eventId === "_") return;
    fetchEvent();
  }, [eventId]);

  useEffect(() => {
    if (activeTab === "results" && eventId && eventId !== "_") {
      fetchResults();
    }
  }, [activeTab, eventId]);

  const fetchEvent = async () => {
    try {
      setIsLoading(true);
      const data = await api.fetch<EventDetail>(`/events/${eventId}`);
      setEvent(data);

      // Fetch my result
      try {
        const my = await api.fetch<MyResult>(`/events/${eventId}/results/me`);
        setMyResult(my);
      } catch {
        // No result yet
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "대회 정보를 불러올 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      setResultsLoading(true);
      const data = await api.fetch<EventResult[]>(`/events/${eventId}/results`);
      setResults(Array.isArray(data) ? data : []);
    } catch {
      // silently fail
    } finally {
      setResultsLoading(false);
    }
  };

  const handleRegister = async () => {
    setActionLoading(true);
    try {
      await api.fetch(`/events/${eventId}/register`, { method: "POST" });
      await fetchEvent();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "참가 등록에 실패했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      await api.fetch(`/events/${eventId}/cancel`, { method: "DELETE" });
      await fetchEvent();
      setMyResult(null);
      setShowCancelDialog(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "참가 취소에 실패했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    try {
      await api.fetch(`/events/${eventId}`, { method: "DELETE" });
      navigate("/events");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    }
  };

  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const body: Record<string, unknown> = { status: resultStatus };
      if (resultTime) {
        const seconds = parseTimeInput(resultTime);
        if (seconds !== null) body.resultTime = seconds;
      }
      if (resultRank) body.resultRank = Number(resultRank);
      if (resultBib) body.bibNumber = resultBib;

      await api.fetch(`/events/${eventId}/results`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
      setShowResultForm(false);
      await fetchEvent();
      if (activeTab === "results") await fetchResults();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "결과 등록에 실패했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLinkWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workoutId.trim()) return;
    setActionLoading(true);
    try {
      await api.fetch(`/events/${eventId}/link-workout`, {
        method: "POST",
        body: JSON.stringify({ workoutId: workoutId.trim() }),
      });
      setShowWorkoutLink(false);
      setWorkoutId("");
      await fetchEvent();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "워크아웃 연결에 실패했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnlinkWorkout = async () => {
    setActionLoading(true);
    try {
      await api.fetch(`/events/${eventId}/link-workout`, { method: "DELETE" });
      await fetchEvent();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "워크아웃 연결 해제에 실패했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  // Placeholder guard
  if (!eventId || eventId === "_") {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <p className="text-muted-foreground">대회 ID가 필요합니다.</p>
        <Button variant="link" onClick={() => navigate("/events")} className="mt-4">
          대회 목록으로 돌아가기
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-muted rounded w-1/2" />
          <div className="h-6 bg-muted rounded w-3/4" />
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">오류</CardTitle>
            <CardDescription>{error || "대회를 찾을 수 없습니다."}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => navigate(-1)}>
              돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwner = user?.id === event.createdBy;
  const eventDate = new Date(event.date);
  const isPast = eventDate < new Date();
  const participantCount = event._count?.participants ?? 0;
  const isFull = event.maxParticipants != null && participantCount >= event.maxParticipants;

  const month = eventDate.toLocaleDateString("ko-KR", { month: "short" });
  const day = eventDate.getDate();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={() => navigate("/events")}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        목록으로
      </Button>

      {/* Header */}
      <div className="flex items-start gap-6">
        {/* Large Calendar Badge */}
        <div
          className={cn(
            "flex flex-col items-center justify-center w-24 h-24 rounded-xl flex-shrink-0 shadow-sm",
            isPast ? "bg-muted" : "bg-primary/10 border-2 border-primary/20"
          )}
        >
          <span
            className={cn(
              "text-sm font-medium uppercase tracking-wide",
              isPast ? "text-muted-foreground" : "text-primary"
            )}
          >
            {month}
          </span>
          <span
            className={cn(
              "text-3xl font-bold leading-none mt-1",
              isPast ? "text-foreground" : "text-primary"
            )}
          >
            {day}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-foreground mb-3">{event.name}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={isPast ? "secondary" : "default"}>
              {isPast ? "종료" : "예정"}
            </Badge>
            {event.eventType && (
              <Badge variant="outline">{EVENT_TYPE_LABELS[event.eventType] || event.eventType}</Badge>
            )}
            {event.isRegistered && (
              <Badge variant="default" className="bg-green-600">
                참가 등록 완료
              </Badge>
            )}
          </div>
        </div>

        {isOwner && (
          <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            삭제
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        <button
          onClick={() => setActiveTab("info")}
          className={cn(
            "px-4 py-2.5 font-medium text-sm transition-all relative",
            activeTab === "info" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          대회 정보
          {activeTab === "info" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        </button>
        <button
          onClick={() => setActiveTab("results")}
          className={cn(
            "px-4 py-2.5 font-medium text-sm transition-all relative",
            activeTab === "results" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          결과
          {activeTab === "results" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        </button>
      </div>

      {/* Info Tab */}
      {activeTab === "info" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>대회 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {event.description && (
                <div>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {event.description}
                  </p>
                  <Separator className="mt-6" />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">날짜</p>
                    <p className="text-foreground font-medium">
                      {eventDate.toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        weekday: "long",
                      })}
                    </p>
                  </div>
                </div>

                {event.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">장소</p>
                      <p className="text-foreground font-medium">{event.location}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">참가자</p>
                    <p className="text-foreground font-medium">
                      {participantCount}명
                      {event.maxParticipants ? ` / ${event.maxParticipants}명` : ""}
                    </p>
                  </div>
                </div>

                {event.distance && (
                  <div className="flex items-start gap-3">
                    <Trophy className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">거리</p>
                      <p className="text-foreground font-medium">{(event.distance / 1000).toFixed(1)} km</p>
                    </div>
                  </div>
                )}

                {event.registrationDeadline && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">등록 마감</p>
                      <p className="text-foreground font-medium">
                        {new Date(event.registrationDeadline).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                  </div>
                )}

                {event.creator && (
                  <div className="flex items-start gap-3">
                    <UserAvatar
                      user={{
                        id: event.creator.id,
                        name: event.creator.name,
                        profileImage: event.creator.profileImage,
                      }}
                      size="sm"
                      linkToProfile={false}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">등록자</p>
                      <p className="text-foreground font-medium">{event.creator.name}</p>
                    </div>
                  </div>
                )}
              </div>

              {event.externalUrl && (
                <>
                  <Separator />
                  <Button variant="outline" asChild>
                    <a href={event.externalUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      대회 홈페이지 바로가기
                    </a>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Register / Cancel Buttons */}
          {!isOwner && (
            <div className="flex gap-3">
              {event.isRegistered ? (
                <Button variant="destructive" onClick={() => setShowCancelDialog(true)} disabled={actionLoading}>
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <UserMinus className="h-4 w-4 mr-2" />
                  )}
                  참가 취소
                </Button>
              ) : (
                <Button onClick={handleRegister} disabled={actionLoading || isPast || isFull}>
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4 mr-2" />
                  )}
                  {isFull ? "정원 마감" : "참가 등록"}
                </Button>
              )}
            </div>
          )}

          {/* My Result Section */}
          {event.isRegistered && (
            <Card>
              <CardHeader>
                <CardTitle>내 결과</CardTitle>
              </CardHeader>
              <CardContent>
                {myResult ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">순위</p>
                        <p className="text-2xl font-bold text-foreground">{myResult.resultRank ?? "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">배번</p>
                        <p className="text-2xl font-bold text-foreground">{myResult.bibNumber || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">기록</p>
                        <p className="text-2xl font-bold text-foreground font-mono">
                          {myResult.resultTime != null ? formatTime(myResult.resultTime) : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">상태</p>
                        <Badge variant={myResult.status === "COMPLETED" ? "default" : "secondary"}>
                          {myResult.status === "COMPLETED" ? "완주" : myResult.status}
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    {/* Workout Link */}
                    <div>
                      {myResult.workoutId ? (
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="flex items-center gap-2">
                            <LinkIcon className="h-3 w-3" />
                            워크아웃 연결됨
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleUnlinkWorkout}
                            disabled={actionLoading}
                          >
                            <Unlink className="h-4 w-4 mr-2" />
                            연결 해제
                          </Button>
                        </div>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => setShowWorkoutLink(!showWorkoutLink)}>
                          <LinkIcon className="h-4 w-4 mr-2" />
                          워크아웃 연결
                        </Button>
                      )}
                    </div>

                    {showWorkoutLink && (
                      <form onSubmit={handleLinkWorkout} className="flex gap-2">
                        <Input
                          type="text"
                          value={workoutId}
                          onChange={(e) => setWorkoutId(e.target.value)}
                          placeholder="워크아웃 ID"
                        />
                        <Button type="submit" disabled={actionLoading || !workoutId.trim()}>
                          연결
                        </Button>
                      </form>
                    )}
                  </div>
                ) : (
                  <div>
                    {!showResultForm ? (
                      <Button variant="outline" onClick={() => setShowResultForm(true)}>
                        결과 등록하기
                      </Button>
                    ) : (
                      <form onSubmit={handleSubmitResult} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="resultTime">기록 (HH:MM:SS 또는 MM:SS)</Label>
                            <Input
                              id="resultTime"
                              type="text"
                              value={resultTime}
                              onChange={(e) => setResultTime(e.target.value)}
                              placeholder="1:30:00"
                            />
                          </div>
                          <div>
                            <Label htmlFor="resultRank">순위 (선택)</Label>
                            <Input
                              id="resultRank"
                              type="number"
                              value={resultRank}
                              onChange={(e) => setResultRank(e.target.value)}
                              min="1"
                              placeholder="선택"
                            />
                          </div>
                          <div>
                            <Label htmlFor="resultBib">배번 (선택)</Label>
                            <Input
                              id="resultBib"
                              type="text"
                              value={resultBib}
                              onChange={(e) => setResultBib(e.target.value)}
                              placeholder="선택"
                            />
                          </div>
                          <div>
                            <Label htmlFor="resultStatus">상태</Label>
                            <select
                              id="resultStatus"
                              value={resultStatus}
                              onChange={(e) => setResultStatus(e.target.value)}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                              <option value="COMPLETED">완주</option>
                              <option value="DNF">DNF</option>
                              <option value="DNS">DNS</option>
                              <option value="DSQ">실격</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" disabled={actionLoading}>
                            {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            결과 등록
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setShowResultForm(false)}>
                            취소
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Results Tab */}
      {activeTab === "results" && (
        <Card>
          <CardHeader>
            <CardTitle>대회 결과</CardTitle>
            <CardDescription>참가자들의 대회 기록입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <EventResultsTable results={results} isLoading={resultsLoading} />
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteEvent}
        title="대회 삭제"
        description="정말로 이 대회를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmLabel="삭제"
        cancelLabel="취소"
        variant="destructive"
      />

      <ConfirmDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={handleCancel}
        title="참가 취소"
        description="참가를 취소하시겠습니까?"
        confirmLabel="취소하기"
        cancelLabel="닫기"
        variant="destructive"
      />
    </div>
  );
}
