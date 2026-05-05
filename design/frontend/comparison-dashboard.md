---
doc_state: target
owner: product
last_verified: 2026-03-30
sources:
  - design/initiatives/I-0011-domain-truth-and-boundary-hardening.md
  - docs/domain/README.md
---

# Comparison Dashboard

이 문서는 아직 구현되지 않은 비교 대시보드의 목표 상태를 기록한다. 현재 비즈니스 truth가 아니므로 `docs/domain/`이 아니라 `design/` 아래에서 관리한다.

## Scope

워크아웃 데이터를 다양한 기준으로 비교하고 분석하는 대시보드 기능.

## Candidate Comparison Modes

### 1. Companion Comparison

- 같은 날짜, 유사 GPS 위치, 유사 시간대에 달린 러너와 기록 비교
- 비교 항목: 거리, 페이스, 심박

### 2. Personal History Comparison

- 동일 또는 유사 코스 기준으로 과거 기록과 현재 기록 비교
- 월간, 분기, 연간 단위 성장 추이 제공

### 3. Route Comparison

- 유사 위치와 코스를 자동 그룹핑
- 동일 코스 반복 시 기록 변화 추적
- 루트 유사도 알고리즘은 별도 설계가 필요함

## Open Design Questions

- 비교 UI와 위젯 구성을 어디까지 제품 범위에 포함할지
- 동반 러너 매칭 기준을 어떤 신호로 확정할지
- 통계 집계 주기와 저장 방식을 어떻게 둘지
- 루트 유사도 계산을 실시간으로 할지 배치로 할지
