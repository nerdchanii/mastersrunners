# 외부 플랫폼 연동 (External Integration)

## 연동 우선순위

| 순위 | 플랫폼 | 방식 | 사유 |
|------|--------|------|------|
| 1 | FIT/GPX 수동 업로드 | 파일 파싱 | API 승인 불필요, 모든 GPS 워치 지원 |
| 2 | Garmin Connect | OAuth + API | 한국 GPS 워치 점유율 1위 |
| 3 | Coros | OAuth + API | 국내 사용자 증가 추세 |
| 4 | Strava | OAuth + API | 한국 철수로 우선순위 낮음, 기존 사용자 선택적 지원 |

## FIT/GPX 파일 업로드

### 흐름

1. 유저가 앱에서 파일 업로드 요청
2. NestJS API가 JWT 검증 후 Presigned URL 발급
3. 프론트엔드가 Presigned URL로 Cloudflare R2에 직접 업로드
4. 업로드 완료 후 API에 알림 → 파일 파싱
5. 파싱 결과로 Workout 자동 생성 (유저 확인/수정 후 저장)

### 지원 데이터

- 거리, 시간, 페이스, 심박, 케이던스, 고도
- GPS 경로 (위도/경도/고도/타임스탬프)
- 랩 데이터

### 파일 저장

- Cloudflare R2 (S3 호환)
- Presigned URL로 인증된 접근 (JWT → Presigned URL 변환)
- 원본 파일 보관 (WorkoutFile 엔티티)

## Garmin Connect API (2순위)

- OAuth 2.0 인증
- Activity 동기화 (Push/Pull)
- 랩, 심박, GPS 데이터 포함
- ConnectedPlatform 엔티티로 연결 관리

## Coros API (3순위)

- OAuth 인증
- Activity 동기화
- 구체적 API 스펙은 TBD

## Strava API (4순위)

### 한국 시장 상황

- **2023년 8월부터 한국 시장 철수** (앱스토어 제거, 신규 다운로드 불가)
- API 자체는 사용 가능

### API 제약

- Rate limit: 200 requests/15분, 2,000/일
- FIT/GPX 직접 다운로드 불가 (Streams → 변환 필요)
- 경쟁 앱 금지 조항 존재
- AI 학습 데이터 사용 금지 (2024.11 정책)

### 활용 방안

- 기존 Strava 사용자의 과거 데이터 마이그레이션 용도
- 신규 연동보다는 선택적 지원

## ConnectedPlatform (연결 플랫폼)

| 필드 | 타입 | 설명 |
|------|------|------|
| userId | UUID | FK → User |
| platform | enum | GARMIN / COROS / STRAVA |
| accessToken | string | 암호화 저장 필수 |
| refreshToken | string | 암호화 저장 필수 |
| expiresAt | datetime | 토큰 만료 시각 |
| connectedAt | datetime | 연결 시각 |

> 토큰은 반드시 암호화하여 저장. 평문 저장 금지.
