import { AlertCircle, Globe, Image as ImageIcon, Users } from "lucide-react";

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
import { KOREA_SIDO, KOREA_SIGUNGU } from "@/lib/regions";
import { cn } from "@/lib/utils";

export interface CrewFormData {
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

export type CrewFormField = keyof CrewFormData | null;

interface FieldErrorProps {
  field: CrewFormField;
  errorField: CrewFormField;
  errorMessage: string | null;
}

export const FieldError = ({ field, errorField, errorMessage }: FieldErrorProps) => {
  if (errorField !== field || !errorMessage) return null;
  return (
    <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-destructive animate-in fade-in slide-in-from-top-1">
      <AlertCircle className="size-3" />
      {errorMessage}
    </div>
  );
};

export const CrewNameField = ({
  formData,
  setFormData,
  errorField,
  errorMessage,
}: {
  formData: CrewFormData;
  setFormData: React.Dispatch<React.SetStateAction<CrewFormData>>;
  errorField: CrewFormField;
  errorMessage: string | null;
}) => (
  <div className="space-y-1.5">
    <Label htmlFor="crew-name" className="text-xs font-semibold text-muted-foreground">
      크루 이름
    </Label>
    <div className="relative">
      <Input
        id="crew-name"
        value={formData.name}
        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
        placeholder="예: 러닝하이 서울"
        maxLength={50}
        className={cn("h-10 text-sm", errorField === "name" && "border-destructive")}
      />
      <span className="absolute right-3 top-3 text-[10px] font-medium text-muted-foreground">
        {formData.name.length}/50
      </span>
    </div>
    <FieldError field="name" errorField={errorField} errorMessage={errorMessage} />
  </div>
);

export const CrewDescriptionField = ({
  formData,
  setFormData,
  errorField,
  errorMessage,
}: {
  formData: CrewFormData;
  setFormData: React.Dispatch<React.SetStateAction<CrewFormData>>;
  errorField: CrewFormField;
  errorMessage: string | null;
}) => (
  <div className="space-y-1.5">
    <Label htmlFor="crew-description" className="text-xs font-semibold text-muted-foreground">
      크루 소개
    </Label>
    <div className="relative">
      <Textarea
        id="crew-description"
        value={formData.description}
        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
        placeholder="활동 분위기, 가입 조건 등을 자유롭게 적어보세요."
        rows={6}
        maxLength={500}
        className={cn(
          "min-h-[160px] resize-none pb-8 text-sm sm:min-h-[180px]",
          errorField === "description" && "border-destructive",
        )}
      />
      <span className="absolute right-3 bottom-3 text-[10px] font-medium text-muted-foreground">
        {formData.description.length}/500
      </span>
    </div>
    <FieldError field="description" errorField={errorField} errorMessage={errorMessage} />
  </div>
);

export const CrewCoverPreviewField = ({ coverImageUrl }: { coverImageUrl: string | null }) => (
  <div className="space-y-2">
    <Label className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">
      커버 이미지
    </Label>
    <div className="relative aspect-[21/9] overflow-hidden rounded-xl border-2 border-dashed bg-muted/10 shadow-sm group transition-colors hover:bg-muted/20 cursor-pointer">
      {coverImageUrl ? (
        <img
          src={coverImageUrl}
          alt="Cover"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-1.5 text-muted-foreground/40">
          <ImageIcon className="size-6" />
          <span className="text-[10px] font-medium">사진을 추가해주세요</span>
        </div>
      )}
    </div>
  </div>
);

export const CrewThumbnailPreviewField = ({
  profileImageUrl,
}: {
  profileImageUrl: string | null;
}) => (
  <div className="space-y-2">
    <Label className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">
      썸네일 이미지
    </Label>
    <div className="flex">
      <div className="group relative size-28 cursor-pointer overflow-hidden rounded-full border-4 border-background bg-muted/10 shadow-sm ring-1 ring-border/20 transition-transform hover:scale-105 active:scale-95">
        {profileImageUrl ? (
          <img src={profileImageUrl} alt="Thumbnail" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-primary/5 text-primary/20">
            <Users className="size-10" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
          <ImageIcon className="size-5 text-white" />
        </div>
      </div>
    </div>
  </div>
);

export const CrewRulesField = ({
  formData,
  setFormData,
  errorField,
  errorMessage,
}: {
  formData: CrewFormData;
  setFormData: React.Dispatch<React.SetStateAction<CrewFormData>>;
  errorField: CrewFormField;
  errorMessage: string | null;
}) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between py-1 min-h-[56px]">
      <div className="space-y-1">
        <Label htmlFor="crew-public" className="text-sm font-semibold text-muted-foreground">
          공개 여부
        </Label>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
          <Globe className="size-3" />
          {formData.isPublic ? "누구나 가입 가능" : "승인 후 가입 가능"}
        </div>
      </div>
      <Switch
        id="crew-public"
        checked={formData.isPublic}
        onCheckedChange={(v) => setFormData((p) => ({ ...p, isPublic: v }))}
      />
    </div>

    <div className="flex items-center justify-between py-1 min-h-[56px]">
      <Label htmlFor="max-members" className="text-sm font-semibold text-muted-foreground">
        최대 인원
      </Label>
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-2">
          <Input
            id="max-members"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={formData.maxMembers}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, "");
              setFormData((p) => ({ ...p, maxMembers: val }));
            }}
            placeholder="제한 없음"
            className="h-9 w-24 px-3 text-right text-sm font-bold"
          />
          <span className="text-sm font-semibold text-muted-foreground">명</span>
        </div>
        <FieldError field="maxMembers" errorField={errorField} errorMessage={errorMessage} />
      </div>
    </div>
  </div>
);

export const CrewLocationField = ({
  formData,
  setFormData,
  isEditMode = false,
}: {
  formData: CrewFormData;
  setFormData: React.Dispatch<React.SetStateAction<CrewFormData>>;
  isEditMode?: boolean;
}) => (
  <div className="space-y-4">
    <div className={cn("space-y-4", isEditMode ? "" : "grid grid-cols-1 gap-4 space-y-0")}>
      <div
        className={cn(
          "flex items-center justify-between py-1 min-h-[56px]",
          !isEditMode && "flex-col items-start gap-1.5 py-0 min-h-0",
        )}
      >
        <Label className="text-sm font-semibold text-muted-foreground shrink-0">시/도</Label>
        <div className={cn("w-[160px] sm:w-[180px]", !isEditMode && "w-full")}>
          <Select
            value={formData.region}
            onValueChange={(v) => setFormData((p) => ({ ...p, region: v, subRegion: "" }))}
          >
            <SelectTrigger className="h-9 text-sm w-full">
              <SelectValue placeholder="선택" />
            </SelectTrigger>
            <SelectContent>
              {KOREA_SIDO.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div
        className={cn(
          "flex items-center justify-between py-1 min-h-[56px]",
          !isEditMode && "flex-col items-start gap-1.5 py-0 min-h-0",
        )}
      >
        <Label className="text-sm font-semibold text-muted-foreground shrink-0">구/군</Label>
        <div className={cn("w-[160px] sm:w-[180px]", !isEditMode && "w-full")}>
          <Select
            value={formData.subRegion}
            onValueChange={(v) => setFormData((p) => ({ ...p, subRegion: v }))}
            disabled={!formData.region}
          >
            <SelectTrigger className="h-9 text-sm w-full">
              <SelectValue placeholder="선택" />
            </SelectTrigger>
            <SelectContent>
              {formData.region &&
                KOREA_SIGUNGU[formData.region]?.map((sg) => (
                  <SelectItem key={sg} value={sg}>
                    {sg}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  </div>
);
