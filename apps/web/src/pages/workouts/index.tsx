import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Activity } from "lucide-react";
import WorkoutCard from "@/components/workout/WorkoutCard";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingPage } from "@/components/common/LoadingPage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api-client";

interface Workout {
  id: string;
  distance: number;
  duration: number;
  pace: number;
  date: string;
  memo: string | null;
  visibility: "PRIVATE" | "FOLLOWERS" | "PUBLIC";
}

export default function WorkoutsPage() {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const data = await api.fetch<Workout[]>("/workouts");
        setWorkouts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorkouts();
  }, []);

  if (isLoading) {
    return <LoadingPage variant="list" />;
  }

  if (error) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <p className="text-destructive">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">
            다시 시도
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="내 러닝 기록"
        description="나의 러닝 훈련 기록을 확인하고 관리할 수 있습니다."
        actions={
          workouts.length > 0 && (
            <Button onClick={() => navigate("/workouts/new")}>
              <Plus className="size-4" />
              새 기록 추가
            </Button>
          )
        }
      />

      {workouts.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="아직 기록이 없습니다"
          description="첫 러닝 기록을 추가해보세요!"
          actionLabel="첫 기록 추가하기"
          onAction={() => navigate("/workouts/new")}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workouts.map((workout) => (
            <WorkoutCard key={workout.id} workout={workout} />
          ))}
        </div>
      )}
    </div>
  );
}
