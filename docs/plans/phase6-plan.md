# Phase 6: 프로덕션 준비 + 기능 완성도

> Phase 5 완료 기준: 49 suites, 655 tests / 24 API 모듈 / 28 라우트 / 63 컴포넌트
> Phase 6 최종 수정: 2026-02-21

---

## Context

Phase 5까지 핵심 기능 구현 완료. Phase 6는 **기능 완성도 + UX 강화 + 프로덕션 배포 준비**를 목표로 한다.

- 기능: Phase 5 잔여 항목 처리, shadcn/UI 완전 전환
- UX: 다크 모드, 계정 삭제, 해시태그 검색
- 배포: OAuth 실연동, CI/CD 파이프라인 검증, 환경 분리 (마지막 순서)

---

## A. Phase 5 잔여 항목 (Carry-over)

### A-1. 소규모 UI 개선 (M)

- [ ] 워크아웃 수정 페이지 UI (PUT API 연동)
- [ ] 챌린지/이벤트 수정 페이지 UI
- [ ] 포스트 수정 시 이미지 추가/삭제 지원
- [ ] 이미지 갤러리/라이트박스 (풀스크린 이미지 뷰)
- [ ] 피드 PostFeedCard Share/More 버튼 핸들러
- [ ] 메시지 상세 높이 모바일 BottomNav 고려

### A-2. 워크아웃 ↔ 포스트 연동 (M)

- [ ] 워크아웃 완료 후 "포스트로 공유" CTA
- [ ] 워크아웃 상세에서 "이 워크아웃으로 포스트 작성" 버튼

### A-3. shadcn/UI 완전 전환 (L)

- [ ] WorkoutCard shadcn/UI 전환
- [ ] CrewForm shadcn/UI 전환
- [ ] challenges/new 페이지 shadcn/UI 전환
- [ ] events/new 페이지 shadcn/UI 전환

### A-4. TanStack Query 마이그레이션 잔여 (L)

- [ ] messages 페이지 TanStack Query 적용 (현재 useState+useEffect)
- [ ] 온보딩 관심 운동 타입 `/workout-types` API 연동 (현재 하드코딩)

---

## B. OAuth 실연동 ✅ 완료

- [x] 카카오 OAuth 앱 등록 + 콜백 URL 설정
- [x] 구글 OAuth 앱 등록 + 콜백 URL 설정
- [x] 네이버 OAuth 앱 등록 + 콜백 URL 설정
- [x] 환경별 OAuth redirect URI 분리 (dev/staging/prod)
- [x] dev-login 엔드포인트 프로덕션 빌드에서 완전 제거 확인

---

## C. UX 강화 ✅ 완료

### C-1. 다크 모드 ✅

- [x] shadcn/UI CSS 변수 기반 다크 테마 설정
- [x] ThemeProvider + localStorage 테마 저장
- [x] 시스템 설정 연동 (prefers-color-scheme)
- [x] 설정 페이지에 테마 토글 추가

### C-2. 계정 삭제/탈퇴 ✅

- [x] DELETE /profile (soft delete + 개인정보 익명화)
- [x] 탈퇴 확인 UI (비밀번호/OAuth 재인증)
- [x] 관련 데이터 처리 정책 (포스트/댓글/좋아요 유지 vs 삭제)
- [x] 30일 유예 기간 후 영구 삭제 (선택)

### C-3. 해시태그 검색 ✅

- [x] 해시태그 파싱 + 저장 (Post 생성/수정 시 추출)
- [x] GET /posts/hashtag/:tag 엔드포인트
- [x] 해시태그 클릭 → 검색 결과 페이지 연동
- [x] 인기 해시태그 목록 API

---

## D. 고급 기능 (Phase 7 후보)

> Phase 6에서 여건이 되면 착수, 아니면 Phase 7로 이월.

| 항목 | 우선순위 | 비고 |
|------|----------|------|
| **Activity Share Card** | M | Canvas API 워크아웃+사진 합성, SNS 공유 |
| **피드 미니맵** | L | encodedPolyline + 피드 카드 경로 썸네일 |
| 푸시 알림 (FCM/APNs) | M | SSE 보완, 모바일 오프라인 알림 |
| SSE → Redis pub/sub | L | 수평 확장 시 필요 |
| 이미지 서버사이드 최적화 | L | Sharp 기반 리사이즈 + WebP 변환 |
| 경로 분석 (구간 페이스) | L | GPS 포인트별 분석 + 히트맵 |
| PostGIS | L | 근처 워크아웃/크루/이벤트 찾기 |
| 스토리 (24h 포스트) | L | — |
| 동영상 지원 | L | HLS 트랜스코딩 필요 |

---

## E. 프로덕션 배포 (마지막 단계)

> 기능 개발 완료 후 최종 단계에서 진행. 배포는 모든 기능이 안정화된 이후 처리한다.

### E-1. 배포 파이프라인 검증 (H)

- [ ] API Dockerfile 프로덕션 빌드 최적화 (multi-stage, distroless)
- [ ] Cloudflare Pages 프론트엔드 배포 설정 (wrangler.toml 또는 Pages 대시보드)
- [ ] GitHub Actions CI/CD 워크플로 검증 (ci.yml + deploy.yml)
- [ ] 환경변수 분리 (.env.production, .env.staging)
- [ ] 헬스체크 + 모니터링 엔드포인트 확인

### E-2. 보안 강화 (H)

- [ ] CORS 설정 프로덕션 도메인으로 제한
- [ ] JWT secret 프로덕션용 강화 (랜덤 256-bit)
- [ ] Rate limiting 프로덕션 수치 조정
- [ ] Helmet.js 보안 헤더 적용
- [ ] R2 Presigned URL 만료 시간 검토

### E-3. 데이터베이스 프로덕션 (M)

- [ ] PostgreSQL 프로덕션 인스턴스 설정 (managed service 또는 VPS)
- [ ] Prisma 마이그레이션 프로덕션 적용 전략 (migrate deploy)
- [ ] DB 백업 전략 수립
- [ ] 시드 데이터 분리 (workout-types: 프로덕션 필수 / 테스트 데이터: dev only)

---

## AMBIGUOUS / 미결정

- [ ] 온보딩 Funnel: OAuth 최초 로그인 후 강제 vs 스킵 가능 (현재 스킵 가능 구현, 정책 확정 필요)
- [ ] 신발 누적 거리 업데이트 트랜잭션 내 원자성 보장 검토
- [ ] 배포 대상: Google Cloud Run vs 자체 VPS (현재 CI/CD는 GCP 기준)
- [ ] Cloudflare Pages 프론트엔드 배포 방식: wrangler CLI vs Pages 대시보드 Git 연동

---

## 완료 기준

- [x] OAuth 실연동으로 실제 로그인 가능
- [ ] CI/CD 파이프라인으로 자동 배포 가능
- [ ] Phase 5 잔여 UI 항목 전부 처리
- [x] 다크 모드 정상 작동
- [ ] 프로덕션 환경에서 전체 기능 동작 확인
