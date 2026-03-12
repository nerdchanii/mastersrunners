# Harness Scorecard

This file is the scored snapshot against the canonical checklist in `docs/checklists/README.md`.

## Current Snapshot

| Category                      |   Pass |   Fail | Exception |  Total |            Score |
| ----------------------------- | -----: | -----: | --------: | -----: | ---------------: |
| Agent Entry Point             |     14 |      1 |         0 |     15 |              93% |
| Document Structure            |     11 |      1 |         0 |     12 |              92% |
| Invariant Enforcement         |     13 |      1 |         1 |     15 |              93% |
| Architecture                  |     10 |      2 |         0 |     12 |              83% |
| Repository as Source of Truth |      8 |      2 |         0 |     10 |              80% |
| Operations and Maintenance    |      5 |      3 |         2 |     10 |              63% |
| Agent Readability             |      7 |      3 |         0 |     10 |              70% |
| **Total**                     | **68** | **13** |     **3** | **84** | **84% adjusted** |

## Category Targets

| Category                      |  Target |
| ----------------------------- | ------: |
| Agent Entry Point             | 14 / 15 |
| Document Structure            | 11 / 12 |
| Invariant Enforcement         | 14 / 15 |
| Architecture                  | 11 / 12 |
| Repository as Source of Truth | 10 / 10 |
| Operations and Maintenance    |  9 / 10 |
| Agent Readability             |  9 / 10 |

## Item Status

### Agent Entry Point

| category          | item_id | statement                    | current_status | exception_id | evidence_path | owner   | target_task | notes                                                        |
| ----------------- | ------- | ---------------------------- | -------------- | ------------ | ------------- | ------- | ----------- | ------------------------------------------------------------ |
| Agent Entry Point | AEP-001 | 루트에 AGENTS/CLAUDE가 있다  | pass           |              | AGENTS.md     | harness |             |                                                              |
| Agent Entry Point | AEP-002 | 프로젝트 한 줄 요약          | pass           |              | README.md     | docs    |             |                                                              |
| Agent Entry Point | AEP-003 | 기술 스택 명시               | pass           |              | AGENTS.md     | docs    |             |                                                              |
| Agent Entry Point | AEP-004 | 아키텍처 요약                | pass           |              | README.md     | docs    | I-0005-010  | design corpus 후 더 강해짐                                   |
| Agent Entry Point | AEP-005 | 빌드 명령어                  | pass           |              | AGENTS.md     | harness |             |                                                              |
| Agent Entry Point | AEP-006 | 실행 명령어                  | pass           |              | AGENTS.md     | harness |             |                                                              |
| Agent Entry Point | AEP-007 | 테스트 명령어                | pass           |              | AGENTS.md     | harness |             |                                                              |
| Agent Entry Point | AEP-008 | 단일 파일/모듈 테스트 명령어 | pass           |              | AGENTS.md     | harness |             | API 단일 spec 기준                                           |
| Agent Entry Point | AEP-009 | 디렉토리 구조 설명           | pass           |              | README.md     | docs    |             |                                                              |
| Agent Entry Point | AEP-010 | 코딩 컨벤션                  | pass           |              | AGENTS.md     | docs    | I-0003-030  | AGENTS now routes to frontend/backend/commit convention docs |
| Agent Entry Point | AEP-011 | 흔한 실수/주의사항           | pass           |              | AGENTS.md     | harness |             |                                                              |
| Agent Entry Point | AEP-012 | 관련 문서 링크               | pass           |              | README.md     | docs    |             |                                                              |
| Agent Entry Point | AEP-013 | 환경 변수 및 설정 안내       | fail           |              | README.md     | docs    | I-0004-060  | runbook/env index 강화 필요                                  |
| Agent Entry Point | AEP-014 | 의존성 설치 방법             | pass           |              | README.md     | docs    |             |                                                              |
| Agent Entry Point | AEP-015 | 최근 코드 변경 반영          | pass           |              | AGENTS.md     | harness |             | stale refs removed in I-0004                                 |

