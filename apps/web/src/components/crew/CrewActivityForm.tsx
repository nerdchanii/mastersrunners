import { useState } from "react";

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
import { api } from "@/lib/api-client";

import { crewActivityIconOptions, isCrewActivityIcon } from "./crew-activity-icons";

interface ActivityFormValues {
  title: string;
  description: string;
  location: string;
  activityDate: string;
  activityType: string;
  activityIcon: string;
}

interface CrewActivityFormProps {
  crewId: string;
  onSuccess: () => void;
  onCancel: () => void;
  initialValues?: Partial<ActivityFormValues>;
  mode?: "create" | "edit";
  isSubmitting?: boolean;
  onSubmitData?: (data: ActivityFormValues) => Promise<void>;
}

type ActivityField = keyof ActivityFormValues | null;

export default function CrewActivityForm({
  crewId,
  onSuccess,
  onCancel,
  initialValues,
  mode = "create",
  onSubmitData,
}: CrewActivityFormProps) {
  const [formData, setFormData] = useState<ActivityFormValues>({
    title: initialValues?.title ?? "",
    description: initialValues?.description ?? "",
    location: initialValues?.location ?? "",
    activityDate: initialValues?.activityDate
      ? new Date(initialValues.activityDate).toISOString().slice(0, 16)
      : "",
    activityType: initialValues?.activityType ?? "OFFICIAL",
    activityIcon: isCrewActivityIcon(initialValues?.activityIcon)
      ? initialValues.activityIcon
      : "🏃",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<ActivityField>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrorField(null);

    if (!formData.title.trim()) {
      setError("활동 이름을 입력해주세요.");
      setErrorField("title");
      return;
    }

    if (!formData.activityDate) {
      setError("일정을 선택해주세요.");
      setErrorField("activityDate");
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmitData) {
        await onSubmitData(formData);
      } else {
        await api.fetch(`/crews/${crewId}/activities`, {
          method: "POST",
          body: JSON.stringify({
            title: formData.title.trim(),
            description: formData.description.trim() || undefined,
            location: formData.location.trim() || undefined,
            activityDate: new Date(formData.activityDate).toISOString(),
            activityType: formData.activityType,
            activityIcon: formData.activityType === "OFFICIAL" ? formData.activityIcon : undefined,
          }),
        });
      }
      onSuccess();
    } catch (err) {
      const action = mode === "edit" ? "수정" : "생성";
      setError(err instanceof Error ? err.message : `활동 ${action}에 실패했습니다.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitLabel = mode === "edit" ? "수정하기" : "생성하기";
  const loadingLabel = mode === "edit" ? "수정 중..." : "생성 중...";
  const iconFieldClassName =
    "h-11 w-11 rounded-xl border border-input bg-transparent px-0 py-1 text-center text-xl leading-none transition-colors outline-none focus-visible:border-black dark:focus-visible:border-white aria-invalid:border-destructive";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3">
          <p className="text-sm font-medium text-destructive">{error}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-2">
          <Label>
            유형 <span className="text-destructive">*</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={formData.activityType === "OFFICIAL" ? "default" : "outline"}
              size="sm"
              onClick={() => setFormData((prev) => ({ ...prev, activityType: "OFFICIAL" }))}
            >
              정식 모임
            </Button>
            <Button
              type="button"
              variant={formData.activityType === "POP_UP" ? "default" : "outline"}
              size="sm"
              onClick={() => setFormData((prev) => ({ ...prev, activityType: "POP_UP" }))}
            >
              번개
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="activityDate">
            일정 <span className="text-destructive">*</span>
          </Label>
          <Input
            type="datetime-local"
            id="activityDate"
            aria-invalid={errorField === "activityDate"}
            value={formData.activityDate}
            onChange={(e) => setFormData((prev) => ({ ...prev, activityDate: e.target.value }))}
          />
        </div>
      </div>

      <div className="items-start space-y-4 md:flex md:gap-4">
        <div className="space-y-2 md:shrink-0">
          {formData.activityType === "POP_UP" ? (
            <Input
              id="activityIcon"
              value="⚡"
              readOnly
              tabIndex={-1}
              aria-readonly="true"
              className={iconFieldClassName}
            />
          ) : (
            <Select
              value={formData.activityIcon}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, activityIcon: value }))}
            >
              <SelectTrigger
                id="activityIcon"
                size="lg"
                className="h-11 w-11 justify-center rounded-xl px-0 text-xl [&_[data-slot=select-value]]:justify-center [&>svg]:hidden"
              >
                <SelectValue placeholder="선택" />
              </SelectTrigger>
              <SelectContent>
                {crewActivityIconOptions.map((icon) => (
                  <SelectItem key={icon} value={icon}>
                    <span className="text-base leading-none">{icon}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="md:min-w-0 md:flex-1">
          <Input
            id="title"
            aria-label="제목"
            aria-invalid={errorField === "title"}
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="제목"
            maxLength={100}
            className="h-11"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">장소</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
          placeholder="예: 서울숲 문화예술공원 입구"
          maxLength={200}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">설명</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="집결 지점, 페이스, 보급 여부처럼 필요한 정보만 적어주세요."
          rows={4}
          maxLength={500}
          className="min-h-[120px]"
        />
      </div>

      <div className="flex flex-col-reverse justify-end gap-2 border-t border-border/60 pt-4 sm:flex-row">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          취소
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !formData.title.trim() || !formData.activityDate}
        >
          {isSubmitting ? loadingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
