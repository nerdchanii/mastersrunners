import { Activity, Check, ChevronRight, Lock, PartyPopper, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkoutTypes } from "@/hooks/useMessages";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

import { updateOnboardingProfile } from "./onboarding-api";

const STEPS = [
  { icon: User, label: "프로필" },
  { icon: Activity, label: "관심 운동" },
  { icon: Lock, label: "공개 설정" },
  { icon: PartyPopper, label: "완료" },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { data: workoutTypes = [], isLoading: workoutTypesLoading } = useWorkoutTypes();

  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1 state
  const [name, setName] = useState(user?.name ?? "");
  const [bio, setBio] = useState("");

  // Step 2 state
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  // Step 3 state
  const [isPrivate, setIsPrivate] = useState(false);

  const toggleType = (id: string) => {
    setSelectedTypes((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  const handleFinish = async () => {
    if (!name.trim()) {
      toast.error("닉네임을 입력해주세요.");
      return;
    }
    setIsSubmitting(true);
    try {
      await updateOnboardingProfile({
        name: name.trim(),
        bio: bio.trim() || undefined,
        isPrivate,
      });
      await refreshUser();
      toast.success("프로필 설정이 완료되었습니다!");
      navigate("/feed", { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "프로필 저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* 로고 */}
        <div className="text-center">
          <h1 className="text-2xl font-bold">마스터즈 러너스</h1>
          <p className="text-sm text-muted-foreground mt-1">프로필을 설정하고 시작하세요</p>
        </div>

        {/* 스텝 인디케이터 */}
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center">
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  i < step
                    ? "bg-primary text-primary-foreground"
                    : i === step
                      ? "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {i < step ? <Check className="size-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 w-8 transition-colors",
                    i < step ? "bg-primary" : "bg-muted",
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* 스텝 컨텐츠 */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            {/* Step 1: 프로필 */}
            {step === 0 && (
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-lg font-semibold">닉네임을 설정하세요</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    다른 러너들에게 표시될 이름입니다
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">
                    닉네임 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="닉네임을 입력하세요"
                    maxLength={30}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">소개 (선택)</Label>
                  <Input
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="자신을 소개해보세요"
                    maxLength={150}
                  />
                </div>
              </div>
            )}

            {/* Step 2: 관심 운동 */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-lg font-semibold">관심 운동을 선택하세요</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    여러 개 선택할 수 있습니다 (선택 사항)
                  </p>
                </div>
                {workoutTypesLoading ? (
                  <div className="grid grid-cols-2 gap-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <Skeleton key={i} className="h-11 w-full rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {workoutTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => toggleType(type.id)}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors text-left",
                          selectedTypes.includes(type.id)
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:bg-accent",
                        )}
                      >
                        <span className="truncate">{type.name}</span>
                        {selectedTypes.includes(type.id) && (
                          <Check className="size-3.5 ml-auto shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
                {selectedTypes.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedTypes.map((id) => {
                      const type = workoutTypes.find((t) => t.id === id);
                      return type ? (
                        <Badge key={id} variant="secondary">
                          {type.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: 공개 설정 */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-lg font-semibold">계정 공개 설정</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    나중에 프로필 설정에서 변경할 수 있습니다
                  </p>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => setIsPrivate(false)}
                    className={cn(
                      "w-full flex items-start gap-3 rounded-lg border p-4 text-left transition-colors",
                      !isPrivate ? "border-primary bg-primary/10" : "border-border hover:bg-accent",
                    )}
                  >
                    <div className="mt-0.5">
                      <div
                        className={cn(
                          "size-4 rounded-full border-2 flex items-center justify-center",
                          !isPrivate ? "border-primary" : "border-muted-foreground",
                        )}
                      >
                        {!isPrivate && <div className="size-2 rounded-full bg-primary" />}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">공개 계정</p>
                      <p className="text-sm text-muted-foreground">
                        누구나 내 러닝 기록과 게시글을 볼 수 있습니다
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={() => setIsPrivate(true)}
                    className={cn(
                      "w-full flex items-start gap-3 rounded-lg border p-4 text-left transition-colors",
                      isPrivate ? "border-primary bg-primary/10" : "border-border hover:bg-accent",
                    )}
                  >
                    <div className="mt-0.5">
                      <div
                        className={cn(
                          "size-4 rounded-full border-2 flex items-center justify-center",
                          isPrivate ? "border-primary" : "border-muted-foreground",
                        )}
                      >
                        {isPrivate && <div className="size-2 rounded-full bg-primary" />}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">비공개 계정</p>
                      <p className="text-sm text-muted-foreground">
                        팔로워만 내 기록과 게시글을 볼 수 있습니다
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: 완료 */}
            {step === 3 && (
              <div className="text-center space-y-4 py-4">
                <div className="text-5xl">🎉</div>
                <h2 className="text-lg font-semibold">준비 완료!</h2>
                <p className="text-sm text-muted-foreground">
                  프로필 설정이 완료되었습니다.
                  <br />
                  이제 다른 러너들과 함께 달려보세요!
                </p>
                <div className="pt-2 space-y-1 text-sm text-muted-foreground">
                  <p>
                    닉네임: <span className="font-medium text-foreground">{name}</span>
                  </p>
                  <p>
                    공개 설정:{" "}
                    <span className="font-medium text-foreground">
                      {isPrivate ? "비공개" : "공개"}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 버튼 영역 */}
        <div className="flex gap-3">
          {step > 0 && step < 3 && (
            <Button variant="outline" onClick={handleBack} className="flex-1">
              이전
            </Button>
          )}
          {step < 2 && (
            <Button onClick={handleNext} className="flex-1" disabled={step === 0 && !name.trim()}>
              다음
              <ChevronRight className="size-4 ml-1" />
            </Button>
          )}
          {step === 2 && (
            <Button onClick={handleNext} className="flex-1">
              계속
              <ChevronRight className="size-4 ml-1" />
            </Button>
          )}
          {step === 3 && (
            <Button onClick={handleFinish} className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "저장 중..." : "시작하기!"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
