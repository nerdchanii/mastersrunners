import { Bug, ChevronLeft, Lightbulb, MessageSquareQuote, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateFeedbackSubmission } from "@/hooks/useFeedback";

type FeedbackCategory = "BUG" | "IMPROVEMENT" | "QUESTION" | "OTHER";

const categoryOptions: Array<{
  description: string;
  icon: typeof Bug;
  label: string;
  value: FeedbackCategory;
}> = [
  {
    value: "BUG",
    label: "버그",
    description: "고장나거나 예상과 다르게 동작한 문제",
    icon: Bug,
  },
  {
    value: "IMPROVEMENT",
    label: "개선 제안",
    description: "흐름이나 화면을 더 좋게 만들 아이디어",
    icon: Lightbulb,
  },
  {
    value: "QUESTION",
    label: "문의",
    description: "동작 의도나 사용 방법에 대한 질문",
    icon: MessageSquareQuote,
  },
  {
    value: "OTHER",
    label: "기타",
    description: "어느 분류에도 딱 맞지 않는 의견",
    icon: MessageSquareQuote,
  },
];

export default function FeedbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const createFeedback = useCreateFeedbackSubmission();

  const sourcePath =
    ((location.state as { sourcePath?: string } | null)?.sourcePath ?? "").trim() || undefined;

  const [category, setCategory] = useState<FeedbackCategory>("BUG");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);

  const selectedCategory = useMemo(
    () => categoryOptions.find((option) => option.value === category) ?? categoryOptions[0],
    [category],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error("제목과 내용을 모두 입력해주세요.");
      return;
    }

    try {
      const submission = await createFeedback.mutateAsync({
        category,
        title: title.trim(),
        description: description.trim(),
        currentPath: sourcePath,
      });

      setTitle("");
      setDescription("");
      setSubmittedAt(submission.createdAt);
      toast.success("피드백이 접수되었습니다.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "피드백 접수에 실패했습니다.");
    }
  };

  const CategoryIcon = selectedCategory.icon;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        title="피드백 보내기"
        description="불편한 점, 버그, 개선 아이디어를 바로 남겨주세요. 운영 도구는 나중에 붙여도, 접수 자체는 지금부터 누적됩니다."
        actions={
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ChevronLeft className="size-4" />
            돌아가기
          </Button>
        }
      />

      <section className="rounded-2xl border border-border/70 bg-background px-5 py-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-primary/10 p-2 text-primary">
            <CategoryIcon className="size-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">지금 가장 필요한 피드백 창구</p>
            <p className="text-sm text-muted-foreground">
              제출된 내용은 로그인한 사용자와 함께 저장됩니다. 백오피스가 생기기 전까지도 운영
              우선순위를 잡는 기준선으로 사용합니다.
            </p>
            {sourcePath && (
              <p className="text-xs text-muted-foreground">
                접수 시작 위치: <span className="font-medium text-foreground">{sourcePath}</span>
              </p>
            )}
          </div>
        </div>
      </section>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="feedback-category">분류</Label>
          <Select
            value={category}
            onValueChange={(value) => setCategory(value as FeedbackCategory)}
          >
            <SelectTrigger id="feedback-category">
              <SelectValue placeholder="피드백 분류를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{selectedCategory.description}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="feedback-title">한 줄 제목</Label>
          <Input
            id="feedback-title"
            maxLength={120}
            placeholder="예: 게시글 상세에서 사진이 사라져요"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="feedback-description">자세한 설명</Label>
          <Textarea
            id="feedback-description"
            maxLength={2000}
            placeholder="무엇을 하다가 문제가 보였는지, 기대한 동작은 무엇인지 적어주세요."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-40"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>재현 경로나 맥락을 함께 적어주면 우선순위 판단이 빨라집니다.</span>
            <span>{description.length}/2000</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={createFeedback.isPending}>
            <Send className="size-4" />
            {createFeedback.isPending ? "접수 중..." : "피드백 접수"}
          </Button>
          <Button type="button" variant="ghost" asChild>
            <Link to={sourcePath || "/feed"}>{sourcePath ? "이전 화면으로" : "피드로 이동"}</Link>
          </Button>
        </div>
      </form>

      {submittedAt && (
        <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-5 py-4">
          <p className="text-sm font-semibold text-foreground">접수가 완료되었습니다.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            운영자가 읽을 수 있는 저장소로 전달됐습니다. 접수 시각:{" "}
            {new Date(submittedAt).toLocaleString("ko-KR")}
          </p>
        </section>
      )}
    </div>
  );
}
