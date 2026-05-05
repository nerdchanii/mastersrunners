# UI/UX 가드레일 리뷰

사용자에게 보이는 소비자용 웹 동작을 바꾸는 태스크를 리뷰할 때 이 런북을 사용한다.

## 목적

UX 리뷰를 반복 가능하게 만드는 것이 목적이다. 채팅 기억이나 개인 취향에 의존하지 않고, 레포의 현재 truth를 기준으로 리뷰하도록 한다.

## 기준 문서

- `design/frontend/ux-principles.md`
- `design/frontend/social-surface-patterns.md`
- `design/frontend/writing-and-copy.md`
- `design/frontend/visual-system-rules.md`

## 사용 시점

아래 영역을 건드리는 태스크에서 이 런북을 사용한다.

- `/feed`
- `/posts/:id`
- `/crews`, `/crews/:id`
- `/profile/:id`
- `/workouts/:id`
- 공개 진입 인증 유도
- 그 외 사용자 경험 변화가 있는 소비자용 웹 라우트

## 실앱과 Playwright 검증 구분

- Storybook은 `I-0020`에서 퇴역했으므로 UX 리뷰의 truth로 사용하지 않는다.
- spacing, hierarchy, theme, empty state, section composition은 실제 라우트와 대표 viewport에서 확인한다.
- 실제 라우트 전환, 로그인 리다이렉트, 브라우저 뒤로가기, query invalidation, 공유/인증 계약은 Playwright와 실앱 브라우저 확인을 truth로 본다.
- 리뷰 중 시각 polish가 애매하면 current design docs와 실제 화면을 함께 보고, 동작 계약이 얽히면 Playwright 시나리오로 재확인한다.

## 프론트엔드 리뷰 체크

- 이 라우트가 문서화된 공개 읽기와 보호된 행동의 경계를 따르는가?
- 온페이지 인증 게이트를 기대하는 패턴에서 URL과 라우트 맥락이 보존되는가?
- 오버레이, 다이얼로그, 공개 라우트 우회에서 브라우저 뒤로가기가 예측 가능하게 동작하는가?
- 기본 박스 래퍼가 아니라 명확한 레이아웃 위계로 화면이 구성되어 있는가?

## UI/UX 리뷰 체크

- 페이지가 설명보다 제품 콘텐츠를 먼저 보여주는가?
- 문구가 짧고, 제품답고, 데모/설명형 톤이 아닌가?
- 인증 유도가 실제 행동 결과가 갈리는 순간에만 나타나는가?
- 화면이 일반적인 SaaS 대시보드가 아니라 러너 소셜 제품처럼 느껴지는가?
- 워크아웃 상세가 포함된다면 분석 우선 방향을 유지하고 있는가?

## PO 리뷰 체크

- 이 변경이 의도한 러너 커뮤니티 경험을 실제로 개선하는가?
- 공개와 비공개의 경계가 여전히 명확한가?
- 이 화면이 설명이 많은 제품이 아니라, 더 나은 제품 전달에 기여하는가?

## 태스크 위생

- 사용자용 웹 태스크는 관련 UX 문서를 `artifacts` 또는 `Notes`에서 참조해야 한다.
- 태스크가 UX 규칙에서 의도적으로 벗어난다면, 그 divergence를 명시하고 후속 태스크를 만든다.