### Document Structure

| category           | item_id | statement              | current_status | exception_id | evidence_path                                          | owner        | target_task | notes                                          |
| ------------------ | ------- | ---------------------- | -------------- | ------------ | ------------------------------------------------------ | ------------ | ----------- | ---------------------------------------------- |
| Document Structure | DOC-001 | docs 디렉토리 존재     | pass           |              | docs/README.md                                         | docs         |             |                                                |
| Document Structure | DOC-002 | docs 카테고리 구조화   | pass           |              | docs/README.md                                         | docs         |             |                                                |
| Document Structure | DOC-003 | ADR 존재               | pass           |              | design/adr/ADR-0001-repo-source-of-truth-boundaries.md | architecture | I-0005-080  | first accepted ADR pack exists                 |
| Document Structure | DOC-004 | ADR 배경/대안 기록     | pass           |              | design/adr/ADR-0001-repo-source-of-truth-boundaries.md | architecture | I-0005-080  | accepted ADRs include context and alternatives |
| Document Structure | DOC-005 | 개발 가이드 문서화     | pass           |              | docs/guides/review-harness.md                          | docs         |             |                                                |
| Document Structure | DOC-006 | API 문서 존재          | pass           |              | apps/api/src/main.ts                                   | backend      |             | Swagger                                        |
| Document Structure | DOC-007 | README 최소 정보 포함  | pass           |              | README.md                                              | docs         |             |                                                |
| Document Structure | DOC-008 | Progressive Disclosure | pass           |              | README.md                                              | docs         |             |                                                |
| Document Structure | DOC-009 | 상호 참조              | pass           |              | design/README.md                                       | docs         |             |                                                |
| Document Structure | DOC-010 | 인라인 왜 문서화       | pass           |              | apps/api/src/uploads/README.md                         | backend      | I-0005-050  | code-local doc still to migrate                |
| Document Structure | DOC-011 | CHANGELOG/릴리스 노트  | fail           |              | docs/reports/README.md                                 | docs         | I-0004-070  | release-history policy and home needed         |
| Document Structure | DOC-012 | 실행 가능한 코드 예제  | pass           |              | docs/runbooks/deployment.md                            | docs         |             | command examples exist                         |

### Invariant Enforcement

| category              | item_id | statement              | current_status | exception_id | evidence_path                        | owner   | target_task | notes                                                                                                                                                  |
| --------------------- | ------- | ---------------------- | -------------- | ------------ | ------------------------------------ | ------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Invariant Enforcement | INV-001 | Linter 설정 파일 존재  | pass           |              | eslint.config.mjs                    | harness |             |                                                                                                                                                        |
| Invariant Enforcement | INV-002 | Linter 규칙 적절       | pass           |              | eslint.config.mjs                    | harness | I-0006-010  | simple-import-sort and hook rules now enforced                                                                                                         |
| Invariant Enforcement | INV-003 | Formatter 설정 존재    | pass           |              | .prettierrc.json                     | harness | I-0006-010  | explicit Prettier config committed                                                                                                                     |
| Invariant Enforcement | INV-004 | Formatter 자동 적용    | pass           |              | .husky/pre-commit                    | harness |             |                                                                                                                                                        |
| Invariant Enforcement | INV-005 | Type checking 설정     | pass           |              | tsconfig.base.json                   | harness |             |                                                                                                                                                        |
| Invariant Enforcement | INV-006 | Type strictness 적절   | pass           |              | tsconfig.base.json                   | harness |             |                                                                                                                                                        |
| Invariant Enforcement | INV-007 | CI 존재                | pass           |              | .github/workflows/ci.yml             | harness |             |                                                                                                                                                        |
| Invariant Enforcement | INV-008 | CI lint 실행           | pass           |              | .github/workflows/ci.yml             | harness |             |                                                                                                                                                        |
| Invariant Enforcement | INV-009 | CI 테스트 실행         | pass           |              | .github/workflows/ci.yml             | harness |             |                                                                                                                                                        |
| Invariant Enforcement | INV-010 | CI type check 실행     | pass           |              | .github/workflows/ci.yml             | harness | I-0006-080  | explicit `pnpm typecheck` now runs in CI for the currently supported workspace packages; API/database rollout remains tracked separately in I-0006-090 |
| Invariant Enforcement | INV-011 | pre-commit hooks 설정  | pass           |              | .husky/pre-commit                    | harness |             |                                                                                                                                                        |
| Invariant Enforcement | INV-012 | coverage 기준 강제     | pass           |              | apps/api/jest.config.ts              | harness | I-0006-030  | API coverage gate blocks in CI; web coverage remains follow-up work                                                                                    |
| Invariant Enforcement | INV-013 | branch protection 규칙 | exception      | EX-0001      | design/operating-rules/exceptions.md | harness | I-0006-040  | external proof required                                                                                                                                |
| Invariant Enforcement | INV-014 | import 순서 규칙 강제  | pass           |              | eslint.config.mjs                    | harness | I-0006-010  | simple-import-sort is blocking in lint                                                                                                                 |
| Invariant Enforcement | INV-015 | 보안 검사 자동 실행    | pass           |              | .github/workflows/codeql.yml         | harness | I-0006-040  | CodeQL and dependency review workflows are committed                                                                                                   |

