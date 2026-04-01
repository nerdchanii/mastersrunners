import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/lib/auth-context";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const user = await refreshUser();
      if (cancelled) {
        return;
      }

      if (user) {
        navigate("/", { replace: true });
      } else {
        navigate("/login?error=auth_failed", { replace: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate, refreshUser]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-muted-foreground">로그인 처리 중...</p>
    </div>
  );
}
