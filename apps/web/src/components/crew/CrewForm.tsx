import { Image as ImageIcon, Users } from "lucide-react";
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
  profileImageUrl: string;
  coverImageUrl: string;
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
    profileImageUrl?: string | null;
    coverImageUrl?: string | null;
  };
  onSubmit: (data: {
    name: string;
    description?: string;
    profileImageUrl?: string | null;
    coverImageUrl?: string | null;
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
    profileImageUrl: initialValues?.profileImageUrl || "",
    coverImageUrl: initialValues?.coverImageUrl || "",
  });
  const [error, setError] = useState<string | null>(null);
  const profileImageUrl = formData.profileImageUrl.trim() || null;
  const coverImageUrl = formData.coverImageUrl.trim() || null;

  const isValidMediaUrl = (value: string) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

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
    if (profileImageUrl && !isValidMediaUrl(profileImageUrl)) {
      setError("프로필 이미지는 http 또는 https URL로 입력해주세요.");
      return;
    }
    if (coverImageUrl && !isValidMediaUrl(coverImageUrl)) {
      setError("커버 이미지는 http 또는 https URL로 입력해주세요.");
      return;
    }

    try {
      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        profileImageUrl,
        coverImageUrl,
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
        <section className="space-y-4 rounded-3xl border border-border/60 bg-muted/20 p-4 sm:p-5">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">미디어</p>
            <p className="text-xs leading-5 text-muted-foreground">
              프로필 이미지는 목록과 멤버 카드에, 커버 이미지는 상세 상단에 먼저 보입니다. 현재는 두
              슬롯 모두 URL로 연결해 미리보기와 저장을 함께 맞춥니다.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-background">
              <div className="relative aspect-[4/3] bg-gradient-to-br from-primary/15 via-background to-muted">
                {coverImageUrl ? (
                  <>
                    <img
                      src={coverImageUrl}
                      alt="커버 이미지 미리보기"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-background/5" />
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <ImageIcon className="size-8" />
                      <span className="text-xs">커버 이미지 미리보기</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-1 p-4">
                <p className="text-sm font-medium text-foreground">커버 이미지</p>
                <p className="text-xs leading-5 text-muted-foreground">
                  상세 상단과 공유 화면에서 넓게 보이는 영역입니다.
                </p>
                <Input
                  aria-label="커버 이미지 URL"
                  value={formData.coverImageUrl}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, coverImageUrl: event.target.value }))
                  }
                  placeholder="https://example.com/crew-cover.jpg"
                />
                <p className="text-[11px] leading-5 text-muted-foreground">
                  비워두면 중립 배경을 사용합니다.
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border/60 bg-background">
              <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-primary/10 via-background to-muted p-6">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt="프로필 이미지 미리보기"
                    className="h-24 w-24 rounded-3xl object-cover shadow-sm"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                    <Users className="size-10" />
                  </div>
                )}
              </div>
              <div className="space-y-1 p-4">
                <p className="text-sm font-medium text-foreground">프로필 이미지</p>
                <p className="text-xs leading-5 text-muted-foreground">
                  멤버 목록, 댓글, 작은 썸네일에서 쓰이는 대표 이미지입니다.
                </p>
                <Input
                  aria-label="프로필 이미지 URL"
                  value={formData.profileImageUrl}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, profileImageUrl: event.target.value }))
                  }
                  placeholder="https://example.com/crew-profile.jpg"
                />
                <p className="text-[11px] leading-5 text-muted-foreground">
                  비워두면 기본 아이콘을 사용합니다.
                </p>
              </div>
            </div>
          </div>
        </section>

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
