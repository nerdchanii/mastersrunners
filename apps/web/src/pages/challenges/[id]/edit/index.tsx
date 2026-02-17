import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChallenge } from "@/hooks/useChallenges";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingPage } from "@/components/common/LoadingPage";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { challengeKeys } from "@/hooks/useChallenges";

type GoalType = "DISTANCE" | "COUNT" | "DURATION" | "PACE";

const goalTypeOptions: { value: GoalType; label: string; placeholder: string; unit: string }[] = [
  { value: "DISTANCE", label: "거리 (km)", placeholder: "예: 100", unit: "km" },
  { value: "COUNT", label: "횟수", placeholder: "예: 30", unit: "회" },
  { value: "DURATION", label: "일수", placeholder: "예: 30", unit: "일" },
  { value: "PACE", label: "페이스 (초/km)", placeholder: "예: 300", unit: "초/km" },
];

export default function EditChallengePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: challenge, isLoading } = useChallenge(id ?? "");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [goalType, setGoalType] = useState<GoalType>("DISTANCE");
  const [goalValue, setGoalValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (challenge) {
      setName(challenge.name);
      setDescription(challenge.description ?? "");
      setGoalType(challenge.goalType as GoalType);
      setGoalValue(String(challenge.goalValue));
      setStartDate(new Date(challenge.startDate).toISOString().split("T")[0]);
      setEndDate(new Date(challenge.endDate).toISOString().split("T")[0]);
      setIsPublic(challenge.isPublic);
    }
  }, [challenge]);

  const currentGoalOption = goalTypeOptions.find((o) => o.value === goalType)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) { setError("챌린지 이름을 입력해주세요."); return; }
    if (!goalValue || Number(goalValue) <= 0) { setError("목표 값을 올바르게 입력해주세요."); return; }
    if (!startDate || !endDate) { setError("시작일과 종료일을 선택해주세요."); return; }
    if (new Date(startDate) >= new Date(endDate)) { setError("종료일은 시작일 이후여야 합니다."); return; }

    setIsSubmitting(true);
    try {
      await api.fetch(`/challenges/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          goalType,
          goalValue: Number(goalValue),
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          isPublic,
        }),
      });
      queryClient.invalidateQueries({ queryKey: challengeKeys.all });
      toast.success("챌린지가 수정되었습니다.");
      navigate(`/challenges/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "수정에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!id) return null;
  if (isLoading) return <LoadingPage />;

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="챌린지 수정" description="챌린지 정보를 수정하세요." />

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {error && (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">챌린지 이름 <span className="text-destructive">*</span></Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
              <Label htmlFor="goalType">목표 유형 <span className="text-destructive">*</span></Label>
              <select
                id="goalType"
                value={goalType}
                onChange={(e) => setGoalType(e.target.value as GoalType)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                {goalTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goalValue">목표 값 <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Input
                  type="number"
                  id="goalValue"
                  value={goalValue}
                  onChange={(e) => setGoalValue(e.target.value)}
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
          <Button type="button" variant="outline" onClick={() => navigate(`/challenges/${id}`)} disabled={isSubmitting}>
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting || !name.trim() || !goalValue || !startDate || !endDate}>
            {isSubmitting ? "저장 중..." : "저장"}
          </Button>
        </div>
      </form>
    </div>
  );
}
