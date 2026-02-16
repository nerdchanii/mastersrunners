import { Suspense, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { api, API_BASE } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

function LoginContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoading, refreshUser } = useAuth();
  const error = searchParams.get("error");

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleOAuth = (provider: string) => {
    window.location.href = `${API_BASE}/auth/${provider}`;
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
          <CardTitle className="text-3xl font-bold">로그인</CardTitle>
          <CardDescription className="text-base">
            마스터즈 러너스에 오신 것을 환영합니다
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive">
              로그인에 실패했습니다. 다시 시도해주세요.
            </div>
          )}

          <Button
            onClick={() => handleOAuth("kakao")}
            className="w-full bg-[#FEE500] text-[#191919] hover:bg-[#FEE500]/90"
            size="lg"
          >
            카카오로 시작하기
          </Button>

          <Button
            onClick={() => handleOAuth("google")}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Google로 시작하기
          </Button>

          <Button
            onClick={() => handleOAuth("naver")}
            className="w-full bg-[#03C75A] text-white hover:bg-[#03C75A]/90"
            size="lg"
          >
            네이버로 시작하기
          </Button>

          {API_BASE.includes("localhost") && (
            <>
              <Separator className="my-4" />

              <div className="space-y-2">
                <p className="text-center text-xs text-muted-foreground">
                  개발 전용
                </p>
                <Button
                  onClick={async () => {
                    try {
                      const res = await fetch(`${API_BASE}/auth/dev-login`, {
                        method: "POST",
                      });
                      if (!res.ok) throw new Error("Dev login failed");
                      const data = await res.json();
                      api.setTokens(data.accessToken, data.refreshToken);
                      await refreshUser();
                      navigate("/", { replace: true });
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
