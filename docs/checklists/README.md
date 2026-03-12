# Harness Checklist

This file is the authoritative checklist-definition registry for the repository harness.

## Authority

- This file defines the canonical checklist items, category totals, and item IDs.
- `docs/checklists/harness-scorecard.md` is the scored snapshot against this registry.
- Changing category totals or adding/removing checklist items requires:
  - updating this file
  - updating the scorecard
  - adding an ADR when the change materially alters score math or governance boundaries

## Score Math

- Category score: `pass / (total - exception)`
- `exception` never counts as `pass`
- `exception` rows in the scorecard must include `exception_id`

## Row Schema

The scorecard must contain:

- `category`
- `item_id`
- `statement`
- `current_status` (`pass`, `fail`, `exception`)
- `exception_id`
- `evidence_path`
- `owner`
- `target_task`
- `notes`

## Categories

### 1. Agent Entry Point (15)

- `AEP-001`: 레포 루트에 `AGENTS.md` 또는 `CLAUDE.md` 파일이 존재하는가
- `AEP-002`: 프로젝트 한 줄 요약이 포함되어 있는가
- `AEP-003`: 기술 스택이 명시되어 있는가
- `AEP-004`: 아키텍처 요약이 포함되어 있는가
- `AEP-005`: 빌드 명령어가 복사-붙여넣기 가능한 형태로 기재되어 있는가
- `AEP-006`: 실행 명령어가 기재되어 있는가
- `AEP-007`: 테스트 실행 명령어가 기재되어 있는가
- `AEP-008`: 단일 파일/모듈 테스트 명령어가 기재되어 있는가
- `AEP-009`: 디렉토리 구조 설명이 포함되어 있는가
- `AEP-010`: 코딩 컨벤션이 기재되어 있는가
- `AEP-011`: 흔한 실수/주의사항이 기재되어 있는가
- `AEP-012`: 관련 문서 링크가 제공되는가
- `AEP-013`: 환경 변수 및 설정 안내가 있는가
- `AEP-014`: 의존성 설치 방법이 명시되어 있는가
- `AEP-015`: 최근 코드 변경사항을 반영하고 있는가

### 2. Document Structure (12)

- `DOC-001`: `docs/` 디렉토리가 존재하는가
- `DOC-002`: `docs/` 내부가 카테고리별로 구조화되어 있는가
- `DOC-003`: ADR이 존재하는가
- `DOC-004`: ADR에 결정 배경과 대안이 기록되어 있는가
- `DOC-005`: 개발 가이드가 문서화되어 있는가
- `DOC-006`: API 문서가 존재하는가
- `DOC-007`: `README.md`가 최소한의 정보를 포함하는가
- `DOC-008`: Progressive Disclosure 구조인가
- `DOC-009`: 문서 간 상호 참조가 있는가
- `DOC-010`: 코드 내 인라인 문서가 왜를 설명하는가
- `DOC-011`: CHANGELOG 또는 릴리스 노트가 관리되고 있는가
- `DOC-012`: 문서에 실행 가능한 코드 예제가 포함되어 있는가

### 3. Invariant Enforcement (15)

- `INV-001`: Linter 설정 파일이 존재하는가
- `INV-002`: Linter 규칙이 프로젝트에 적절한가
- `INV-003`: Formatter 설정이 존재하는가
- `INV-004`: Formatter가 자동 적용되는가
- `INV-005`: Type checking이 설정되어 있는가
- `INV-006`: Type checking 엄격도가 적절한가
- `INV-007`: CI/CD 파이프라인이 존재하는가
- `INV-008`: CI에서 lint가 실행되는가
- `INV-009`: CI에서 테스트가 실행되는가
- `INV-010`: CI에서 type check가 실행되는가
- `INV-011`: Pre-commit hooks가 설정되어 있는가
- `INV-012`: 테스트 커버리지 기준이 설정되고 CI에서 강제되는가
- `INV-013`: Branch protection 규칙이 설정되어 있는가
- `INV-014`: Import 순서 규칙이 도구로 강제되는가
- `INV-015`: 보안 검사(의존성 취약점 스캔)가 자동 실행되는가

### 4. Architecture (12)

- `ARC-001`: 레이어 분리가 되어 있는가
- `ARC-002`: 의존성 방향이 일관적인가
- `ARC-003`: 모듈 경계가 명확한가
- `ARC-004`: Import 규칙이 존재하고 강제되는가
- `ARC-005`: API contract가 명시적으로 정의되어 있는가
- `ARC-006`: 설정과 코드가 분리되어 있는가
- `ARC-007`: 공통 유틸리티가 중앙화되어 있는가
- `ARC-008`: 에러 처리 패턴이 프로젝트 전반에서 일관적인가
- `ARC-009`: 데이터 모델이 한 곳에서 정의되어 있는가
- `ARC-010`: 외부 의존성이 추상화 레이어를 통해 접근되는가
- `ARC-011`: 테스트 구조가 소스 구조와 대칭적인가
- `ARC-012`: 순환 의존성이 없는가

### 5. Repository as Source of Truth (10)

- `SOT-001`: 기술적 결정이 레포 내에 기록되는가
- `SOT-002`: 왜 그렇게 구현했는지 배경 정보가 코드/commit/PR에 있는가
- `SOT-003`: 계획/로드맵이 레포 내에서 관리되는가
- `SOT-004`: TODO/FIXME가 이슈와 연결되고 주기적으로 정리되는가
- `SOT-005`: 변수명, 함수명만으로 의도를 파악할 수 있는가
- `SOT-006`: 온보딩에 필요한 모든 정보가 레포에 있는가
- `SOT-007`: 외부 의존성 선택 이유가 기록되어 있는가
- `SOT-008`: 레포만으로 개발 환경을 처음부터 셋업할 수 있는가
- `SOT-009`: Commit 메시지가 변경의 의도를 충분히 설명하는가
- `SOT-010`: PR 템플릿이 존재하는가

### 6. Operations and Maintenance (10)

- `OPS-001`: Dead code 탐지 도구가 설정되어 있는가
- `OPS-002`: Dead code가 주기적으로 제거되고 있는가
- `OPS-003`: 의존성이 주기적으로 업데이트되는가
- `OPS-004`: Stale/deprecated 의존성이 식별되고 있는가
- `OPS-005`: 구조화된 로깅이 적용되어 있는가
- `OPS-006`: 에러 모니터링 도구가 연동되어 있는가
- `OPS-007`: Health check 엔드포인트가 있는가
- `OPS-008`: 불필요한 설정 파일이 정리되어 있는가
- `OPS-009`: Docker 이미지가 최적화되어 있는가
- `OPS-010`: Flaky test가 관리되고 있는가

### 7. Agent Readability (10)

- `RDR-001`: 파일명과 디렉토리 구조만으로 코드 위치를 예측할 수 있는가
- `RDR-002`: 개별 파일이 적절한 크기를 유지하는가
- `RDR-003`: 함수/메서드가 적절한 크기인가
- `RDR-004`: 네이밍 컨벤션이 프로젝트 전반에서 일관적인가
- `RDR-005`: 애플리케이션 entry point가 명확히 식별 가능한가
- `RDR-006`: 모듈의 public API가 명확히 정의되어 있는가
- `RDR-007`: 매직 넘버/문자열이 상수로 추출되어 있는가
- `RDR-008`: 조건문/반복문 중첩이 과도하지 않은가
- `RDR-009`: 같은 유형의 파일이 일관된 내부 구조를 따르는가
- `RDR-010`: 주석이 what이 아닌 why를 설명하는가
