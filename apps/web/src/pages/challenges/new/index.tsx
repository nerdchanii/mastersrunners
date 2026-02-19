import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { challengeKeys } from "@/hooks/useChallenges";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/common/PageHeader";
import { toast } from "sonner";

type GoalType = "DISTANCE" | "FREQUENCY" | "STREAK" | "PACE";

const goalTypeOptions: { value: GoalType; label: string; placeholder: string; unit: string; targetUnit: string }[] = [
  { value: "DISTANCE", label: "거리 (km)", placeholder: "예: 100", unit: "km", targetUnit: "KM" },
  { value: "FREQUENCY", label: "횟수", placeholder: "예: 30", unit: "회", targetUnit: "COUNT" },
  { value: "STREAK", label: "연속 일수", placeholder: "예: 30", unit: "일", targetUnit: "DAYS" },
  { value: "PACE", label: "페이스 (초/km)", placeholder: "예: 300", unit: "초/km", targetUnit: "SEC_PER_KM" },
];

export default function NewChallengePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<GoalType>("DISTANCE");
  const [targetValue, setTargetValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentGoalOption = goalTypeOptions.find((o) => o.value === type)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) { setError("챌린지 이름을 입력해주세요."); return; }
    if (!targetValue || Number(targetValue) <= 0) { setError("목표 값을 올바르게 입력해주세요."); return; }
    if (!startDate || !endDate) { setError("시작일과 종료일을 선택해주세요."); return; }
    if (new Date(startDate) >= new Date(endDate)) { setError("종료일은 시작일 이후여야 합니다."); return; }

    setIsSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        type,
        targetValue: Number(targetValue),
        targetUnit: currentGoalOption.targetUnit,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        isPublic,
      };
      if (description.trim()) body.description = description.trim();

      const created = await api.fetch<{ id: string }>("/challenges", {
        method: "POST",
        body: JSON.stringify(body),
      });
      queryClient.invalidateQueries({ queryKey: challengeKeys.all });
      toast.success("챌린지가 생성되었습니다.");
      navigate(`/challenges/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "챌린지 생성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="새 챌린지 만들기" description="목표를 설정하고 함께 도전할 챌린지를 만들어보세요." />

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {error && (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="pt-4 pb-4">
              <p className="text-sm font-medium text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">챌린지 이름 <span className="text-destructive">*</span></Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 2월 100km 달리기"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">설명 (선택)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="챌린지에 대한 설명을 입력해주세요."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">목표 유형 <span className="text-destructive">*</span></Label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as GoalType)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                {goalTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetValue">목표 값 <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Input
                  type="number"
                  id="targetValue"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  min="1"
                  step="any"
                  placeholder={currentGoalOption.placeholder}
                  className="pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {currentGoalOption.unit}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">시작일 <span className="text-destructive">*</span></Label>
                <Input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">종료일 <span className="text-destructive">*</span></Label>
                <Input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 rounded border-input accent-primary"
              />
              <Label htmlFor="isPublic" className="cursor-pointer">공개 챌린지</Label>
              <span className="text-xs text-muted-foreground">비공개로 설정하면 초대받은 사람만 참가할 수 있습니다.</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isSubmitting}>
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting || !title.trim() || !targetValue || !startDate || !endDate}>
            {isSubmitting ? "생성 중..." : "챌린지 만들기"}
          </Button>
        </div>
      </form>
    </div>
  );
}
