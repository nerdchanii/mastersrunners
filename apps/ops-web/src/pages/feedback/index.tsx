import {
  ArrowLeft,
  ArrowUpRight,
  BotMessageSquare,
  ClipboardCheck,
  Link2,
  Plus,
  Search,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useFeedbackOpsSubmission,
  useFeedbackOpsSubmissions,
  useReplaceFeedbackHandoff,
  useUpdateFeedbackTriage,
} from "@/hooks/use-feedback-ops";
import { ApiError } from "@/lib/api-client";
import {
  FEEDBACK_CATEGORY_OPTIONS,
  FEEDBACK_REFERENCE_KIND_OPTIONS,
  FEEDBACK_STATUS_OPTIONS,
  type FeedbackHandoffReferenceDraft,
  type FeedbackOpsSubmissionListItem,
  type FeedbackStatus,
  formatFeedbackDate,
  getFeedbackCategoryLabel,
  getFeedbackReferenceKindLabel,
  getFeedbackStatusLabel,
} from "@/lib/feedback";
import { cn } from "@/lib/utils";

const ALL_FILTER = "ALL";

function getStatusBadgeVariant(status: FeedbackStatus) {
  switch (status) {
    case "NEW":
      return "outline";
    case "IN_REVIEW":
      return "secondary";
    case "PLANNED":
      return "default";
    case "RESOLVED":
      return "default";
    case "DISMISSED":
      return "ghost";
  }
}

