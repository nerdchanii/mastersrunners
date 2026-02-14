# 신발 (Shoe)

## 정의

러닝화 관리 시스템. 공유 제품 정보(ShoeModel)와 개인 소유 신발(UserShoe), 커뮤니티 리뷰(ShoeReview)로 구성된다.

## 엔티티 구조

### ShoeModel (신발 모델 — 공유)

커뮤니티 전체가 공유하는 제품 정보.

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| brand | string | 브랜드 (Nike, adidas, ASICS 등) |
| modelName | string | 모델명 |
| category | string? | 카테고리 (레이싱, 데일리, 트레일 등) |
| imageUrl | string? | 제품 이미지 |
| releaseYear | int? | 출시 연도 |

### UserShoe (내 신발)

유저가 소유한 개별 신발 인스턴스.

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| userId | UUID | FK → User |
| shoeModelId | UUID | FK → ShoeModel |
| nickname | string? | 유저가 붙인 별명 (예: "대회용 빨간 빠빠") |
| totalDistance | float | 누적 거리 (meters, 워크아웃에서 자동 합산) |
| isRetired | boolean | 은퇴 여부 (기본: false) |
| purchasedAt | date? | 구매일 |
| createdAt | datetime | 등록 시각 |

### ShoeReview (신발 리뷰 — 커뮤니티)

ShoeModel에 대한 커뮤니티 리뷰.

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| userId | UUID | FK → User |
| shoeModelId | UUID | FK → ShoeModel |
| rating | int | 평점 (1~5) |
| content | string | 리뷰 내용 |
| purpose | enum | RACE / TRAINING / DAILY / TRAIL |
| totalDistanceAtReview | float? | 리뷰 시점 누적 거리 |
| createdAt | datetime | 작성 시각 |

## 워크아웃 연결

- Workout에 `userShoeId` (optional FK)
- 워크아웃 등록 시 착용 신발 선택 가능
- 워크아웃의 거리가 UserShoe.totalDistance에 자동 합산

## 삭제 시 동작

- Workout 삭제 시: 해당 워크아웃의 거리만큼 UserShoe.totalDistance에서 차감
- UserShoe 삭제: Workout과의 연결만 해제 (워크아웃은 유지)
