---
doc_state: current
owner: product
last_verified: 2026-03-30
sources:
  - packages/database/prisma/schema.prisma
  - apps/api/src/uploads/uploads.controller.ts
  - apps/api/src/uploads/uploads.service.ts
  - apps/api/src/uploads/uploads.module.ts
  - apps/api/src/uploads/storage/disk-storage.adapter.ts
  - apps/api/src/uploads/storage/r2-storage.adapter.ts
  - design/backend/upload-ingestion.md
---

# 외부 업로드와 플랫폼 연동 (External Integration)

## 현재 구현된 integration boundary

현재 제품에서 검증된 integration surface는 두 축이다.

1. 업로드/파일 파싱 경계
2. 스키마에만 존재하는 외부 플랫폼 연결 메타데이터

## 현재 업로드 경계

### Presigned upload

- 클라이언트는 `POST /uploads/presign`으로 업로드 타겟을 요청한다.
- API는 파일 타입과 folder intent를 검증한다.
- 저장소 adapter가 업로드 URL, storage key, public URL을 만든다.
- 클라이언트는 그 URL로 직접 업로드한다.

### 저장소 adapter

- `UploadsModule`은 환경에 따라 `DiskStorageAdapter` 또는 `R2StorageAdapter`를 선택한다.
- 개발/검증 경로에서는 disk fallback이 사용될 수 있다.
- R2 환경에서는 presigned URL 기반 업로드를 제공한다.

### 현재 파일 타입

- 이미지: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- 워크아웃 파일: `application/octet-stream` 기반 FIT/GPX 흐름

## 현재 워크아웃 파일 ingestion

현재 구현된 자동 파이프라인은 FIT/GPX 업로드다.

1. presign 발급
2. 파일 업로드
3. `POST /uploads/parse`
4. API가 파일을 다운로드하고 FIT/GPX를 파싱
5. `Workout`과 `WorkoutFile`을 즉시 생성

즉, 현재 구현은 “업로드 후 사용자가 한번 더 확인/수정한 뒤 저장”보다 “parse 시점에 workout 생성”에 가깝다.

## ConnectedPlatform / SyncLog

스키마에는 아래 엔티티가 존재한다.

- `ConnectedPlatform`
- `SyncLog`

현재 current truth 기준으로는 Garmin/Coros/Strava/Suunto 동기화 모듈이 제품 surface로 완성되어 있다고 보기 어렵다. 따라서:

- 플랫폼 연결 메타데이터용 스키마는 존재한다.
- 하지만 실사용 OAuth 연결, 주기 동기화, 벤더별 import UX를 current product rule로 문서화하지 않는다.

## 현재 truth에서 제외한 오래된 설명

- Garmin/Coros/Strava 우선순위가 이미 제품 roadmap으로 확정되었다는 표현
- Garmin/Coros/Strava API 동기화가 현재 사용자 기능으로 제공된다는 설명
- Strava 정책/시장 상황을 현재 구현 규칙처럼 다루는 설명

이런 내용이 필요하면 `target` 설계나 product planning 문서에서 관리해야 한다.
