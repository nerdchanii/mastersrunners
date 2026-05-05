---
doc_state: current
owner: product
last_verified: 2026-03-30
sources:
  - design/operating-rules/document-states.md
  - packages/database/prisma/schema.prisma
  - design/initiatives/I-0011-domain-truth-and-boundary-hardening.md
---

# Masters Runners 도메인 문서

`docs/domain/`은 현재 구현과 운영 기준으로 확인된 비즈니스 truth만 담는다. 미래 기능이나 아직 구현되지 않은 개념은 `design/` 아래 `target` 문서로 관리한다.

## 사용 규칙

- 이 폴더의 문서는 모두 `doc_state: current`다.
- 현재 truth는 `packages/database/prisma/schema.prisma`, 실제 API/Web 구현, 승인된 운영 규칙을 기준으로 검증한다.
- 아직 구현되지 않은 기능이나 용어 실험은 `docs/domain/`에 두지 않는다.

## Current Domain Docs

| 파일 | 설명 | 상태 |
| --- | --- | --- |
| [glossary.md](glossary.md) | 핵심 도메인 용어 사전 | `current` |
| [workout.md](workout.md) | 워크아웃 모델과 단위 규칙 | `current` |
| [post-feed.md](post-feed.md) | 포스트, 피드, 댓글 시스템 | `current` |
| [social.md](social.md) | 팔로우, 차단, 공개 범위 | `current` |
| [crew.md](crew.md) | 크루, 멤버, 활동, 출석 | `current` |
| [challenge.md](challenge.md) | 챌린지 시스템 | `current` |
| [event.md](event.md) | 이벤트와 참가 기록 | `current` |
| [shoe.md](shoe.md) | 신발 관리 | `current` |
| [user-profile.md](user-profile.md) | 프로필, 설정, 알림 | `current` |
| [external-integration.md](external-integration.md) | 파일 업로드와 외부 플랫폼 연동 | `current` |
| [business-rules.md](business-rules.md) | 권한, 삭제, 검증 규칙 | `current` |
| [dm.md](dm.md) | 대화와 메시지 시스템 | `current` |

## Moved Target Docs

- [design/frontend/comparison-dashboard.md](../../design/frontend/comparison-dashboard.md): 비교 대시보드의 미래 설계 초안. 아직 현재 비즈니스 truth가 아니므로 `target`으로 관리한다.

## 아키텍처 개요

- Frontend: Vite + React Router v7 SPA
- API: NestJS 11
- DB: PostgreSQL + Prisma
- 파일 저장: Cloudflare R2 presigned URL
- 인증: OAuth (카카오/구글/네이버)

## 단위 규칙

| 항목 | DB 저장 | UI 표시 |
| --- | --- | --- |
| 거리 | meters (m) | km 또는 mi |
| 시간 | seconds (s) | mm:ss 또는 hh:mm:ss |
| 페이스 | seconds/km | min:sec/km 또는 min:sec/mi |
| 고도 | meters (m) | m 또는 ft |
