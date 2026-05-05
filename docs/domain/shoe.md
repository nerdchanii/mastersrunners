---
doc_state: current
owner: product
last_verified: 2026-03-30
sources:
  - packages/database/prisma/schema.prisma
  - apps/api/src
---

# 신발 (Shoe)

## 정의

현재 저장소의 신발 모델은 공유 카탈로그와 개인 보유 모델을 분리하지 않는다. canonical 엔티티는 단일 `Shoe`다.

## 핵심 모델

### Shoe

- `userId`
- `brand`
- `model`
- `nickname`
- `imageUrl`
- `totalDistance` (meters)
- `maxDistance` (meters)
- `isRetired`
- `createdAt`

## 워크아웃 연결

- 워크아웃은 `shoeId`로 신발에 연결된다.
- 누적 거리는 신발별 러닝 이력 요약에 사용된다.

## 현재 제약

- 과거 문서의 다중 신발 모델 분리 구조는 현재 스키마와 맞지 않는다.
- 현재 저장소에서 신발은 개인 소유 레코드 단일 모델로 읽는 것이 맞다.
