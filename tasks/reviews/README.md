# Task Review Artifacts

이 디렉터리는 reviewer 실행 증빙을 구조화 artifact로 남기는 canonical 위치다.

- 경로: `tasks/reviews/<task-id>/<reviewer>.json`
- 형식: `reviewers/review-artifact.schema.json`
- reviewer 매핑과 protocol 출처: `reviewers/protocols.json`
- 주의: OpenAI/Claude 공식 문서는 protocol 경로를 정의하고, 이 저장소는 그 위에 review artifact overlay 계약을 얹는다.

task markdown의 `리뷰 노트`는 요약용이고, 실제 review 증빙은 이 디렉터리 아래 JSON artifact다. `approved`뿐 아니라 `changes_requested` review도 같은 위치와 schema를 사용한다.
