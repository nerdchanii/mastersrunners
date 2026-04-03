import { AlertTriangle, ArrowLeft, Camera, Loader2, Monitor, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDeleteAccount } from "@/hooks/useAccount";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";

import { useProfileEditForm } from "./use-profile-edit-form";

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const deleteAccount = useDeleteAccount();
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0); // 0=closed, 1=경고, 2=최종확인
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const {
    authLoading,
    backgroundInputRef,
    errors,
    form,
    handleBackgroundImageChange,
    handleProfileImageChange,
    handleSubmit,
    isSaving,
    isUploading,
    isUploadingBackground,
    isUploadingProfile,
    profileInputRef,
    setErrors,
    setForm,
  } = useProfileEditForm();

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount.mutateAsync();
      toast.success("계정이 삭제되었습니다.");
      logout();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "계정 삭제에 실패했습니다.");
      setDeleteStep(0);
      setDeleteConfirmText("");
    }
  };

  const initials = form.name ? form.name.charAt(0).toUpperCase() : "?";

  if (authLoading) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="text-xl font-bold">프로필 수정</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Background Image */}
        <div className="overflow-hidden rounded-xl border bg-card">
          <button
            type="button"
            onClick={() => backgroundInputRef.current?.click()}
            className="relative aspect-[3/1] w-full group cursor-pointer"
            disabled={isUploadingBackground}
          >
            {form.backgroundImage ? (
              <img
                src={form.backgroundImage}
                alt="배경 이미지"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-r from-blue-500 to-purple-600" />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
              {isUploadingBackground ? (
                <Loader2 className="size-8 text-white animate-spin" />
              ) : (
                <Camera className="size-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
          </button>
          <input
            ref={backgroundInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleBackgroundImageChange}
          />

          {/* Profile Image overlapping cover */}
          <div className="relative px-4 pb-4 sm:px-6">
            <div className="-mt-12 sm:-mt-14">
              <button
                type="button"
                onClick={() => profileInputRef.current?.click()}
                className="relative group cursor-pointer"
                disabled={isUploadingProfile}
              >
                <Avatar className="size-24 sm:size-28 ring-4 ring-card">
                  {form.profileImage && <AvatarImage src={form.profileImage} alt={form.name} />}
                  <AvatarFallback className="text-3xl sm:text-4xl bg-muted">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 group-hover:bg-black/40 transition-colors">
                  {isUploadingProfile ? (
                    <Loader2 className="size-6 text-white animate-spin" />
                  ) : (
                    <Camera className="size-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </button>
              <input
                ref={profileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfileImageChange}
              />
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="rounded-xl border bg-card p-4 sm:p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">이름</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, name: e.target.value }));
                if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
              }}
              placeholder="이름을 입력하세요"
              maxLength={50}
            />
            <div className="flex justify-between">
              {errors.name ? <p className="text-xs text-destructive">{errors.name}</p> : <span />}
              <p className="text-xs text-muted-foreground">{form.name.length}/50</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">소개</Label>
            <Textarea
              id="bio"
              value={form.bio}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, bio: e.target.value }));
                if (errors.bio) setErrors((prev) => ({ ...prev, bio: "" }));
              }}
              placeholder="자신을 소개해주세요"
              rows={4}
              maxLength={300}
            />
            <div className="flex justify-between">
              {errors.bio ? <p className="text-xs text-destructive">{errors.bio}</p> : <span />}
              <p className="text-xs text-muted-foreground">{form.bio.length}/300</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="region">거점 지역</Label>
              <Input
                id="region"
                value={form.region}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, region: e.target.value }));
                  if (errors.region) setErrors((prev) => ({ ...prev, region: "" }));
                }}
                placeholder="예: 서울특별시"
                maxLength={100}
              />
              {errors.region && <p className="text-xs text-destructive">{errors.region}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subRegion">세부 지역</Label>
              <Input
                id="subRegion"
                value={form.subRegion}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, subRegion: e.target.value }));
                  if (errors.subRegion) setErrors((prev) => ({ ...prev, subRegion: "" }));
                }}
                placeholder="예: 마포구"
                maxLength={100}
              />
              {errors.subRegion && <p className="text-xs text-destructive">{errors.subRegion}</p>}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h2 className="text-sm font-semibold">PB 기록</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                선택 입력입니다. `mm:ss` 또는 `hh:mm:ss` 형식으로 적어주세요.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pb5k">5K</Label>
                <Input
                  id="pb5k"
                  value={form.pb5k}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, pb5k: e.target.value }));
                    if (errors.pb5k) setErrors((prev) => ({ ...prev, pb5k: "" }));
                  }}
                  placeholder="21:30"
                />
                {errors.pb5k && <p className="text-xs text-destructive">{errors.pb5k}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pb10k">10K</Label>
                <Input
                  id="pb10k"
                  value={form.pb10k}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, pb10k: e.target.value }));
                    if (errors.pb10k) setErrors((prev) => ({ ...prev, pb10k: "" }));
                  }}
                  placeholder="45:00"
                />
                {errors.pb10k && <p className="text-xs text-destructive">{errors.pb10k}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pbHalf">HM</Label>
                <Input
                  id="pbHalf"
                  value={form.pbHalf}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, pbHalf: e.target.value }));
                    if (errors.pbHalf) setErrors((prev) => ({ ...prev, pbHalf: "" }));
                  }}
                  placeholder="1:40:00"
                />
                {errors.pbHalf && <p className="text-xs text-destructive">{errors.pbHalf}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pbFull">FM</Label>
                <Input
                  id="pbFull"
                  value={form.pbFull}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, pbFull: e.target.value }));
                    if (errors.pbFull) setErrors((prev) => ({ ...prev, pbFull: "" }));
                  }}
                  placeholder="3:30:00"
                />
                {errors.pbFull && <p className="text-xs text-destructive">{errors.pbFull}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* 테마 설정 */}
        <div className="rounded-xl border bg-card p-4 sm:p-6 space-y-3">
          <div>
            <h2 className="text-sm font-semibold">테마</h2>
            <p className="text-xs text-muted-foreground mt-0.5">앱 외관 테마를 선택하세요.</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "light" as const, label: "라이트", Icon: Sun },
              { value: "dark" as const, label: "다크", Icon: Moon },
              { value: "system" as const, label: "시스템", Icon: Monitor },
            ].map(({ value, label, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 py-3 text-sm font-medium transition-all ${
                  theme === value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isSaving}>
            취소
          </Button>
          <Button type="submit" disabled={isSaving || isUploading}>
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                저장 중...
              </>
            ) : (
              "저장"
            )}
          </Button>
        </div>
      </form>

      {/* 계정 삭제 섹션 */}
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 sm:p-6 space-y-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="size-5 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-destructive">계정 삭제</h2>
            <p className="text-xs text-muted-foreground mt-1">
              계정을 삭제하면 모든 데이터(워크아웃, 포스트, 팔로우, 크루 등)가 영구적으로
              삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </p>
          </div>
        </div>
        <Button type="button" variant="destructive" size="sm" onClick={() => setDeleteStep(1)}>
          계정 삭제
        </Button>
      </div>

      {/* 1단계: 경고 다이얼로그 */}
      <Dialog open={deleteStep === 1} onOpenChange={(open) => !open && setDeleteStep(0)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-destructive">정말 탈퇴하시겠습니까?</DialogTitle>
            <DialogDescription className="space-y-2 pt-1">
              <span className="block">
                계정을 삭제하면 다음 데이터가 <strong>영구적으로 삭제</strong>됩니다:
              </span>
              <ul className="list-disc list-inside text-sm space-y-0.5 mt-2">
                <li>모든 워크아웃 기록</li>
                <li>모든 게시글 및 댓글</li>
                <li>팔로우/팔로워 관계</li>
                <li>크루 및 챌린지 참여 내역</li>
                <li>메시지 및 알림</li>
              </ul>
              <span className="block mt-2 font-medium text-destructive">
                이 작업은 되돌릴 수 없습니다.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteStep(0)}>
              취소
            </Button>
            <Button variant="destructive" onClick={() => setDeleteStep(2)}>
              계속
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2단계: 최종 확인 다이얼로그 */}
      <Dialog
        open={deleteStep === 2}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteStep(0);
            setDeleteConfirmText("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-destructive">최종 확인</DialogTitle>
            <DialogDescription>
              계정 삭제를 확인하려면 아래 입력창에{" "}
              <strong className="text-foreground">"탈퇴합니다"</strong>를 입력하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="탈퇴합니다"
              autoFocus
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteStep(0);
                setDeleteConfirmText("");
              }}
              disabled={deleteAccount.isPending}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== "탈퇴합니다" || deleteAccount.isPending}
            >
              {deleteAccount.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  삭제 중...
                </>
              ) : (
                "계정 영구 삭제"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
