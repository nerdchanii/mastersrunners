import { ArrowRight, CalendarDays, MessageCircle, Sparkles, Users } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const pillars = [
  {
    icon: Users,
    title: "활동이 먼저 보입니다",
    description: "러너와 크루를 먼저 발견하고, 참여할 수 있는 흐름을 바로 보여줍니다.",
  },
  {
    icon: MessageCircle,
    title: "채팅으로 연결됩니다",
    description: "관심사가 맞는 사람과 대화를 열고, 크루 안에서 자연스럽게 이어집니다.",
  },
  {
    icon: CalendarDays,
    title: "게시판과 일정이 이어집니다",
    description: "이벤트, 챌린지, 기록을 한 군데에서 살펴보며 다음 행동으로 넘어갑니다.",
  },
];

const signals = ["추천 러너", "추천 크루", "다가오는 이벤트", "참여할 챌린지"];

export default function IntroPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.14),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.14),_transparent_28%),linear-gradient(to_bottom,_hsl(var(--background)),_hsl(var(--muted)/0.28))]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] opacity-35" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="mb-8 flex items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Sparkles className="size-5" />
            </span>
            <div>
              <p className="text-lg font-semibold tracking-tight text-foreground">
                마스터즈 러너스
              </p>
              <p className="text-xs text-muted-foreground">community-first running club</p>
            </div>
          </Link>

          <div className="hidden items-center gap-2 sm:flex">
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              러닝 커뮤니티
            </Badge>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/login">로그인</Link>
            </Button>
          </div>
        </header>

        <main className="grid flex-1 items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-8">
            <div className="space-y-5">
              <Badge className="w-fit rounded-full px-3 py-1">함께 달리는 러닝 커뮤니티</Badge>
              <div className="space-y-4">
                <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  달리기는 혼자 시작해도, 커뮤니티 안에서 더 오래 갑니다.
                </h1>
                <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                  마스터즈 러너스는 활동, 채팅, 게시판을 한 흐름으로 이어서
                  <span className="font-medium text-foreground">
                    {" "}
                    러너를 찾고, 크루를 만나고, 다음 약속으로 이어지는 곳
                  </span>
                  입니다.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-full px-6">
                <Link to="/login">
                  로그인하고 시작하기
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-6">
                <Link to="/feed">먼저 둘러보기</Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {signals.map((signal) => (
                <div
                  key={signal}
                  className="rounded-2xl border border-border/70 bg-background/75 px-4 py-3 text-sm font-medium text-foreground shadow-sm backdrop-blur"
                >
                  {signal}
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <Card className="overflow-hidden border-border/70 bg-card/90 shadow-2xl shadow-black/5 backdrop-blur">
              <CardContent className="space-y-5 p-6 sm:p-8">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-primary">첫 화면에서 보여줄 것</p>
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                    추천 준비가 된 커뮤니티 흐름
                  </h2>
                  <p className="text-sm leading-6 text-muted-foreground">
                    빈 화면이어도 길이 끊기지 않도록, 바로 탐색할 수 있는 모듈부터 배치합니다.
                  </p>
                </div>

                <div className="space-y-3">
                  {pillars.map((pillar) => {
                    const Icon = pillar.icon;
                    return (
                      <div
                        key={pillar.title}
                        className="flex items-start gap-4 rounded-2xl border border-border/60 bg-background/80 p-4"
                      >
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Icon className="size-5" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground">{pillar.title}</p>
                          <p className="text-sm leading-6 text-muted-foreground">
                            {pillar.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">
                    onboarding
                  </p>
                  <p className="mt-2 text-sm leading-6 text-foreground">
                    닉네임만 필수, 지역과 PB는 선택으로 가볍게 시작할 수 있습니다.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}
