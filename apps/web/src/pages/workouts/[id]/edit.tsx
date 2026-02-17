import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWorkout, useUpdateWorkout } from "@/hooks/useWorkouts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingPage } from "@/components/common/LoadingPage";
import { PageHeader } from "@/components/common/PageHeader";
import { Activity } from "lucide-react";
import { formatPace } from "@/lib/format";
import { toast } from "sonner";

export default function EditWorkoutPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: workout, isLoading } = useWorkout(id ?? "");
  const updateWorkout = useUpdateWorkout(id ?? "");

  const [date, setDate] = useState("");
  const [distance, setDistance] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [memo, setMemo] = useState("");
  const [visibility, setVisibility] = useState<"PRIVATE" | "FOLLOWERS" | "PUBLIC">("FOLLOWERS");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (workout) {
      const w = workout as {
        distance: number;
        duration: number;
        date: string;
        memo: string | null;
        visibility: "PRIVATE" | "FOLLOWERS" | "PUBLIC";
      };
      setDate(new Date(w.date).toISOString().split("T")[0]);
      setDistance((w.distance / 1000).toFixed(2));
      const h = Math.floor(w.duration / 3600);
      const m = Math.floor((w.duration % 3600) / 60);
      const s = w.duration % 60;
      setHours(h > 0 ? h.toString() : "");
      setMinutes(m > 0 ? m.toString() : "");
      setSeconds(s > 0 ? s.toString() : "");
      setMemo(w.memo ?? "");
      setVisibility(w.visibility);
    }
  }, [workout]);

  const pace = (() => {
    const distanceNum = parseFloat(distance);
    const hoursNum = parseInt(hours) || 0;
    const minutesNum = parseInt(minutes) || 0;
    const secondsNum = parseInt(seconds) || 0;
    const totalSeconds = hoursNum * 3600 + minutesNum * 60 + secondsNum;
    if (distanceNum > 0 && totalSeconds > 0) {
      const secPerKm = totalSeconds / distanceNum;
      return formatPace(secPerKm);
    }
    return null;
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!date) { setError("날짜를 입력해주세요."); return; }
    const distanceNum = parseFloat(distance);
    if (!distance || isNaN(distanceNum) || distanceNum <= 0) {
      setError("거리는 0보다 큰 숫자여야 합니다.");
      return;
    }
    const hoursNum = parseInt(hours) || 0;
    const minutesNum = parseInt(minutes) || 0;
    const secondsNum = parseInt(seconds) || 0;
    const totalSeconds = hoursNum * 3600 + minutesNum * 60 + secondsNum;
    if (totalSeconds <= 0) { setError("시간을 입력해주세요."); return; }

    try {
      await updateWorkout.mutateAsync({
        distance: distanceNum * 1000,
        duration: totalSeconds,
        date,
        memo: memo.trim() || undefined,
        visibility,
      });
      toast.success("워크아웃이 수정되었습니다.");
      navigate(`/workouts/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "수정에 실패했습니다.");
    }
  };

  if (!id) return null;
  if (isLoading) return <LoadingPage />;

  return (
    <div className="container max-w-2xl py-6">
      <PageHeader title="워크아웃 수정" description="기록을 수정하세요." />

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
              <Label htmlFor="date">날짜 <span className="text-destructive">*</span></Label>
              <Input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="distance">거리 (km) <span className="text-destructive">*</span></Label>
              <Input
                type="number"
                id="distance"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                step="0.01"
                min="0.01"
                placeholder="5.0"
              />
            </div>

            <div className="space-y-2">
              <Label>시간 <span className="text-destructive">*</span></Label>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="hours" className="text-xs text-muted-foreground">시간</Label>
                  <Input type="number" id="hours" value={hours} onChange={(e) => setHours(e.target.value)} min="0" placeholder="0" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="minutes" className="text-xs text-muted-foreground">분</Label>
                  <Input type="number" id="minutes" value={minutes} onChange={(e) => setMinutes(e.target.value)} min="0" max="59" placeholder="30" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="seconds" className="text-xs text-muted-foreground">초</Label>
                  <Input type="number" id="seconds" value={seconds} onChange={(e) => setSeconds(e.target.value)} min="0" max="59" placeholder="0" />
                </div>
              </div>
            </div>

            {pace && (
              <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 px-4 py-3">
                <Activity className="size-4 text-primary" />
                <span className="text-sm font-medium">페이스: {pace} /km</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="memo">메모 (선택)</Label>
              <Textarea
                id="memo"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                rows={3}
                placeholder="오늘의 훈련에 대한 메모를 남겨보세요..."
              />
            </div>

            <div className="space-y-2">
              <Label>공개 설정</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["FOLLOWERS", "PUBLIC", "PRIVATE"] as const).map((v) => {
                  const labels = { FOLLOWERS: "팔로워", PUBLIC: "전체 공개", PRIVATE: "비공개" };
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setVisibility(v)}
                      className={`rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all ${visibility === v ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}
                    >
                      {labels[v]}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(`/workouts/${id}`)} disabled={updateWorkout.isPending}>
            취소
          </Button>
          <Button type="submit" disabled={updateWorkout.isPending}>
            {updateWorkout.isPending ? "저장 중..." : "저장"}
          </Button>
        </div>
      </form>
    </div>
  );
}
