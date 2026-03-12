# 이벤트와 대회 (Event)

## 정의

현재 `Event`는 하나의 대회/이벤트 레코드와 참가(`EventParticipant`)를 중심으로 모델링된다. 과거의 종목 분리 모델은 현재 canonical 모델이 아니다.

## 핵심 모델

### Event

- `title`
- `description`
- `eventType`
  - `MARATHON`
  - `HALF`
  - `TEN_K`
  - `FIVE_K`
  - `ULTRA`
  - `TRAIL`
  - `OTHER`
- `date`
- `location`
- `latitude`, `longitude`
- `distance`
- `organizerId`
- `maxParticipants`
- `registrationDeadline`
- `externalUrl`
- `imageUrl`

### EventParticipant

- `eventId`
- `userId`
- `status`
  - `REGISTERED`
  - `COMPLETED`
  - `DNS`
  - `DNF`
- `bibNumber`
- `goalTime`
- `resultTime`
- `resultRank`
- `workoutId`

## 비즈니스 의미

- 참가 등록과 취소는 `EventParticipant`를 기준으로 일어난다.
- 결과 입력은 별도 결과 엔티티가 아니라 참가 레코드 자체에 저장된다.
- 워크아웃 연결도 `EventParticipant.workoutId`에서 처리한다.

## 프론트엔드 경험

- 이벤트 상세는
  - 등록
  - 취소
  - 결과 입력
  - 워크아웃 연결/해제
    흐름을 한 페이지에서 처리한다.

## 현재 제약

- 과거 설계 문서에는 현재 스키마와 맞지 않는 분리 모델 설명이 남아 있을 수 있다.
- 현재 설계와 도메인 문서는 `Event + EventParticipant` 기준으로 읽어야 한다.
