import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEvent, eventKeys } from "@/hooks/useEvents";
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

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: event, isLoading } = useEvent(id ?? "");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description ?? "");
      // datetime-local input format
      setEventDate(new Date(event.date).toISOString().slice(0, 16));
      setLocation(event.location ?? "");
      setMaxParticipants(event.maxParticipants ? String(event.maxParticipants) : "");
    }
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) { setError("대회 이름을 입력해주세요."); return; }
    if (!eventDate) { setError("대회 날짜를 선택해주세요."); return; }

    setIsSubmitting(true);
    try {
      await api.fetch(`/events/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          eventDate: new Date(eventDate).toISOString(),
          location: location.trim() || undefined,
          maxParticipants: maxParticipants ? Number(maxParticipants) : undefined,
        }),
      });
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      toast.success("대회 정보가 수정되었습니다.");
      navigate(`/events/${id}`);
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
      <PageHeader title="대회 수정" description="대회 정보를 수정하세요." />

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
              <Label htmlFor="title">대회 이름 <span className="text-destructive">*</span></Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 2026 서울마라톤"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">설명 (선택)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="대회에 대한 설명을 입력해주세요."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventDate">대회 날짜 <span className="text-destructive">*</span></Label>
              <Input
                type="datetime-local"
                id="eventDate"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">장소 (선택)</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="예: 서울 여의도공원"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxParticipants">최대 참가자 수 (선택)</Label>
              <Input
                type="number"
                id="maxParticipants"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                min="1"
                placeholder="제한 없음"
              />
              <p className="text-xs text-muted-foreground">비워두면 참가자 수 제한이 없습니다.</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(`/events/${id}`)} disabled={isSubmitting}>
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting || !title.trim() || !eventDate}>
            {isSubmitting ? "저장 중..." : "저장"}
          </Button>
        </div>
      </form>
    </div>
  );
}
