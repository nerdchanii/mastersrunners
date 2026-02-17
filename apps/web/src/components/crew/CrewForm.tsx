import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CrewFormData {
  name: string;
  description: string;
  isPublic: boolean;
  maxMembers: string;
}

interface CrewFormProps {
  initialValues?: {
    name?: string;
    description?: string | null;
    isPublic?: boolean;
    maxMembers?: number | null;
  };
  onSubmit: (data: {
    name: string;
    description?: string;
    isPublic: boolean;
    maxMembers?: number;
  }) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
  isSubmitting: boolean;
}

export default function CrewForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
  isSubmitting,
}: CrewFormProps) {
  const [formData, setFormData] = useState<CrewFormData>({
    name: initialValues?.name || "",
    description: initialValues?.description || "",
    isPublic: initialValues?.isPublic ?? true,
    maxMembers: initialValues?.maxMembers?.toString() || "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) { setError("크루 이름을 입력해주세요."); return; }
    if (formData.name.trim().length < 2) { setError("크루 이름은 2자 이상이어야 합니다."); return; }
    if (formData.name.trim().length > 50) { setError("크루 이름은 50자 이하여야 합니다."); return; }
    if (formData.description.length > 500) { setError("설명은 500자 이하여야 합니다."); return; }

    const maxMembersNum = formData.maxMembers ? parseInt(formData.maxMembers, 10) : undefined;
    if (maxMembersNum !== undefined && (isNaN(maxMembersNum) || maxMembersNum < 2)) {
      setError("최대 인원은 2명 이상이어야 합니다.");
      return;
    }

    try {
      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        isPublic: formData.isPublic,
        maxMembers: maxMembersNum,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm font-medium text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6 space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="crew-name">
              크루 이름 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="crew-name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="크루 이름을 입력하세요"
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground text-right">{formData.name.length} / 50</p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="crew-description">설명</Label>
            <Textarea
              id="crew-description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={4}
              placeholder="크루에 대한 설명을 입력하세요"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">{formData.description.length} / 500</p>
          </div>

          {/* Public Toggle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <Label>공개 설정</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formData.isPublic
                    ? "누구나 크루를 검색하고 바로 가입할 수 있습니다."
                    : "관리자 승인 후 가입할 수 있습니다."}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={formData.isPublic}
                onClick={() => setFormData((prev) => ({ ...prev, isPublic: !prev.isPublic }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  formData.isPublic ? "bg-primary" : "bg-input"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                    formData.isPublic ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Max Members */}
          <div className="space-y-2">
            <Label htmlFor="max-members">최대 인원 (선택)</Label>
            <Input
              type="number"
              id="max-members"
              value={formData.maxMembers}
              onChange={(e) => setFormData((prev) => ({ ...prev, maxMembers: e.target.value }))}
              placeholder="제한 없음"
              min={2}
            />
            <p className="text-xs text-muted-foreground">비워두면 인원 제한이 없습니다.</p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          취소
        </Button>
        <Button type="submit" disabled={isSubmitting || !formData.name.trim()}>
          {isSubmitting ? "처리 중..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
