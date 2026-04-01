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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const KOREA_REGIONS = [
  "서울특별시",
  "부산광역시",
  "대구광역시",
  "인천광역시",
  "광주광역시",
  "대전광역시",
  "울산광역시",
  "세종특별자치시",
  "경기도",
  "강원특별자치도",
  "충청북도",
  "충청남도",
  "전북특별자치도",
  "전라남도",
  "경상북도",
  "경상남도",
  "제주특별자치도",
];

interface CrewFormData {
  name: string;
  description: string;
  isPublic: boolean;
  maxMembers: string;
  location: string;
  region: string;
  subRegion: string;
}

interface CrewFormProps {
  initialValues?: {
    name?: string;
    description?: string | null;
    isPublic?: boolean;
    maxMembers?: number | null;
    location?: string | null;
    region?: string | null;
    subRegion?: string | null;
  };
  onSubmit: (data: {
    name: string;
    description?: string;
    isPublic: boolean;
    maxMembers?: number;
    location?: string;
    region?: string;
    subRegion?: string;
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
    location: initialValues?.location || "",
    region: initialValues?.region || "",
    subRegion: initialValues?.subRegion || "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("크루 이름을 입력해주세요.");
      return;
    }
    if (formData.name.trim().length < 2) {
      setError("크루 이름은 2자 이상이어야 합니다.");
      return;
    }
    if (formData.name.trim().length > 50) {
      setError("크루 이름은 50자 이하여야 합니다.");
      return;
    }
    if (formData.description.length > 500) {
      setError("설명은 500자 이하여야 합니다.");
      return;
    }

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
        location: formData.location.trim() || undefined,
        region: formData.region || undefined,
        subRegion: formData.subRegion.trim() || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/5 px-4 py-3">
          <p className="text-sm font-medium text-destructive">{error}</p>
        </div>
      )}

      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="crew-name" className="sr-only">
            크루 이름
          </Label>
          <Input
            id="crew-name"
            aria-label="크루 이름"
            value={formData.name}
            onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="크루 이름"
            maxLength={50}
            className="h-12 text-base"
          />
          <p className="text-right text-xs text-muted-foreground">{formData.name.length} / 50</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="crew-description" className="sr-only">
            크루 설명
          </Label>
          <Textarea
            id="crew-description"
            aria-label="크루 설명"
            value={formData.description}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, description: event.target.value }))
            }
            rows={5}
            placeholder="크루 소개, 활동 분위기, 가입 기준 등을 적어주세요"
            maxLength={500}
            className="min-h-32"
          />
          <p className="text-right text-xs text-muted-foreground">
            {formData.description.length} / 500
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">공개 설정</p>
              <p className="text-xs leading-5 text-muted-foreground">
                {formData.isPublic
                  ? "누구나 검색하고 바로 가입할 수 있습니다."
                  : "관리자 승인 후 가입할 수 있습니다."}
              </p>
            </div>
            <Switch
              id="crew-public"
              checked={formData.isPublic}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isPublic: checked }))}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="max-members" className="sr-only">
              최대 인원
            </Label>
            <Input
              type="number"
              id="max-members"
              aria-label="최대 인원"
              value={formData.maxMembers}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, maxMembers: event.target.value }))
              }
              placeholder="최대 인원 (선택)"
              min={2}
            />
            <p className="text-xs text-muted-foreground">비워두면 인원 제한이 없습니다.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="crew-location" className="sr-only">
              활동 지역
            </Label>
            <Input
              id="crew-location"
              aria-label="활동 지역"
              value={formData.location}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, location: event.target.value }))
              }
              placeholder="활동 지역 (선택)"
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">지역</p>
            <Select
              value={formData.region}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, region: value, subRegion: "" }))
              }
            >
              <SelectTrigger id="crew-region" aria-label="지역">
                <SelectValue placeholder="지역 선택" />
              </SelectTrigger>
              <SelectContent>
                {KOREA_REGIONS.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.region && (
            <div className="space-y-2">
              <Label htmlFor="crew-subregion" className="sr-only">
                세부 지역
              </Label>
              <Input
                id="crew-subregion"
                aria-label="세부 지역"
                value={formData.subRegion}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, subRegion: event.target.value }))
                }
                placeholder="세부 지역 (선택)"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-border/60 pt-4 sm:flex-row sm:justify-end">
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
