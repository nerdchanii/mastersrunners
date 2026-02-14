"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { API_BASE } from "@/lib/api-client";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();
  const error = searchParams.get("error");

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleOAuth = (provider: string) => {
    window.location.href = `${API_BASE}/auth/${provider}`;
  };

  if (isLoading) return null;

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">로그인</h2>
        <p className="mt-2 text-sm text-gray-600">
          마스터즈 러너스에 오신 것을 환영합니다
        </p>
      </div>

      {error && (
        <p className="text-red-500 text-sm text-center">
          로그인에 실패했습니다. 다시 시도해주세요.
        </p>
      )}

      <button
        onClick={() => handleOAuth("kakao")}
        className="w-full py-3 px-4 bg-[#FEE500] text-[#191919] rounded-lg font-medium hover:brightness-95 transition"
      >
        카카오로 시작하기
      </button>

      <button
        onClick={() => handleOAuth("google")}
        className="w-full py-3 px-4 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
      >
        Google로 시작하기
      </button>

      <button
        onClick={() => handleOAuth("naver")}
        className="w-full py-3 px-4 bg-[#03C75A] text-white rounded-lg font-medium hover:brightness-95 transition"
      >
        네이버로 시작하기
      </button>
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