### Architecture

| category     | item_id | statement              | current_status | exception_id | evidence_path                                        | owner        | target_task | notes                                           |
| ------------ | ------- | ---------------------- | -------------- | ------------ | ---------------------------------------------------- | ------------ | ----------- | ----------------------------------------------- |
| Architecture | ARC-001 | 레이어 분리            | pass           |              | apps/api/src/                                        | backend      | I-0005-050  | docs still thin                                 |
| Architecture | ARC-002 | 의존성 방향 일관성     | pass           |              | .dependency-cruiser.cjs                              | architecture | I-0006-020  | dependency-cruiser now proves direction rules   |
| Architecture | ARC-003 | 모듈 경계 명확         | fail           |              | design/backend/README.md                             | backend      | I-0005-050  | docs placeholder only                           |
| Architecture | ARC-004 | import 규칙 존재/강제  | pass           |              | .dependency-cruiser.cjs                              | harness      | I-0006-020  | boundary and no-cross-app rules run in CI/local |
| Architecture | ARC-005 | API contract 명시      | pass           |              | apps/api/src/main.ts                                 | backend      | I-0005-060  | Swagger exists, corpus pending                  |
| Architecture | ARC-006 | 설정과 코드 분리       | pass           |              | apps/api/src/main.ts                                 | backend      |             | ConfigService use                               |
| Architecture | ARC-007 | 공통 유틸 중앙화       | pass           |              | apps/web/src/lib/utils.ts                            | frontend     |             |                                                 |
| Architecture | ARC-008 | 에러 처리 패턴 일관    | pass           |              | apps/api/src/common/filters/http-exception.filter.ts | backend      | I-0005-050  | runtime docs pending                            |
| Architecture | ARC-009 | 데이터 모델 한 곳 정의 | pass           |              | packages/database/prisma/schema.prisma               | backend      |             |                                                 |
| Architecture | ARC-010 | 외부 의존성 추상화     | fail           |              | apps/api/src/uploads/storage                         | backend      | I-0005-050  | partial today                                   |
| Architecture | ARC-011 | 테스트 구조 대칭       | pass           |              | apps/api/src/\*_/_.spec.ts                           | backend      |             | web weaker but overall partial pass             |
| Architecture | ARC-012 | 순환 의존성 없음       | pass           |              | .github/workflows/ci.yml                             | harness      | I-0006-020  | pnpm depcruise is blocking in CI/local          |

### Repository as Source of Truth

