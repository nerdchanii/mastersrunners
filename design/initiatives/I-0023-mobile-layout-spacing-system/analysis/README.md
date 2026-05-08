# Mobile Layout & Spacing Audit (CTO 10s)

## 결론(요약)

- 모바일 `apps/web`에서 **라우트 쉘(`MainLayout`)이 기본 거터/컨테이너/하단 여백(pb)을 결정**하지만, 일부 페이지는 이를 상쇄하거나(예: `/feed`의 `-mx-4`) 내부에서 다시 거터를 재구축한다(예: `/profile`, crew hub surface). (`analysis/layout-system.md`)
- spacing이 “토큰/프리미티브”로 추상화되어 있지 않고, `px-4`, `pb-20`, `space-y-4/6`, `max-w-*` 같은 **Tailwind literal이 페이지/컴포넌트 전반에 반복**된다. (`analysis/layout-system.md`, `analysis/pages/*`)
- 대표 불일치(관측): `/feed`는 shell 거터를 상쇄해 full-bleed, `/profile`은 edge-to-edge shell 위에 내부 `px-*`로 재거터링, `/posts/:id`·`/workouts/:id`는 `max-w-*`/`space-y-*` 조합으로 “디테일 페이지 컨테이너”를 만든다. (`analysis/pages/*`)

## 관측된 결손(원인 후보)

- 페이지 바깥 spacing 책임(거터/컨테이너/하단 보정)이 단일 규칙/프리미티브로 고정되어 있지 않다(라우트 쉘 + 페이지 내부 + 컴포넌트 내부가 혼재).
- `BottomNav`의 실제 높이/세이프에어와 페이지의 `pb-*` 보정이 분산되어 “하단 여백” 근거가 여러 군데에 존재한다.
- `container` vs `mx-auto max-w-*` 전략이 혼재해 가로 리듬이 페이지별로 달라질 수 있다.

## 페이지별 현황(링크)

- 라우트 트리/래퍼 스택: `analysis/pages/route-map.md`
- 전체 페이지 인벤토리(라우트→엔트리, 카테고리): `analysis/pages/all-pages.md`
- 상위 레이아웃/spacing 결정 지점: `analysis/layout-system.md`
- `/feed`: `analysis/pages/feed.md`
- `/profile`: `analysis/pages/profile.md`
- `/posts/:id`: `analysis/pages/post-detail.md`
- `/workouts/:id`: `analysis/pages/workout-detail.md`
- `/crews`: `analysis/pages/crews.md`
