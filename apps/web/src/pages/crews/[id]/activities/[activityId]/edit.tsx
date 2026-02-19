import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useCrew } from "@/hooks/useCrews";
import { useCrewActivity, useUpdateActivity } from "@/hooks/useCrewActivities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import CrewActivityForm from "@/components/crew/CrewActivityForm";

export default function CrewActivityEditPage() {
  const { id: crewId, activityId } = useParams<{ id: string; activityId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: crew, isLoading: crewLoading } = useCrew(crewId ?? "");
  const { data: activity, isLoading: activityLoading } = useCrewActivity(
    crewId ?? "",
    activityId ?? ""
  );
  const updateActivity = useUpdateActivity();

  const isLoading = crewLoading || activityLoading;

  const currentMember = crew?.members?.find((m) => m.user.id === user?.id);
  const isAdmin =
    currentMember?.role === "OWNER" || currentMember?.role === "ADMIN";

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <p className="text-muted-foreground">권한이 없습니다.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          돌아가기
        </Button>
      </div>
    );
  }

  const handleSubmitData = async (data: {
    title: string;
    description: string;
    location: string;
    activityDate: string;
  }) => {
    await updateActivity.mutateAsync({
      crewId: crewId!,
      activityId: activityId!,
      data: {
        title: data.title,
        description: data.description || undefined,
        location: data.location || undefined,
        activityDate: new Date(data.activityDate).toISOString(),
      },
    });
    toast.success("활동이 수정되었습니다.");
    navigate(`/crews/${crewId}/activities/${activityId}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/crews/${crewId}/activities/${activityId}`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">활동 수정</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>활동 정보 수정</CardTitle>
        </CardHeader>
        <CardContent>
          <CrewActivityForm
            crewId={crewId!}
            mode="edit"
            initialValues={{
              title: activity?.title,
              description: activity?.description ?? "",
              location: activity?.location ?? "",
              activityDate: activity?.activityDate,
            }}
            onSubmitData={handleSubmitData}
            onSuccess={() => {}}
            onCancel={() => navigate(`/crews/${crewId}/activities/${activityId}`)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