| category                      | item_id | statement                     | current_status | exception_id | evidence_path                                          | owner        | target_task | notes                                                       |
| ----------------------------- | ------- | ----------------------------- | -------------- | ------------ | ------------------------------------------------------ | ------------ | ----------- | ----------------------------------------------------------- |
| Repository as Source of Truth | SOT-001 | 기술 결정이 레포 내 기록      | pass           |              | design/adr/ADR-0001-repo-source-of-truth-boundaries.md | architecture | I-0005-080  | key architectural decisions are now recorded in ADRs        |
| Repository as Source of Truth | SOT-002 | 구현 배경 정보 존재           | pass           |              | tasks/                                                 | harness      |             | task/review history exists                                  |
| Repository as Source of Truth | SOT-003 | 계획/로드맵 레포 내 관리      | pass           |              | design/initiatives/                                    | harness      |             |                                                             |
| Repository as Source of Truth | SOT-004 | TODO/FIXME와 정리 루프        | fail           |              | tasks/                                                 | harness      | I-0006-060  | no explicit cleanup policy yet                              |
| Repository as Source of Truth | SOT-005 | 의도 파악 가능한 naming       | pass           |              | apps/web/src/hooks                                     | engineering  | I-0007-040  | mostly good                                                 |
| Repository as Source of Truth | SOT-006 | 온보딩 정보 레포에 존재       | pass           |              | README.md                                              | docs         |             |                                                             |
| Repository as Source of Truth | SOT-007 | 외부 의존성 선택 이유 기록    | pass           |              | design/adr/ADR-0002-vite-spa-and-nest-api-split.md     | architecture | I-0005-080  | framework and transport choices now have explicit rationale |
| Repository as Source of Truth | SOT-008 | 레포만으로 처음부터 셋업 가능 | pass           |              | README.md                                              | docs         | I-0004-020  | baseline yes, docs can improve                              |
| Repository as Source of Truth | SOT-009 | commit 메시지 의도 설명       | pass           |              | git history                                            | harness      |             | task trailers used                                          |
| Repository as Source of Truth | SOT-010 | PR 템플릿 존재                | fail           |              | .github/                                               | harness      | I-0006-060  | pending                                                     |

### Operations and Maintenance

| category                   | item_id | statement               | current_status | exception_id | evidence_path                            | owner   | target_task | notes                                                                 |
| -------------------------- | ------- | ----------------------- | -------------- | ------------ | ---------------------------------------- | ------- | ----------- | --------------------------------------------------------------------- |
| Operations and Maintenance | OPS-001 | dead code 도구 설정     | fail           |              | package.json                             | harness | I-0006-050  | pending knip                                                          |
| Operations and Maintenance | OPS-002 | dead code 주기 제거     | fail           |              | docs/reports/                            | harness | I-0006-050  | no process yet                                                        |
| Operations and Maintenance | OPS-003 | 의존성 주기 업데이트    | pass           |              | .github/dependabot.yml                   | harness | I-0006-040  | Dependabot manages weekly npm and GitHub Actions updates              |
| Operations and Maintenance | OPS-004 | stale dependency 식별   | pass           |              | .github/workflows/dependency-review.yml  | harness | I-0006-040  | dependency review plus Dependabot make stale dependency drift visible |
| Operations and Maintenance | OPS-005 | 구조화된 로깅           | fail           |              | apps/api/src/main.ts                     | backend | I-0006-070  | scaffold pending                                                      |
| Operations and Maintenance | OPS-006 | 에러 모니터링 연동      | exception      | EX-0002      | design/operating-rules/exceptions.md     | harness | I-0006-070  | scaffold in repo, live hookup external                                |
| Operations and Maintenance | OPS-007 | health check 엔드포인트 | pass           |              | apps/api/src/health/health.controller.ts | backend |             |                                                                       |
| Operations and Maintenance | OPS-008 | 불필요한 설정 정리      | pass           |              | .gitignore                               | harness | I-0004-030  | generated output rules exist                                          |
| Operations and Maintenance | OPS-009 | Docker 이미지 최적화    | pass           |              | apps/api/Dockerfile                      | backend |             | multi-stage                                                           |
| Operations and Maintenance | OPS-010 | flaky test 관리         | exception      | EX-0003      | design/operating-rules/exceptions.md     | harness | I-0006-060  | policy/report pending, routing proof external today                   |

