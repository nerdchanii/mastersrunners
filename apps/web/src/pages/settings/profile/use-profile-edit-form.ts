import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useUpdateProfile } from "@/hooks/useProfile";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

export interface ProfileForm {
  name: string;
  bio: string;
  profileImage: string | null;
  backgroundImage: string | null;
}

async function uploadImage(file: File, folder: string): Promise<string> {
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

  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  if (!uploadResponse.ok) throw new Error("Upload failed");
  return publicUrl;
}

export function useProfileEditForm() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, isAuthenticated, refreshUser } = useAuth();
  const updateProfile = useUpdateProfile();

  const [form, setForm] = useState<ProfileForm>({
    name: "",
    bio: "",
    profileImage: null,
    backgroundImage: null,
  });
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
  }, [authLoading, isAuthenticated, navigate, user]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (form.name.length < 2) nextErrors.name = "이름은 2자 이상이어야 합니다.";
    if (form.name.length > 50) nextErrors.name = "이름은 50자 이하여야 합니다.";
    if (form.bio.length > 300) nextErrors.bio = "소개는 300자 이하여야 합니다.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleProfileImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
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
      event.target.value = "";
    }
  };

  const handleBackgroundImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
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
      event.target.value = "";
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    try {
      await updateProfile.mutateAsync({
        name: form.name,
        bio: form.bio || undefined,
        profileImage: form.profileImage ?? undefined,
        backgroundImage: form.backgroundImage ?? undefined,
      });
      await refreshUser();
      toast.success("프로필이 수정되었습니다.");
      navigate("/profile");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "프로필 수정에 실패했습니다.");
    }
  };

  return {
    authLoading,
    backgroundInputRef,
    errors,
    form,
    handleBackgroundImageChange,
    handleProfileImageChange,
    handleSubmit,
    isSaving: updateProfile.isPending,
    isUploading: isUploadingProfile || isUploadingBackground,
    isUploadingBackground,
    isUploadingProfile,
    profileInputRef,
    setForm,
    setErrors,
  };
}
