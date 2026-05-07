import { ArrowRight, Check, ChevronLeft, PartyPopper, Sparkles, UserRound } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFunnel } from "@/components/ui/funnel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import { formatRunnerTimeInput, parseRunnerTimeInput } from "@/lib/runner-time";
import { cn } from "@/lib/utils";

import { updateOnboardingProfile } from "./onboarding-api";

const STEPS = [
  { key: "profile", title: "프로필" },
  { key: "runner", title: "러너 정보" },
  { key: "privacy", title: "공개 설정" },
] as const;

const ONBOARDING_STEPS = STEPS.map((step) => step.key);

type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

type OnboardingFunnel = {
  [Step in OnboardingStep]: Record<string, never>;
};

const EMPTY_ONBOARDING_CONTEXT = {};

function FieldSummary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-foreground">{value || "미입력"}</p>
    </div>
  );
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const funnel = useFunnel<OnboardingFunnel>({
    id: "onboarding",
    initialStep: "profile",
    initialContext: EMPTY_ONBOARDING_CONTEXT,
    steps: ONBOARDING_STEPS,
    sync: "history",
  });
  const step = funnel.step;
  const stepIndex = STEPS.findIndex((item) => item.key === step);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState(user?.name ?? "");
  const [intro, setIntro] = useState(user?.bio ?? "");
  const [region, setRegion] = useState(user?.region ?? "");
  const [subRegion, setSubRegion] = useState(user?.subRegion ?? "");
  const [pb5k, setPb5k] = useState(formatRunnerTimeInput(user?.pb5kSeconds));
  const [pb10k, setPb10k] = useState(formatRunnerTimeInput(user?.pb10kSeconds));
  const [pbHalf, setPbHalf] = useState(formatRunnerTimeInput(user?.pbHalfMarathonSeconds));
  const [pbFull, setPbFull] = useState(formatRunnerTimeInput(user?.pbMarathonSeconds));
  const [isPrivate, setIsPrivate] = useState(user?.isPrivate ?? false);

  const handleSkip = () => {
    navigate("/feed", { replace: true });
  };

  const handleNext = () => {
    if (step === "profile" && !name.trim()) {
      toast.error("닉네임을 입력해주세요.");
      return;
    }

    if (step === "profile") {
      funnel.history.push("runner", EMPTY_ONBOARDING_CONTEXT);
      return;
    }

    if (step === "runner") {
      funnel.history.push("privacy", EMPTY_ONBOARDING_CONTEXT);
    }
  };

  const handleBack = () => {
    if (step !== "profile") {
      funnel.history.back();
    }
  };

  const handleFinish = async () => {
    if (!name.trim()) {
      toast.error("닉네임을 입력해주세요.");
      return;
    }

    const pb5kSeconds = parseRunnerTimeInput(pb5k);
    const pb10kSeconds = parseRunnerTimeInput(pb10k);
    const pbHalfMarathonSeconds = parseRunnerTimeInput(pbHalf);
    const pbMarathonSeconds = parseRunnerTimeInput(pbFull);
    const hasInvalidPb =
      (pb5k.trim() && pb5kSeconds == null) ||
      (pb10k.trim() && pb10kSeconds == null) ||
      (pbHalf.trim() && pbHalfMarathonSeconds == null) ||
      (pbFull.trim() && pbMarathonSeconds == null);

    if (hasInvalidPb) {
      toast.error("PB 시간은 mm:ss 또는 hh:mm:ss 형식으로 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateOnboardingProfile({
        name: name.trim(),
        bio: intro.trim() || undefined,
        region: region.trim() || undefined,
        subRegion: subRegion.trim() || undefined,
        isPrivate,
        pb5kSeconds: pb5kSeconds ?? undefined,
        pb10kSeconds: pb10kSeconds ?? undefined,
        pbHalfMarathonSeconds: pbHalfMarathonSeconds ?? undefined,
        pbMarathonSeconds: pbMarathonSeconds ?? undefined,
      });
      await refreshUser();
      toast.success("프로필 설정이 완료되었습니다.");
      navigate("/feed", { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "프로필 저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.14),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.12),_transparent_24%),linear-gradient(to_bottom,_hsl(var(--background)),_hsl(var(--muted)/0.24))] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl flex-col">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              onboarding
            </Badge>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              처음 한 번만, 가볍게 맞춰주세요.
            </h1>
            <p className="text-sm text-muted-foreground">
              닉네임만 필수고, 거점과 PB는 나중에 채워도 괜찮습니다.
            </p>
          </div>

          <Button variant="ghost" onClick={handleSkip} className="shrink-0">
            건너뛰기
          </Button>
        </div>

        <div className="grid flex-1 gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.9fr)]">
          <Card className="overflow-hidden border-border/70 bg-card/95 shadow-2xl shadow-black/5 backdrop-blur">
            <CardContent className="space-y-6 p-6 sm:p-8">
              <div className="flex flex-wrap gap-2">
                {STEPS.map((item, index) => {
                  const active = item.key === step;
                  const done = index < stepIndex;

                  return (
                    <div
                      key={item.key}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        active
                          ? "border-primary bg-primary/10 text-primary"
                          : done
                            ? "border-primary/20 bg-primary/5 text-foreground"
                            : "border-border bg-background text-muted-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-5 items-center justify-center rounded-full text-[10px]",
                          active
                            ? "bg-primary text-primary-foreground"
                            : done
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground",
                        )}
                      >
                        {done ? <Check className="size-3" /> : index + 1}
                      </span>
                      {item.title}
                    </div>
                  );
                })}
              </div>

              {step === "profile" && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-primary">프로필</p>
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                      다른 러너에게 먼저 보여줄 이름을 정해주세요.
                    </h2>
                    <p className="text-sm leading-6 text-muted-foreground">
                      온보딩에서 가장 중요한 건 닉네임입니다. 한 줄 소개는 선택으로 두고, 나머지는
                      흐름을 끊지 않게 나중에 채울 수 있게 했습니다.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">
                      닉네임 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      maxLength={30}
                      placeholder="러너들에게 보일 이름"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="intro">한 줄 소개 (선택)</Label>
                    <Textarea
                      id="intro"
                      value={intro}
                      onChange={(event) => setIntro(event.target.value)}
                      maxLength={120}
                      placeholder="예: 새벽 러닝과 크루 활동을 좋아해요."
                      className="min-h-24"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>러너들이 가장 먼저 읽는 자기소개입니다.</span>
                      <span>{intro.length}/120</span>
                    </div>
                  </div>
                </div>
              )}

              {step === "runner" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-primary">러너 정보</p>
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                      거점과 기록을 가볍게 적어두면 추천이 더 자연스러워집니다.
                    </h2>
                    <p className="text-sm leading-6 text-muted-foreground">
                      지역은 선택이고, PB도 비워둘 수 있습니다. 5K / 10K / HM / FM만 적어도
                      충분합니다.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="region">거점 지역</Label>
                      <Input
                        id="region"
                        value={region}
                        onChange={(event) => setRegion(event.target.value)}
                        placeholder="예: 서울"
                        maxLength={40}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subRegion">세부 지역</Label>
                      <Input
                        id="subRegion"
                        value={subRegion}
                        onChange={(event) => setSubRegion(event.target.value)}
                        placeholder="예: 강남 / 마포"
                        maxLength={40}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <Label>PB 기록</Label>
                        <p className="text-xs text-muted-foreground">
                          시간 형식은 mm:ss 또는 hh:mm:ss로 적으면 됩니다.
                        </p>
                      </div>
                      <Badge variant="outline">선택</Badge>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="pb5k" className="text-xs text-muted-foreground">
                          5K
                        </Label>
                        <Input
                          id="pb5k"
                          value={pb5k}
                          onChange={(event) => setPb5k(event.target.value)}
                          placeholder="21:30"
                          inputMode="text"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pb10k" className="text-xs text-muted-foreground">
                          10K
                        </Label>
                        <Input
                          id="pb10k"
                          value={pb10k}
                          onChange={(event) => setPb10k(event.target.value)}
                          placeholder="45:00"
                          inputMode="text"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pbHalf" className="text-xs text-muted-foreground">
                          HM
                        </Label>
                        <Input
                          id="pbHalf"
                          value={pbHalf}
                          onChange={(event) => setPbHalf(event.target.value)}
                          placeholder="1:40:00"
                          inputMode="text"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pbFull" className="text-xs text-muted-foreground">
                          FM
                        </Label>
                        <Input
                          id="pbFull"
                          value={pbFull}
                          onChange={(event) => setPbFull(event.target.value)}
                          placeholder="3:30:00"
                          inputMode="text"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === "privacy" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-primary">공개 설정</p>
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                      먼저 보일 정도만 정하고, 세부는 나중에 바꿔도 됩니다.
                    </h2>
                    <p className="text-sm leading-6 text-muted-foreground">
                      공개 / 비공개는 언제든 바꿀 수 있습니다. 지금은 편한 쪽으로만 선택하세요.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setIsPrivate(false)}
                      className={cn(
                        "w-full rounded-3xl border px-4 py-4 text-left transition-colors",
                        !isPrivate
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border/70 bg-background/70 hover:bg-accent/40",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "mt-1 flex size-5 items-center justify-center rounded-full border-2",
                            !isPrivate ? "border-primary" : "border-muted-foreground",
                          )}
                        >
                          {!isPrivate && <div className="size-2 rounded-full bg-primary" />}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">공개 계정</p>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            러닝 기록과 게시물이 다른 러너들에게 자연스럽게 노출됩니다.
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsPrivate(true)}
                      className={cn(
                        "w-full rounded-3xl border px-4 py-4 text-left transition-colors",
                        isPrivate
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border/70 bg-background/70 hover:bg-accent/40",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "mt-1 flex size-5 items-center justify-center rounded-full border-2",
                            isPrivate ? "border-primary" : "border-muted-foreground",
                          )}
                        >
                          {isPrivate && <div className="size-2 rounded-full bg-primary" />}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">비공개 계정</p>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            팔로워에게만 보이도록 두고, 온보딩 뒤에 천천히 열 수 있습니다.
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>

                  <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <PartyPopper className="size-4 text-primary" />
                      지금까지 입력한 내용
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <FieldSummary label="닉네임" value={name.trim()} />
                      <FieldSummary label="소개" value={intro.trim()} />
                      <FieldSummary
                        label="거점"
                        value={[region.trim(), subRegion.trim()].filter(Boolean).join(" · ")}
                      />
                      <FieldSummary
                        label="PB"
                        value={[pb5k.trim(), pb10k.trim(), pbHalf.trim(), pbFull.trim()]
                          .filter(Boolean)
                          .join(" / ")}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-border/60 pt-5 sm:flex-row">
                {step !== "profile" ? (
                  <Button variant="outline" onClick={handleBack} className="sm:w-auto">
                    <ChevronLeft className="size-4" />
                    이전
                  </Button>
                ) : (
                  <Button variant="outline" onClick={handleSkip} className="sm:w-auto">
                    나중에 설정
                  </Button>
                )}

                <div className="flex-1" />

                {step !== "privacy" ? (
                  <Button onClick={handleNext} className="sm:w-auto">
                    다음
                    <ArrowRight className="size-4" />
                  </Button>
                ) : (
                  <Button onClick={handleFinish} disabled={isSubmitting} className="sm:w-auto">
                    {isSubmitting ? "저장 중..." : "시작하기"}
                    <ArrowRight className="size-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="border-border/70 bg-card/90 shadow-lg shadow-black/5 backdrop-blur">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <UserRound className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">프로필 요약</p>
                    <p className="text-xs text-muted-foreground">
                      나중에 수정해도 되는 값은 여기서 가볍게 살펴보세요.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <FieldSummary label="닉네임" value={name.trim() || "아직 비어 있어요"} />
                  <FieldSummary label="한 줄 소개" value={intro.trim() || "선택 입력입니다"} />
                  <FieldSummary label="거점" value={region.trim() || "선택 입력입니다"} />
                  <FieldSummary label="공개 설정" value={isPrivate ? "비공개" : "공개"} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-gradient-to-br from-primary/10 via-background to-background">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Sparkles className="size-4 text-primary" />
                  빠르게 시작하기
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  닉네임만 넣고 바로 피드로 들어가도 됩니다. 지역과 PB는 빈칸으로 두고 나중에 채워도
                  흐름이 끊기지 않습니다.
                </p>
                <Button variant="secondary" onClick={handleSkip} className="w-full">
                  지금은 건너뛰기
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
