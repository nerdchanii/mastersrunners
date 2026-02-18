# Phase 6 QA Report

> Playwright E2E 테스트로 발견된 이슈 목록
> 최종 결과: **40/40 tests passed** (2026-02-18)

---

## 실제 코드 버그

### 1. [CRITICAL] NestJS 앱 시작 실패 — NotificationsModule DI 에러
- **증상**: JwtSseGuard에서 JwtService 의존성 해결 실패 → 앱 시작 불가
- **원인**: NotificationsModule에 AuthModule(JwtModule 포함) import 누락
- **파일**: `apps/api/src/notifications/notifications.module.ts`
- **상태**: ✅ 수정 완료

### 2. [CRITICAL] 삭제된 유저 재로그인 불가 — deletedAt 미초기화
- **증상**: OAuth 재로그인해도 JWT strategy가 deletedAt 체크하여 401 반환
- **원인**: `upsertOAuthUser()`가 update 시 `deletedAt: null`로 초기화하지 않음
- **파일**: `apps/api/src/auth/auth.service.ts`, `apps/api/src/auth/repositories/user.repository.ts`
- **상태**: ✅ 수정 완료 — `restoreDeletedUser()` 메서드 추가

### 3. [HIGH] API 빌드 TS 에러 — notifications-sse.service.ts
- **증상**: `data: unknown`이 `MessageEvent.data: string | object`에 할당 불가
- **파일**: `apps/api/src/notifications/notifications-sse.service.ts:37`
- **상태**: ✅ 수정 완료

### 4. [HIGH] API 빌드 TS 에러 — Swagger 타입 불일치
- **증상**: SwaggerModule.createDocument/setup에 INestApplication 타입 불일치
- **파일**: `apps/api/src/main.ts:43-44`
- **상태**: ✅ 수정 완료

### 5. [HIGH] CORS 설정 불일치 — FRONTEND_URL 포트
- **증상**: 프론트엔드(localhost:3001)에서 API(localhost:4000)로의 요청이 CORS 차단
- **원인**: `.env`의 `FRONTEND_URL`이 `http://localhost:3000`으로 설정 (실제는 3001)
- **파일**: `apps/api/.env`
- **상태**: ✅ 수정 완료

---

## 테스트 인프라 이슈 (코드 버그 아님)

### 6. [MEDIUM] Playwright login() 함수 race condition
- **증상**: localStorage 토큰 설정 후 /auth/me 응답 전에 ProtectedRoute가 /login으로 redirect
- **원인**: `waitForLoadState("networkidle")`가 React의 API 호출보다 먼저 resolve됨
- **해결**: `page.route("**/auth/me")` 인터셉트 + `addInitScript`로 토큰 사전 설정
- **상태**: ✅ 해결 완료

### 7. [MEDIUM] Playwright locator 미스매치 — CSS/text selector 혼용
- **증상**: `text="해시태그", [value="hashtag"]` 등의 혼합 selector가 CSS attribute로 해석
- **해결**: `page.getByRole("tab", { name: /해시태그/ })`, `page.getByText()` 등 Playwright 네이티브 API 사용
- **상태**: ✅ 해결 완료

---

## 수정 이력

| # | 날짜 | 이슈 | 조치 |
|---|------|------|------|
| 1 | 2026-02-18 | NotificationsModule DI | AuthModule import 추가 |
| 2 | 2026-02-18 | 삭제 유저 재로그인 | `restoreDeletedUser()` 추가 |
| 3 | 2026-02-18 | SSE data type | `unknown` → `string \| object` |
| 4 | 2026-02-18 | Swagger type | `app as any` 캐스팅 |
| 5 | 2026-02-18 | CORS FRONTEND_URL | 3000 → 3001 포트 수정 |
| 6 | 2026-02-18 | Playwright login race | route intercept + addInitScript |
| 7 | 2026-02-18 | Playwright locator | getByRole/getByText 네이티브 API 전환 |
