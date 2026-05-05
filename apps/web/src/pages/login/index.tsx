import { Loader2 } from "lucide-react";
import { Suspense, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth-context";
import { rememberAuthReturnPath, sanitizeAuthReturnPath } from "@/lib/auth-return-path";
import { defaultPublicRuntimeConfig, usePublicRuntimeConfig } from "@/lib/public-config";

import { isLocalApiBase, performDevLogin, startOAuthLogin } from "./login-api";

function LoginContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoading, refreshUser } = useAuth();
  const { data: runtimeConfig, isPending: isRuntimeConfigPending } = usePublicRuntimeConfig();
  const error = searchParams.get("error");
  const intent = searchParams.get("intent") === "signup" ? "signup" : "login";
  const nextPath = sanitizeAuthReturnPath(searchParams.get("next"));
  const destination = nextPath && nextPath !== "/" ? nextPath : "/feed";
  const providers = runtimeConfig?.authProviders ?? defaultPublicRuntimeConfig.authProviders;
  const title = intent === "signup" ? "회원가입" : "로그인";
  const description =
    intent === "signup"
      ? "처음이라면 소셜 계정으로 바로 시작하고, 프로필은 나중에 가볍게 맞춰도 됩니다."
      : "이미 마스터즈러너라면 계속하고, 처음이어도 같은 버튼으로 바로 시작할 수 있습니다.";
  const kakaoLabel = intent === "signup" ? "카카오로 회원가입" : "카카오로 로그인";
  const googleLabel = intent === "signup" ? "Google로 회원가입" : "Google로 로그인";
  const supportCopy =
    intent === "signup"
      ? "이미 가입한 계정이라면 같은 소셜 계정으로 바로 로그인됩니다."
      : "아직 계정이 없어도 같은 소셜 계정으로 바로 시작할 수 있습니다.";

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(destination, { replace: true });
    }
  }, [destination, isAuthenticated, isLoading, navigate]);

  const handleOAuth = (provider: string) => {
    rememberAuthReturnPath(nextPath);
    startOAuthLogin(provider);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div className="flex items-center justify-center gap-2 text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
              <path d="M15 10l4-4" />
              <path d="M19 6v4h-4" />
            </svg>
            <span className="text-2xl font-bold">Masters Runners</span>
          </div>
          <CardTitle className="text-3xl font-bold">{title}</CardTitle>
          <CardDescription className="text-base">{description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive">
              로그인에 실패했습니다. 다시 시도해주세요.
            </div>
          )}

          {providers.kakao && (
            <Button
              onClick={() => handleOAuth("kakao")}
              className="w-full bg-[#FEE500] text-[#191919] hover:bg-[#FEE500]/90"
              size="lg"
            >
              {kakaoLabel}
            </Button>
          )}

          {providers.google && (
            <Button
              onClick={() => handleOAuth("google")}
              variant="outline"
              className="w-full"
              size="lg"
            >
              {googleLabel}
            </Button>
          )}

          <p className="text-center text-xs text-muted-foreground">{supportCopy}</p>

          {!isRuntimeConfigPending && !providers.kakao && !providers.google && (
            <p className="text-center text-xs text-muted-foreground">
              현재 사용 가능한 소셜 로그인이 없습니다.
            </p>
          )}

          {isRuntimeConfigPending && (
            <div className="flex items-center justify-center py-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}

          {isLocalApiBase() && (
            <>
              <Separator className="my-4" />

              <div className="space-y-2">
                <p className="text-center text-xs text-muted-foreground">개발 전용</p>
                <Button
                  onClick={async () => {
                    try {
                      await performDevLogin();
                      await refreshUser();
                      navigate(destination, { replace: true });
                    } catch {
                      // silently fail
                    }
                  }}
                  variant="outline"
                  className="w-full border-dashed"
                  size="lg"
                >
                  개발용 로그인 (OAuth 생략)
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