### Agent Readability

| category          | item_id | statement                | current_status | exception_id | evidence_path                             | owner       | target_task | notes                               |
| ----------------- | ------- | ------------------------ | -------------- | ------------ | ----------------------------------------- | ----------- | ----------- | ----------------------------------- |
| Agent Readability | RDR-001 | 파일명과 구조 예측 가능  | pass           |              | apps/web/src/pages                        | engineering |             |                                     |
| Agent Readability | RDR-002 | 개별 파일 크기 적절      | fail           |              | docs/checklists/harness-scorecard.md      | engineering | I-0007-040  | hotspot list exists                 |
| Agent Readability | RDR-003 | 함수/메서드 크기 적절    | fail           |              | apps/api/src/crews/crews.service.ts       | engineering | I-0007-030  | hotspot exists                      |
| Agent Readability | RDR-004 | 네이밍 일관성            | pass           |              | apps/web/src/hooks                        | engineering |             |                                     |
| Agent Readability | RDR-005 | entry point 명확         | pass           |              | apps/web/src/router.tsx                   | frontend    |             |                                     |
| Agent Readability | RDR-006 | public API 명확          | fail           |              | design/backend/README.md                  | engineering | I-0005-050  | docs and boundaries pending         |
| Agent Readability | RDR-007 | 매직 넘버/문자열 추출    | pass           |              | apps/web/src/lib                          | engineering |             | partial but acceptable              |
| Agent Readability | RDR-008 | 중첩 과도하지 않음       | pass           |              | eslint.config.mjs                         | engineering | I-0007-010  | hotspot-specific follow-up          |
| Agent Readability | RDR-009 | 같은 유형 파일 구조 일관 | pass           |              | apps/web/src/hooks                        | frontend    | I-0005-020  | pages less consistent               |
| Agent Readability | RDR-010 | 주석이 why 설명          | pass           |              | design/operating-rules/document-states.md | docs        | I-0005-050  | code comments mixed, docs improving |

## Readability Budget Registry

| file                                                            | budget | state     | exception_id   | owner       | revisit_date | target_task |
| --------------------------------------------------------------- | -----: | --------- | -------------- | ----------- | ------------ | ----------- |
| apps/web/src/pages/events/[id]/index.tsx                        |    350 | exception | RDR-BUDGET-001 | engineering | 2026-03-31   | I-0007-010  |
| apps/web/src/pages/crews/[id]/activities/[activityId]/index.tsx |    350 | exception | RDR-BUDGET-002 | engineering | 2026-03-31   | I-0007-020  |
| apps/web/src/pages/posts/new/index.tsx                          |    350 | pass      |                | engineering | 2026-03-12   | I-0007-020  |
| apps/web/src/pages/workouts/new/index.tsx                       |    350 | exception | RDR-BUDGET-004 | engineering | 2026-03-31   | I-0007-020  |
| apps/web/src/pages/challenges/[id]/index.tsx                    |    350 | exception | RDR-BUDGET-005 | engineering | 2026-03-31   | I-0007-010  |
| apps/web/src/pages/settings/profile/index.tsx                   |    350 | pass      |                | engineering | 2026-03-12   | I-0007-020  |
| apps/web/src/pages/messages/[id]/index.tsx                      |    350 | pass      |                | engineering | 2026-03-12   | I-0007-010  |
| apps/api/src/crews/crews.service.ts                             |    350 | pass      |                | engineering | 2026-03-12   | I-0007-030  |
