# 마스터스러너스 (mastersrunners)

한국 러너들을 위한 훈련 기록, 커뮤니티, 크루 운영 도구를 만드는 모노레포입니다.

## 현재 상태

이 저장소는 초기 준비 단계 설명을 넘어 실제 제품 기능과 하네스 구조를 함께 담는 모노레포입니다. 현재 코드베이스에는 다음 기능 축이 구현되어 있습니다.

- 워크아웃 기록과 업로드
- 피드, 게시물, 댓글, 좋아요
- 프로필, 팔로우, 차단
- 크루, 크루 게시판, 활동, 출석, QR 체크인
- 챌린지, 이벤트
- 메시지/대화, 알림
- 파일 업로드와 스토리지 연동

현재 하네스 기준의 진행 상황과 점수는 `docs/checklists/harness-scorecard.md`에서 관리합니다.

## 기술 스택

- Web: Vite + React 19 + React Router v7
- API: NestJS 11
- Database: Prisma + PostgreSQL
- Shared packages: `packages/database`, `packages/types`
- Storage: Cloudflare R2 중심, 로컬 디스크 fallback 지원
- Test tooling: Jest, Playwright

## 저장소 구조

```text
apps/
  web/        # Vite SPA
  api/        # NestJS API
packages/
  database/   # Prisma schema and database package
  types/      # Shared TypeScript types
design/       # Technical design, architecture, ADR, initiatives
docs/         # Domain docs, runbooks, reports, checklists, guides
tasks/        # Initiative-scoped execution queue
scripts/      # Executable helper scripts
```

## 빠른 시작

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 개발 서버 실행

```bash
pnpm dev
```

### 3. 빌드

```bash
pnpm build
```

### 4. 테스트

```bash
pnpm --filter @masters/api test
pnpm --filter @masters/api test:e2e
```

### 5. 배포 검증

```bash
pnpm deploy:verify -- http://localhost:4000
```

## 하네스 진입점

이 저장소는 에이전트 친화적인 하네스로 정리 중입니다. 문서를 읽을 때는 아래 순서를 권장합니다.

1. [AGENTS.md](./AGENTS.md)
2. [docs/checklists/README.md](./docs/checklists/README.md)
3. [tasks/](./tasks)
4. [design/](./design)
5. [docs/domain/](./docs/domain)
6. [docs/runbooks/](./docs/runbooks)

역할은 다음처럼 나뉩니다.

- `design/`: 프론트엔드, 백엔드, 아키텍처, ADR, initiative
- `docs/`: 도메인 규칙, 운영 가이드, 체크리스트, 보고서, 일반 가이드
- `tasks/`: 실제 실행 상태
- `.github/workflows/`, `scripts/`: 실행 가능한 자동화

## 주요 문서

- [AGENTS.md](./AGENTS.md): 표준 에이전트 진입점
- [docs/checklists/README.md](./docs/checklists/README.md): 하네스 체크리스트 정의
- [docs/checklists/harness-scorecard.md](./docs/checklists/harness-scorecard.md): 현재 점수와 예외 포함 상태 스냅샷
- [design/README.md](./design/README.md): 설계 문서 경계
- [docs/README.md](./docs/README.md): 문서 구조 설명
- [docs/domain/README.md](./docs/domain/README.md): 도메인 문서 인덱스
- [docs/runbooks/environment-and-settings.md](./docs/runbooks/environment-and-settings.md): 환경 변수와 런타임 설정의 첫 진입점
- [docs/runbooks/deployment.md](./docs/runbooks/deployment.md): 배포 runbook
- [design/initiatives/I-0004-truth-model-cleanup.md](./design/initiatives/I-0004-truth-model-cleanup.md): truth-model cleanup
- [design/initiatives/I-0005-current-state-design-corpus.md](./design/initiatives/I-0005-current-state-design-corpus.md): current-state design corpus
- [design/initiatives/I-0006-guardrail-hardening.md](./design/initiatives/I-0006-guardrail-hardening.md): guardrail hardening
- [design/initiatives/I-0007-readability-hardening.md](./design/initiatives/I-0007-readability-hardening.md): readability hardening

## 주의사항

- 프론트엔드는 현재 SPA이며, 저장소에 남아 있는 `.next` 산출물은 source of truth가 아닙니다.
- 워크아웃 canonical unit은 `meters`, `seconds`, `seconds per kilometer`입니다.
- 공개 health endpoint는 `GET /health`입니다.

## 환경과 설정

- 환경 변수와 런타임 설정은 [docs/runbooks/environment-and-settings.md](./docs/runbooks/environment-and-settings.md)에서 먼저 찾습니다.
- production-like 예제 값은 [`.env.production.example`](./.env.production.example)에 있습니다.
- 배포/런타임 계약은 [docs/runbooks/deployment.md](./docs/runbooks/deployment.md)의 `Environment Contract`를 기준으로 봅니다.

## 문의

- 이메일: runnerchanii@gmail.com
