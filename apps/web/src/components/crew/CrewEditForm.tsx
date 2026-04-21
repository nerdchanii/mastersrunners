import { Image as ImageIcon, PencilLine, Users } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import {
  CrewFormData,
  CrewFormField,
  CrewLocationField,
  CrewRulesField,
  FieldError,
} from "./CrewFormFields";

interface CrewEditFormProps {
  initialValues: {
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

export default function CrewEditForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
  isSubmitting,
}: CrewEditFormProps) {
  const [formData, setFormData] = useState<CrewFormData>({
    name: initialValues.name || "",
    description: initialValues.description || "",
    isPublic: initialValues.isPublic ?? true,
    maxMembers: initialValues.maxMembers?.toString() || "",
    location: initialValues.location || "",
    region: initialValues.region || "",
    subRegion: initialValues.subRegion || "",
    profileImageUrl: initialValues.profileImageUrl || "",
    coverImageUrl: initialValues.coverImageUrl || "",
  });

  const [errorField, setErrorField] = useState<CrewFormField>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const profileImageUrl = formData.profileImageUrl.trim() || null;
  const coverImageUrl = formData.coverImageUrl.trim() || null;

  const validate = (): boolean => {
    setErrorField(null);
    setErrorMessage(null);

    if (!formData.name.trim()) {
      setErrorField("name");
      setErrorMessage("크루 이름을 입력해주세요.");
      return false;
    }
    if (formData.name.trim().length < 2) {
      setErrorField("name");
      setErrorMessage("최소 2자 이상 입력해주세요.");
      return false;
    }

    const maxMembersNum = formData.maxMembers ? parseInt(formData.maxMembers, 10) : undefined;
    if (maxMembersNum !== undefined && (isNaN(maxMembersNum) || maxMembersNum < 2)) {
      setErrorField("maxMembers");
      setErrorMessage("최소 2명 이상이어야 합니다.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    const maxMembersNum = formData.maxMembers ? parseInt(formData.maxMembers, 10) : undefined;

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
      setErrorMessage(err instanceof Error ? err.message : "오류가 발생했습니다.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex h-[100svh] max-w-4xl flex-col">
      <div className="scrollbar-hide flex-1 overflow-y-auto space-y-6 pb-6">
        {/* Hero Identity Section */}
        <section className="relative">
          <div className="relative">
            {/* Cover Image */}
            <div className="relative z-10">
              <div className="group relative h-48 cursor-pointer overflow-hidden bg-muted/20 transition-all hover:bg-muted/30 sm:h-64 sm:rounded-3xl">
                {coverImageUrl ? (
                  <img
                    src={coverImageUrl}
                    alt="Cover"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-muted/5" />
                )}
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/20 transition-colors hover:bg-black/30">
                  <ImageIcon className="size-8 text-white/90 mb-2" />
                  <span className="text-xs font-bold text-white/90 uppercase tracking-widest">
                    커버 이미지 변경
                  </span>
                </div>
              </div>

              {/* Profile Bar */}
              <div className="relative z-20 -mt-10 flex items-end justify-between px-4 sm:-mt-16 sm:px-10">
                <div className="group relative flex size-24 cursor-pointer items-center justify-center overflow-hidden rounded-[2.2rem] border-4 border-background bg-background shadow-xl transition-transform hover:scale-105 sm:size-36 sm:rounded-[3rem] sm:border-8">
                  <div className="size-full overflow-hidden rounded-[1.6rem] sm:rounded-[2.2rem]">
                    {profileImageUrl ? (
                      <img
                        src={profileImageUrl}
                        alt="Thumbnail"
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-primary/5 text-primary">
                        <Users className="size-10 sm:size-14" />
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/20 transition-colors hover:bg-black/30">
                    <ImageIcon className="size-6 text-white/90 mb-1" />
                    <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest text-center leading-tight">
                      썸네일 변경
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Name & Description Edit */}
            <div className="relative z-10 space-y-3 px-4 pt-1 pb-1 sm:px-10 sm:pt-2 sm:pb-2 mt-1">
              <div className="space-y-3 max-w-3xl">
                <div className="space-y-1.5 group/field">
                  <div className="relative">
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="크루 이름을 입력하세요 (예: 러닝하이 서울)"
                      maxLength={50}
                      className={cn(
                        "h-auto bg-transparent border border-muted-foreground/20 px-3 py-2 pr-10 text-base font-bold tracking-tight text-foreground transition-all hover:border-muted-foreground/40 focus-visible:bg-background focus-visible:border-primary focus-visible:ring-1 sm:text-lg rounded-xl",
                        errorField === "name" &&
                          "border-destructive focus-visible:border-destructive",
                      )}
                    />
                    <PencilLine className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40 pointer-events-none transition-opacity group-focus-within/field:opacity-0" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-muted-foreground opacity-0 transition-opacity focus-within:opacity-100">
                      {formData.name.length}/50
                    </span>
                  </div>
                  <FieldError field="name" errorField={errorField} errorMessage={errorMessage} />
                </div>

                <div className="space-y-1.5 group/field">
                  <div className="relative">
                    <Textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, description: e.target.value }))
                      }
                      placeholder="크루 활동 분위기나 목표, 가입 조건 등을 자유롭게 적어보세요."
                      rows={4}
                      maxLength={500}
                      className={cn(
                        "min-h-[100px] resize-none bg-transparent border border-muted-foreground/20 px-3 py-2.5 pr-10 text-[14px] leading-relaxed text-foreground transition-all hover:border-muted-foreground/40 focus-visible:bg-background focus-visible:border-primary focus-visible:ring-1 sm:text-[15px] rounded-xl",
                        errorField === "description" &&
                          "border-destructive focus-visible:border-destructive",
                      )}
                    />
                    <PencilLine className="absolute right-3 top-3 size-4 text-muted-foreground/40 pointer-events-none transition-opacity group-focus-within/field:opacity-0" />
                    <span className="absolute bottom-2.5 right-3 text-[10px] font-medium text-muted-foreground opacity-0 transition-opacity focus-within:opacity-100">
                      {formData.description.length}/500
                    </span>
                  </div>
                  <FieldError
                    field="description"
                    errorField={errorField}
                    errorMessage={errorMessage}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Settings Section */}
        <section className="px-5 sm:px-10 space-y-4 pt-2">
          <div className="flex items-center gap-3 border-b pb-2">
            <h3 className="text-lg font-bold tracking-tight text-foreground">운영 및 지역 설정</h3>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <CrewRulesField
              formData={formData}
              setFormData={setFormData}
              errorField={errorField}
              errorMessage={errorMessage}
            />
            <CrewLocationField formData={formData} setFormData={setFormData} isEditMode={true} />
          </div>
        </section>
      </div>

      {/* Form Actions */}
      <div className="mt-auto flex shrink-0 sticky bottom-0 items-center justify-end gap-3 bg-background/80 backdrop-blur-sm border-t px-5 py-4 sm:static sm:border-none sm:bg-transparent sm:px-10 sm:py-6">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
          className="h-11 rounded-xl px-4 sm:px-6 font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          취소
        </Button>
        <Button
          type="submit"
          className="h-11 rounded-xl bg-primary px-8 sm:px-10 font-bold shadow-md transition-transform active:scale-95"
          disabled={isSubmitting}
        >
          {isSubmitting ? "저장 중..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
