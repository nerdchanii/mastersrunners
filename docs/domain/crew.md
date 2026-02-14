# 크루 (Crew)

## 정의

러닝 동호회/클럽 단위. 멤버 관리, 활동, 출석, 공지를 지원한다.

## 엔티티 구조

### Crew (크루)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| name | string | 크루 이름 |
| description | string? | 크루 소개 |
| imageUrl | string? | 크루 프로필 이미지 |
| isPublic | boolean | 검색/노출 여부 |
| createdAt | datetime | 생성 시각 |

### CrewMember (크루 멤버)

| 필드 | 타입 | 설명 |
|------|------|------|
| crewId | UUID | FK → Crew |
| userId | UUID | FK → User |
| role | enum | OWNER / ADMIN / MEMBER |
| joinedAt | datetime | 가입 시각 |

### CrewTag (크루 태그)

멤버에게 태그/호칭을 부여한다. 사실상 소그룹 역할도 겸한다.

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| crewId | UUID | FK → Crew |
| name | string | 태그 이름 (예: "A조", "페이스메이커", "6분대", "화목조") |
| color | string? | 표시 색상 |

### CrewMemberTag (멤버-태그 연결)

| 필드 | 설명 |
|------|------|
| crewMemberId | FK → CrewMember |
| crewTagId | FK → CrewTag |

한 멤버에 여러 태그 부여 가능. 태그 기반으로 활동/공지/출석 필터링 가능.

## 가입 규칙

- **승인제**: 가입 신청 → OWNER/ADMIN 승인
- 승인 전까지 크루 내부 콘텐츠 열람 불가
- 탈퇴는 본인이 언제든 가능

## 역할 & 권한

| 권한 | OWNER | ADMIN | MEMBER |
|------|-------|-------|--------|
| 크루 설정 변경 | O | O | X |
| 멤버 승인/거절 | O | O | X |
| 멤버 추방(Ban) | O | O | X |
| 태그 관리 | O | O | X |
| 활동 생성 | O | O | X |
| QR 출석 생성 | O | O | X |
| 공지 작성 | O | O | X |
| 활동 참여 | O | O | O |
| QR 출석 체크 | O | O | O |
| ADMIN 임명/해제 | O | X | X |
| 크루 삭제 | O | X | X |

## 추방 (Ban)

### CrewBan

| 필드 | 타입 | 설명 |
|------|------|------|
| crewId | UUID | FK → Crew |
| userId | UUID | FK → User |
| bannedBy | UUID | FK → User (추방 실행자) |
| reason | string? | 사유 |
| bannedAt | datetime | 추방 시각 |

### 규칙

- 추방된 유저는 **해당 크루 운영진이 해제하기 전까지** 재가입 불가
- 추방 시 크루 멤버십 즉시 삭제
- 추방 해제 = CrewBan 레코드 삭제 (이후 재가입 신청 가능)

## 활동 (CrewActivity)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| crewId | UUID | FK → Crew |
| title | string | 활동명 (예: "토요 정기런", "한강 번개런") |
| description | string? | 설명 |
| activityDate | datetime | 활동 일시 |
| location | string? | 장소 |
| createdBy | UUID | FK → User |

## 출석 (CrewAttendance)

### QR 출석 시스템

1. 운영진(OWNER/ADMIN)이 활동별 QR 코드 생성
2. **체크인 시간 윈도우** 설정: 30분, 1시간, 종일 등
3. QR은 화면 표시 또는 인쇄 가능
4. 멤버가 핸드폰으로 QR 스캔 → 출석 완료

### CrewAttendance

| 필드 | 타입 | 설명 |
|------|------|------|
| activityId | UUID | FK → CrewActivity |
| userId | UUID | FK → User |
| checkedInAt | datetime | 체크인 시각 |
| method | enum | QR_SCAN / MANUAL (운영진 수동 체크) |
