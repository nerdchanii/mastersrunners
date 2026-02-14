import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = nextUrl.pathname.startsWith("/login") ||
                         nextUrl.pathname.startsWith("/signup");

      // 로그인하지 않은 사용자가 보호된 페이지에 접근하는 경우
      if (!isLoggedIn && !isAuthPage && nextUrl.pathname !== "/") {
        return false; // Redirect to login page
      }

      // 로그인한 사용자가 로그인/회원가입 페이지에 접근하는 경우
      if (isLoggedIn && isAuthPage) {
        return Response.redirect(new URL("/", nextUrl));
      }

      return true;
    },
  },
  providers: [], // Providers are added in auth.ts
} satisfies NextAuthConfig;
