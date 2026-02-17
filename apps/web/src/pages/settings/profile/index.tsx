import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";

interface ProfileForm {
  name: string;
  bio: string;
  profileImage: string | null;
  backgroundImage: string | null;
}

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, isAuthenticated, refreshUser } = useAuth();

  const [form, setForm] = useState<ProfileForm>({
    name: "",
    bio: "",
    profileImage: null,
    backgroundImage: null,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [isUploadingBackground, setIsUploadingBackground] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const profileInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }
    if (user) {
      setForm({
        name: user.name || "",
        bio: user.bio || "",
        profileImage: user.profileImage || null,
        backgroundImage: user.backgroundImage || null,
      });
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (form.name.length < 2) {
      newErrors.name = "이름은 2자 이상이어야 합니다.";
    }
    if (form.name.length > 50) {
      newErrors.name = "이름은 50자 이하여야 합니다.";
    }
    if (form.bio.length > 300) {
      newErrors.bio = "소개는 300자 이하여야 합니다.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadImage = async (file: File, folder: string): Promise<string> => {
    const { uploadUrl, publicUrl } = await api.fetch<{
      uploadUrl: string;
      key: string;
      publicUrl: string;
    }>("/uploads/presign", {
      method: "POST",
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        folder,
      }),
    });

    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });

    if (!uploadRes.ok) throw new Error("Upload failed");
    return publicUrl;
  };

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    setIsUploadingProfile(true);
    try {
      const publicUrl = await uploadImage(file, "profiles");
      setForm((prev) => ({ ...prev, profileImage: publicUrl }));
      toast.success("프로필 사진이 업로드되었습니다.");
    } catch {
      toast.error("프로필 사진 업로드에 실패했습니다.");
    } finally {
      setIsUploadingProfile(false);
      e.target.value = "";
    }
  };

  const handleBackgroundImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    setIsUploadingBackground(true);
    try {
      const publicUrl = await uploadImage(file, "profiles");
      setForm((prev) => ({ ...prev, backgroundImage: publicUrl }));
      toast.success("배경 사진이 업로드되었습니다.");
    } catch {
      toast.error("배경 사진 업로드에 실패했습니다.");
    } finally {
      setIsUploadingBackground(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      await api.fetch("/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name: form.name,
          bio: form.bio || null,
          profileImage: form.profileImage,
          backgroundImage: form.backgroundImage,
        }),
      });
      await refreshUser();
      toast.success("프로필이 수정되었습니다.");
      navigate("/profile");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "프로필 수정에 실패했습니다."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const initials = form.name ? form.name.charAt(0).toUpperCase() : "?";
  const isUploading = isUploadingProfile || isUploadingBackground;

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
                  {form.profileImage && (
                    <AvatarImage src={form.profileImage} alt={form.name} />
                  )}
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
              {errors.name ? (
                <p className="text-xs text-destructive">{errors.name}</p>
              ) : (
                <span />
              )}
              <p className="text-xs text-muted-foreground">
                {form.name.length}/50
              </p>
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
              {errors.bio ? (
                <p className="text-xs text-destructive">{errors.bio}</p>
              ) : (
                <span />
              )}
              <p className="text-xs text-muted-foreground">
                {form.bio.length}/300
              </p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={isSaving}
          >
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
    </div>
  );
}
