import { useState } from "react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CrewActivityFormProps {
  crewId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CrewActivityForm({ crewId, onSuccess, onCancel }: CrewActivityFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    scheduledAt: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError("활동 이름을 입력해주세요.");
      return;
    }

    if (!formData.scheduledAt) {
      setError("일정을 선택해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.fetch(`/crews/${crewId}/activities`, {
        method: "POST",
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          location: formData.location.trim() || undefined,
          scheduledAt: new Date(formData.scheduledAt).toISOString(),
        }),
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "활동 생성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          활동 이름 <span className="text-destructive">*</span>
        </label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          placeholder="예: 월요일 아침 러닝"
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          설명
        </label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="활동에 대한 설명을 입력하세요"
          rows={3}
          maxLength={500}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="location" className="text-sm font-medium">
          장소
        </label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
          placeholder="예: 올림픽공원 입구"
          maxLength={200}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="scheduledAt" className="text-sm font-medium">
          일정 <span className="text-destructive">*</span>
        </label>
        <Input
          type="datetime-local"
          id="scheduledAt"
          value={formData.scheduledAt}
          onChange={(e) => setFormData((prev) => ({ ...prev, scheduledAt: e.target.value }))}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          취소
        </Button>
        <Button type="submit" disabled={isSubmitting || !formData.title.trim() || !formData.scheduledAt}>
          {isSubmitting ? "생성 중..." : "생성하기"}
        </Button>
      </div>
    </form>
  );
}
