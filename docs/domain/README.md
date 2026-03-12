# Masters Runners 도메인 문서

현재 도메인 문서는 `packages/database/prisma/schema.prisma`, `design/`, 그리고 실제 route/API 구현을 기준으로 유지한다. 오래된 phase/.omc 용어가 남아 있으면 현재 canonical 모델로 정정하는 것이 우선이다.

## 문서 구조

| 파일                                               | 설명                                 | 상태              |
| -------------------------------------------------- | ------------------------------------ | ----------------- |
| [glossary.md](glossary.md)                         | 핵심 도메인 용어 사전                | Synced 2026-03-12 |
| [workout.md](workout.md)                           | 워크아웃 모델 & 분류체계             | Synced 2026-03-12 |
| [post-feed.md](post-feed.md)                       | 포스트, 피드, 댓글 시스템            | Synced 2026-03-12 |
| [social.md](social.md)                             | 팔로우, 차단, 공개 범위              | Confirmed         |
| [crew.md](crew.md)                                 | 크루 시스템 (멤버, 태그, 활동, 출석) | Synced 2026-03-12 |
| [challenge.md](challenge.md)                       | 챌린지 시스템                        | Confirmed         |
| [event.md](event.md)                               | 대회/이벤트 시스템                   | Synced 2026-03-12 |
| [shoe.md](shoe.md)                                 | 신발 관리                            | Synced 2026-03-12 |
| [user-profile.md](user-profile.md)                 | 유저 프로필 & 알림                   | Confirmed         |
| [external-integration.md](external-integration.md) | 외부 플랫폼 연동                     | Confirmed         |
| [business-rules.md](business-rules.md)             | 검증, 삭제, 권한 규칙                | Confirmed         |
| [dm.md](dm.md)                                     | 메시지/대화 시스템                   | Synced 2026-03-12 |
| [comparison-dashboard.md](comparison-dashboard.md) | 비교 대시보드                        | TBD               |

## 아키텍처 개요

- **Frontend**: Vite + React Router v7 (SPA) → Cloudflare Pages
- **API**: NestJS 11 (Self-hosted Docker) — 모든 비즈니스 로직, OAuth
- **DB**: PostgreSQL (Self-hosted Docker)
- **파일 저장**: Cloudflare R2 (Presigned URL)
- **인증**: OAuth (카카오/구글/네이버)

## 단위 규칙

| 항목   | DB 저장     | UI 표시                    |
| ------ | ----------- | -------------------------- |
| 거리   | meters (m)  | km 또는 mi (유저 설정)     |
| 시간   | seconds (s) | mm:ss 또는 hh:mm:ss        |
| 페이스 | seconds/km  | min:sec/km 또는 min:sec/mi |
| 고도   | meters (m)  | m 또는 ft (유저 설정)      |