function EmptyDetailState() {
  return (
    <Card className="border-dashed bg-background/90">
      <CardHeader>
        <CardTitle>검토할 피드백을 선택해 주세요</CardTitle>
        <CardDescription>
          왼쪽 inbox에서 항목을 고르면 triage 메모와 handoff 링크를 바로 기록할 수 있습니다.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

function ForbiddenState({ message }: { message: string }) {
  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="size-5 text-destructive" />
          운영자 권한이 없습니다
        </CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>
          Cloudflare Access를 통과했더라도, API는 별도의 operator registry에 등록된 이메일만
          허용합니다.
        </p>
        <p>
          현재는 one-time SQL로 operator identity를 등록하는 구조입니다. runbook 절차로 이메일을
          추가한 뒤 다시 시도해 주세요.
        </p>
      </CardContent>
    </Card>
  );
}

function InboxItem({
  isSelected,
  submission,
}: {
  isSelected: boolean;
  submission: FeedbackOpsSubmissionListItem;
}) {
  return (
    <Link
      to={`/feedback/${submission.id}`}
      className={cn(
        "block rounded-2xl border bg-background/90 p-4 transition hover:border-primary/30 hover:bg-accent/30",
        isSelected && "border-primary/40 bg-primary/5 shadow-sm",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{getFeedbackCategoryLabel(submission.category)}</Badge>
            <Badge variant={getStatusBadgeVariant(submission.status)}>
              {getFeedbackStatusLabel(submission.status)}
            </Badge>
          </div>
          <p className="text-sm font-semibold text-foreground">{submission.title}</p>
        </div>
        {submission.handoffUpdatedAt ? (
          <Badge variant="secondary" className="shrink-0">
            <Link2 className="size-3.5" />
            handoff
          </Badge>
        ) : null}
      </div>
      <div className="mt-3 flex flex-col gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <UserRound className="size-3.5" />
          {submission.user.name} · {submission.user.email}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span>{formatFeedbackDate(submission.createdAt)}</span>
          {submission.currentPath ? (
            <span className="truncate">{submission.currentPath}</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

export default function FeedbackPage() {
  const navigate = useNavigate();
  const { submissionId } = useParams();

  const [statusFilter, setStatusFilter] = useState<typeof ALL_FILTER | FeedbackStatus>(ALL_FILTER);
  const [categoryFilter, setCategoryFilter] = useState<typeof ALL_FILTER | string>(ALL_FILTER);
  const [searchInput, setSearchInput] = useState("");
  const deferredSearch = useDeferredValue(searchInput.trim());

  const filters = useMemo(
    () => ({
      status: statusFilter === ALL_FILTER ? undefined : statusFilter,
      category: categoryFilter === ALL_FILTER ? undefined : categoryFilter,
      search: deferredSearch || undefined,
    }),
    [categoryFilter, deferredSearch, statusFilter],
  );

  const submissionsQuery = useFeedbackOpsSubmissions(filters);
  const detailQuery = useFeedbackOpsSubmission(submissionId);
  const triageMutation = useUpdateFeedbackTriage();
  const handoffMutation = useReplaceFeedbackHandoff();

  const [triageStatus, setTriageStatus] = useState<FeedbackStatus>("NEW");
  const [triageNote, setTriageNote] = useState("");
  const [handoffNote, setHandoffNote] = useState("");
  const [references, setReferences] = useState<FeedbackHandoffReferenceDraft[]>([]);

  useEffect(() => {
    if (!detailQuery.data) {
      return;
    }

    setTriageStatus(detailQuery.data.status);
    setTriageNote(detailQuery.data.triageNote ?? "");
    setHandoffNote(detailQuery.data.handoffNote ?? "");
    setReferences(
      detailQuery.data.followUpReferences.map((reference) => ({
        kind: reference.kind,
        label: reference.label,
        target: reference.target,
      })),
    );
  }, [detailQuery.data?.id]);

  const summary = useMemo(() => {
    const submissions = submissionsQuery.data ?? [];

    return {
      planned: submissions.filter((submission) => submission.status === "PLANNED").length,
      resolved: submissions.filter((submission) => submission.status === "RESOLVED").length,
      total: submissions.length,
      unread: submissions.filter((submission) => submission.status === "NEW").length,
    };
  }, [submissionsQuery.data]);

  const listError = submissionsQuery.error instanceof ApiError ? submissionsQuery.error : null;
  const detailError = detailQuery.error instanceof ApiError ? detailQuery.error : null;
  const selectedSubmission = detailQuery.data;

  const saveTriage = async () => {
    if (!submissionId) {
      return;
    }

    try {
      await triageMutation.mutateAsync({
        submissionId,
        status: triageStatus,
        triageNote,
      });
      toast.success("triage 상태를 저장했습니다.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "triage 저장에 실패했습니다.");
    }
  };

  const saveHandoff = async () => {
    if (!submissionId) {
      return;
    }

    try {
      await handoffMutation.mutateAsync({
        submissionId,
        handoffNote,
        references,
      });
      toast.success("handoff 링크를 저장했습니다.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "handoff 저장에 실패했습니다.");
    }
  };

  const addReference = () => {
    setReferences((current) => [...current, { kind: "TASK", label: "", target: "" }]);
  };

  const updateReference = (index: number, patch: Partial<FeedbackHandoffReferenceDraft>) => {
    setReferences((current) =>
      current.map((reference, currentIndex) =>
        currentIndex === index ? { ...reference, ...patch } : reference,
      ),
    );
  };

  const removeReference = (index: number) => {
    setReferences((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]">
        <Card className="border-primary/20 bg-[linear-gradient(135deg,rgba(27,59,111,0.08),rgba(245,158,11,0.08))]">
          <CardHeader>
            <CardTitle className="text-xl">Feedback Ops Desk</CardTitle>
            <CardDescription>
              Access로 들어온 운영자만 기존 feedback stream을 triage하고, 필요한 항목을 task나 issue
              링크로 넘기는 공간입니다.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>총 inbox</CardDescription>
            <CardTitle>{summary.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>신규</CardDescription>
            <CardTitle>{summary.unread}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>계획됨 / 해결됨</CardDescription>
            <CardTitle>
              {summary.planned} / {summary.resolved}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(320px,380px)_minmax(0,1fr)]">
        <div className={cn("space-y-4", submissionId && "hidden lg:block")}>
          <Card>
            <CardHeader>
              <CardTitle>Inbox</CardTitle>
              <CardDescription>
                최신 50건을 기준으로 상태와 카테고리, 검색어로 좁혀볼 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ops-search">검색</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="ops-search"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="제목 또는 설명 검색"
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>상태</Label>
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="전체 상태" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_FILTER}>전체 상태</SelectItem>
                      {FEEDBACK_STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>
                          {getFeedbackStatusLabel(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>카테고리</Label>
                  <Select
                    value={categoryFilter}
                    onValueChange={(value) => setCategoryFilter(value as typeof categoryFilter)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="전체 카테고리" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_FILTER}>전체 카테고리</SelectItem>
                      {FEEDBACK_CATEGORY_OPTIONS.map((category) => (
                        <SelectItem key={category} value={category}>
                          {getFeedbackCategoryLabel(category)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {listError?.isForbidden ? (
            <ForbiddenState message={listError.message} />
          ) : submissionsQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-28 rounded-2xl" />
              ))}
            </div>
          ) : submissionsQuery.data?.length ? (
            <div className="space-y-3">
              {submissionsQuery.data.map((submission) => (
                <InboxItem
                  key={submission.id}
                  submission={submission}
                  isSelected={submission.id === submissionId}
                />
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle>조건에 맞는 피드백이 없습니다</CardTitle>
                <CardDescription>
                  필터를 지우거나, public app에서 새 피드백이 들어오기를 기다려 주세요.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          {submissionId ? (
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => navigate("/feedback")}
            >
              <ArrowLeft className="size-4" />
              Inbox로 돌아가기
            </Button>
          ) : null}

          {!submissionId ? (
            <EmptyDetailState />
          ) : detailQuery.isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-48 rounded-2xl" />
              <Skeleton className="h-56 rounded-2xl" />
              <Skeleton className="h-56 rounded-2xl" />
            </div>
          ) : detailError?.isForbidden ? (
            <ForbiddenState message={detailError.message} />
          ) : selectedSubmission ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">
                      {getFeedbackCategoryLabel(selectedSubmission.category)}
                    </Badge>
                    <Badge variant={getStatusBadgeVariant(selectedSubmission.status)}>
                      {getFeedbackStatusLabel(selectedSubmission.status)}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{selectedSubmission.title}</CardTitle>
                  <CardDescription>{selectedSubmission.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl bg-muted/60 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        submitter
                      </p>
                      <p className="mt-2 text-sm font-medium">{selectedSubmission.user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedSubmission.user.email}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-muted/60 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        timeline
                      </p>
                      <p className="mt-2 text-sm">
                        접수: {formatFeedbackDate(selectedSubmission.createdAt)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        최근 수정: {formatFeedbackDate(selectedSubmission.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        current path
                      </p>
                      <p className="rounded-xl bg-muted/60 px-3 py-2 text-sm">
                        {selectedSubmission.currentPath ?? "미기록"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        user agent
                      </p>
                      <p className="rounded-xl bg-muted/60 px-3 py-2 text-sm">
                        {selectedSubmission.userAgent ?? "미기록"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardCheck className="size-4" />
                    Triage
                  </CardTitle>
                  <CardDescription>
                    상태와 검토 메모를 저장합니다. `NEW`에서 벗어나야 handoff 작성이 열립니다.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
                    <div className="space-y-2">
                      <Label>상태</Label>
                      <Select
                        value={triageStatus}
                        onValueChange={(value) => setTriageStatus(value as FeedbackStatus)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="상태 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {FEEDBACK_STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status} value={status}>
                              {getFeedbackStatusLabel(status)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="triage-note">triage 메모</Label>
                      <Textarea
                        id="triage-note"
                        value={triageNote}
                        onChange={(event) => setTriageNote(event.target.value)}
                        className="min-h-28"
                        placeholder="재현 여부, 우선순위 판단, 다음 액션을 간단히 남겨주세요."
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                      마지막 검토: {formatFeedbackDate(selectedSubmission.reviewedAt)} ·{" "}
                      {selectedSubmission.reviewedByOperatorEmail ?? "미기록"}
                    </p>
                    <Button onClick={saveTriage} disabled={triageMutation.isPending}>
                      {triageMutation.isPending ? "저장 중..." : "triage 저장"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BotMessageSquare className="size-4" />
                    Handoff
                  </CardTitle>
                  <CardDescription>
                    task, initiative, issue, 일반 링크를 현재 피드백에 붙여서 실행 맥락을 남깁니다.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="handoff-note">handoff 메모</Label>
                    <Textarea
                      id="handoff-note"
                      value={handoffNote}
                      onChange={(event) => setHandoffNote(event.target.value)}
                      className="min-h-28"
                      placeholder="왜 이 항목을 후속 작업으로 연결했는지 적어주세요."
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>후속 작업 레퍼런스</Label>
                      <Button variant="outline" size="sm" onClick={addReference}>
                        <Plus className="size-4" />
                        레퍼런스 추가
                      </Button>
                    </div>
                    {references.length ? (
                      references.map((reference, index) => (
                        <div
                          key={`${reference.kind}-${index}`}
                          className="rounded-2xl border border-border/70 bg-muted/30 p-4"
                        >
                          <div className="grid gap-3 md:grid-cols-[180px_minmax(0,220px)_minmax(0,1fr)_auto]">
                            <div className="space-y-2">
                              <Label>종류</Label>
                              <Select
                                value={reference.kind}
                                onValueChange={(value) =>
                                  updateReference(index, {
                                    kind: value as FeedbackHandoffReferenceDraft["kind"],
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="종류 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                  {FEEDBACK_REFERENCE_KIND_OPTIONS.map((kind) => (
                                    <SelectItem key={kind} value={kind}>
                                      {getFeedbackReferenceKindLabel(kind)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>라벨</Label>
                              <Input
                                value={reference.label}
                                onChange={(event) =>
                                  updateReference(index, { label: event.target.value })
                                }
                                placeholder="예: I-0014-260"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>타깃</Label>
                              <Input
                                value={reference.target}
                                onChange={(event) =>
                                  updateReference(index, { target: event.target.value })
                                }
                                placeholder="task 경로 또는 issue 링크"
                              />
                            </div>
                            <div className="flex items-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeReference(index)}
                              >
                                제거
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-border/80 px-4 py-6 text-sm text-muted-foreground">
                        아직 연결된 후속 작업이 없습니다.
                      </div>
                    )}
                  </div>

                  {selectedSubmission.followUpReferences.length ? (
                    <div className="space-y-2">
                      <Label>현재 저장된 레퍼런스</Label>
                      <div className="grid gap-2">
                        {selectedSubmission.followUpReferences.map((reference) => (
                          <a
                            key={reference.id}
                            href={
                              reference.target.startsWith("http") ? reference.target : undefined
                            }
                            target={reference.target.startsWith("http") ? "_blank" : undefined}
                            rel="noreferrer"
                            className="flex flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-background px-3 py-2 text-sm"
                          >
                            <Badge variant="outline">
                              {getFeedbackReferenceKindLabel(reference.kind)}
                            </Badge>
                            <span className="font-medium">{reference.label}</span>
                            <span className="text-muted-foreground">{reference.target}</span>
                            {reference.target.startsWith("http") ? (
                              <ArrowUpRight className="size-3.5" />
                            ) : null}
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                      마지막 handoff: {formatFeedbackDate(selectedSubmission.handoffUpdatedAt)} ·{" "}
                      {selectedSubmission.handoffUpdatedByOperatorEmail ?? "미기록"}
                    </p>
                    <Button
                      onClick={saveHandoff}
                      disabled={handoffMutation.isPending || triageStatus === "NEW"}
                    >
                      {handoffMutation.isPending ? "저장 중..." : "handoff 저장"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>피드백을 불러오지 못했습니다</CardTitle>
                <CardDescription>
                  {detailError?.message ?? "선택한 항목이 존재하지 않거나 접근 권한이 없습니다."}
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
