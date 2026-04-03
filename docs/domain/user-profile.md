---
doc_state: current
owner: product
last_verified: 2026-04-03
sources:
  - packages/database/prisma/schema.prisma
  - apps/api/src/profile/profile.controller.ts
  - apps/api/src/profile/profile.service.ts
  - apps/api/src/profile/dto/update-profile.dto.ts
  - apps/web/src/components/profile/ProfileTabs.tsx
  - apps/web/src/pages/settings/profile/index.tsx
  - apps/web/src/pages/settings/profile/use-profile-edit-form.ts
  - apps/web/src/pages/onboarding/index.tsx
---

# 유저 프로필 (User Profile)

## 현재 저장 필드

| 필드                    | 현재 의미                                                  |
| ----------------------- | ---------------------------------------------------------- |
| `name`                  | 표시 이름                                                  |
| `bio`                   | 자기소개                                                   |
| `profileImage`          | 프로필 이미지 URL                                          |
| `backgroundImage`       | 배경 이미지 URL                                            |
| `isPrivate`             | 계정 공개 여부                                             |
| `workoutSharingDefault` | 워크아웃 기본 공개 범위 (`PRIVATE`, `FOLLOWERS`, `PUBLIC`) |
| `region`, `subRegion`   | 지역 정보                                                  |
| `pb5kSeconds`           | 5K PB 기록 (초)                                            |
| `pb10kSeconds`          | 10K PB 기록 (초)                                           |
| `pbHalfMarathonSeconds` | 하프 PB 기록 (초)                                          |
| `pbMarathonSeconds`     | 풀코스 PB 기록 (초)                                        |
| `deletedAt`             | 탈퇴 soft delete 시각                                      |

OAuth 제공자 프로필 이미지 중 지원된 외부 avatar는 인증 경계에서 안전한 `https` URL로 정규화해 저장한다. 현재 이 정규화는 Kakao CDN avatar URL에 한정된다.

## 현재 프로필 화면 구성

### 본인 프로필 / 타인 프로필 공통

- 헤더
- 팔로워/팔로잉 수
- 게시글 수
- 워크아웃 수

### 현재 탭

| 탭         | 현재 내용               |
| ---------- | ----------------------- |
| `posts`    | 사용자의 포스트 목록    |
| `workouts` | 사용자의 워크아웃 목록  |
| `crews`    | 사용자가 속한 크루 목록 |

현재 profile tab surface에는 `shoes`, `race records`, 사용자별 ON/OFF 탭 설정이 없다.

## 현재 수정 가능한 프로필 정보

설정 화면, 온보딩, API 기준으로 현재 수정 surface는 아래에 집중된다.

- `name`
- `bio`
- `profileImage`
- `backgroundImage`
- `region`
- `subRegion`
- `isPrivate`
- `workoutSharingDefault` API 필드는 존재하지만 현재 설정 UI에서 적극적으로 노출되지는 않는다.
- `pb5kSeconds`
- `pb10kSeconds`
- `pbHalfMarathonSeconds`
- `pbMarathonSeconds`

Onboarding에서는 `name`을 필수로 받고, `bio`, `region`, `subRegion`, PB 4종, `isPrivate`를 선택적으로 설정할 수 있다. 러닝 수준, 주력 거리, 관심 운동 타입은 현재 온보딩 current truth가 아니다.
프로필 수정 화면에서는 `region`, `subRegion`, PB 4종을 다시 `null`로 비워둘 수 있어야 한다.

## 프로필 접근 규칙

- 본인 프로필은 항상 조회 가능하다.
- 타인 프로필은 차단 관계면 조회할 수 없다.
- 비공개 계정은 팔로우 상태에 따라 접근/액션이 달라질 수 있다.
- 타인 프로필에서 direct conversation 시작과 follow/unfollow 요청이 가능하다.

## 알림

현재 알림 시스템은 Notification 엔티티와 SSE 전달을 사용한다.

### 현재 저장 필드

| 필드            | 의미                     |
| --------------- | ------------------------ |
| `type`          | 알림 유형                |
| `referenceType` | 관련 엔티티 종류         |
| `referenceId`   | 관련 엔티티 ID           |
| `message`       | 사용자에게 보여줄 메시지 |
| `isRead`        | 읽음 여부                |
| `createdAt`     | 생성 시각                |

### 현재 동작

- 목록 조회
- unread count 조회
- 개별 읽음 처리
- 전체 읽음 처리
- SSE 기반 실시간 인앱 전달

현재 구현 기준으로는 “유형별 알림 설정”, “푸시/인앱 채널 분리 설정” 같은 사용자 제어 surface를 current truth로 볼 수 없다.

## 현재 truth에서 제외한 오래된 설명

- 러닝 경력, 목표, 러닝 수준, 주력 거리까지 현재 기본 프로필 필드라고 본 설명
- shoes 탭, race records 탭이 현재 프로필 탭에 존재한다는 설명
- 사용자별 항목 ON/OFF 노출 제어가 구현되어 있다는 설명
- 알림 유형별 ON/OFF, 푸시 분기 설정이 현재 제공된다는 설명
