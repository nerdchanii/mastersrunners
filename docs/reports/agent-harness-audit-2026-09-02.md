# Agent Harness Audit: Claude Code + Codex (2026-09-02)

- **Date**: 2026-09-02
- **Mode**: Audit + Maintenance
- **Scope**: 에이전트 지시 계층(`AGENTS.md`, `CLAUDE.md`, `AGENTS.override.md`), Claude Code 표면(`.claude/`), Codex 표면(`.codex/`, `.agents/`), 태스크·문서 하네스(`tasks/`, `design/operating-rules/`, `docs/runbooks/`), 가드레일 연결(`scripts/`, `.husky/`, `.github/workflows/`), git 상태
- **Baseline commit**: `5d05bea` (`dev`)
- **Tooling observed**: Claude Code 2.1.258, codex-cli 0.152.0, ast-grep 0.42.1
- **Evidence rule**: 모든 주장은 `path:#LXX`로 인용한다. 커밋되지 않은 워킹트리 파일에서 나온 근거는 `[wt]`를 붙인다.
- **Follow-up**: `design/initiatives/I-0027-agent-harness-alignment.md`

## 1. 요약

이 저장소는 에이전트 지시의 단일 소스(`AGENTS.md`)와 태스크 폴더 기반 상태 모델이라는 좋은 뼈대를 갖고 있다. 그러나 I-0025에서 리뷰 하네스를 걷어낸 뒤 남은 잔재, 그 뒤에 커밋되지 않은 채 쌓인 I-0026 작업, 그리고 Claude와 Codex 사이의 설정 비대칭이 겹쳐 현재 하네스는 "문서가 가리키는 것"과 "에이전트가 실제로 읽는 것"이 다른 상태다.

영역별 판정:

| 영역                  | 판정 | 한 줄 요약                                                                                             |
| --------------------- | ---- | ------------------------------------------------------------------------------------------------------ |
| A. 지시 계층          | 미흡 | Codex만 읽는 gitignore된 override가 존재하고, 문서가 의존하는 진단 스킬이 없다                         |
| B. Claude Code 표면   | 미흡 | tracked 공유 설정이 없고, 로컬 설정에 JWT 토큰이 들어 있으며 전역 ignore에 의존                        |
| C. Codex 표면         | 보통 | 폐기된 feature 키, 빈 hooks placeholder, 절반만 진행된 스킬 리팩터가 미커밋 상태                       |
| D. 태스크·문서 하네스 | 미흡 | 활성 태스크와 새 `prompts/` 디렉터리가 미커밋이고, 퇴역 하네스 잔재가 남아 있다                        |
| E. 가드레일 연결      | 미흡 | 문서가 언급하는 스크립트 2개가 어디에도 연결되지 않고, pre-push의 `ci:local`은 `dev`에서 항상 실패한다 |
| F. Git 상태           | 미흡 | 하네스 변경이 로컬 `dev`에만 있고 `origin/dev`는 26커밋, `main`은 62커밋 뒤에 있다                     |

가장 먼저 처리해야 할 다섯 가지:

1. `AGENTS.override.md`를 없애거나 tracked 파일로 승격해 Claude와 Codex가 같은 지시를 읽게 한다 (F-01).
2. `.claude/settings.local.json`의 JWT 토큰을 제거하고 토큰을 폐기하며, 리포 `.gitignore`에 로컬 설정 경로를 명시한다 (F-05).
3. I-0026 산출물과 `.gitignore`, `.codex/config.toml`, ast-grep 스킬 변경을 커밋하거나 되돌려 워킹트리를 닫는다 (F-09, F-11, F-13).
4. `harness-diagnostics` 의존을 해소한다. 스킬을 리포에 vendoring하거나, 런북과 `exceptions.md`의 `P1`–`P12` 참조를 리포 내부 정의로 바꾼다 (F-02, F-15).
5. `AGENTS.md`에 하네스 맵을 추가해 어떤 파일을 어떤 에이전트가 읽는지, 무엇이 tracked이고 무엇이 로컬인지 명시한다 (F-03).
6. `pnpm ci:local`의 knip 단계를 `dev`에서 녹색으로 되돌린다. 이 단계가 빨간 동안 pre-push 훅은 모든 push를 막고, `--no-verify` 습관과 로컬 브랜치 드리프트를 낳는다 (F-18).

## 2. AS-IS 하네스 맵

| 표면                                        | tracked              | Claude 읽음         | Codex 읽음    | 상태                                                                  |
| ------------------------------------------- | -------------------- | ------------------- | ------------- | --------------------------------------------------------------------- |
| `AGENTS.md`                                 | 예                   | 예 (CLAUDE.md 경유) | 예            | 정상. 단, 하네스 맵과 `prompts/` 등록이 없음                          |
| `CLAUDE.md`                                 | 예                   | 예                  | 아니오        | `AGENTS.md`로 위임하는 포인터. 정상                                   |
| `AGENTS.override.md`                        | 아니오 (ignored)     | 아니오              | 예            | Codex 전용 비가시 지시. 모델 역할·읽기 순서를 재정의함                |
| `.claude/settings.json`                     | 없음                 | -                   | -             | 공유 설정 부재                                                        |
| `.claude/settings.local.json`               | 아니오 (전역 ignore) | 예                  | 아니오        | 70여 개 allow 규칙, JWT 토큰, stale plugin 참조                       |
| `.claude/commands/project-status.md`        | 아니오 (ignored)     | 예                  | 아니오        | 존재하지 않는 subagent 타입과 문서를 참조하는 죽은 커맨드             |
| `.claude/agents/`, `.claude/skills/`        | 비어 있음            | -                   | -             | I-0025에서 제거됨. `.gitignore`는 여전히 허용 목록 유지               |
| `.codex/config.toml`                        | 예                   | 아니오              | 예            | 폐기된 `codex_hooks` 키 포함. 정리본은 미커밋                         |
| `.codex/hooks.json`                         | 예                   | 아니오              | 예            | `{"hooks": {}}` 빈 placeholder                                        |
| `.codex/environments/environment.toml`      | 아니오 (ignored)     | 아니오              | 예            | 자동 생성. 정상                                                       |
| `.agents/skills/ast-grep/`                  | 예                   | 아니오              | 예            | 유일한 tracked 스킬. Claude는 이 경로를 읽지 않음. 분할 리팩터 미커밋 |
| `prompts/ai-slop/*.md`                      | 아니오 (untracked)   | 아니오              | override 경유 | I-0026 산출물. `AGENTS.md`에 등록되지 않음                            |
| `prompts/user_requst.md`                    | 아니오 (ignored)     | 아니오              | override 경유 | 읽기 순서에 포함된 파일이 clone에 존재하지 않음                       |
| `tasks/reviews/**`                          | 예                   | 예                  | 예            | 역사적 증거. README가 삭제된 `reviewers/` 스키마를 canonical로 지칭   |
| `docs/runbooks/harness-diagnostics.md`      | 예                   | 예                  | 예            | 존재하지 않는 `$harness-diagnostics` 스킬의 사용법                    |
| 사용자 전역 hooks (`~/.claude`, `~/.codex`) | 리포 밖              | 예                  | 예            | 민감값 마스킹 훅이 여기에만 있음. 리포는 자체 훅 없음                 |

## 3. 발견 사항

심각도는 High, Medium, Low 세 단계다. 각 항목은 근거, 문제, AS-IS, TO-BE 순으로 적는다.

### A. 지시 계층

#### F-01 · High · Codex만 읽는 gitignore된 `AGENTS.override.md`

- 근거: `AGENTS.override.md:#L3` [wt], `AGENTS.override.md:#L20` [wt], `AGENTS.override.md:#L79`–`#L82` [wt], `.gitignore:#L100` [wt]
- 문제: Codex CLI는 같은 디렉터리의 `AGENTS.override.md`를 `AGENTS.md`보다 우선 읽는다. Claude Code는 이 파일을 읽지 않는다. 이 파일은 읽기 순서, 평가 방법, 모델 역할 분담까지 재정의하는데 `.gitignore`에 등록되어 있어 clone에는 존재하지 않는다. 결과적으로 같은 리포에서 Codex 세션과 Claude 세션이 서로 다른 운영 규칙을 따르고, 그 차이가 git 이력에 남지 않는다.
- AS-IS: 로컬 전용 override가 Codex 세션의 실질적 최상위 지시다.
- TO-BE: override 파일은 사용하지 않는다. 평가 작업 전용 규칙이 필요하면 `prompts/ai-slop/developer-instructions.md`처럼 tracked 문서로 두고, `AGENTS.md`의 하네스 맵에서 "이 작업을 할 때는 이 문서를 읽는다"로 연결한다. `AGENTS.override.md`는 `.gitignore`에서도 제거해 실수로 생성되면 `git status`에 드러나게 한다.

#### F-02 · High · 문서가 의존하는 `harness-diagnostics` 스킬이 어디에도 없음

- 근거: `AGENTS.md:#L15`, `AGENTS.md:#L144`, `README.md:#L17`, `docs/runbooks/harness-diagnostics.md:#L3`, `docs/runbooks/harness-diagnostics.md:#L15`–`#L16`, `design/operating-rules/exceptions.md:#L17`, `docs/README.md:#L25`
- 문제: 리포 문서 7곳이 `$harness-diagnostics`를 "온디맨드 하네스 감사 도구"로 지정한다. 이 스킬은 `.agents/skills/`, `.claude/skills/`, 사용자 전역 `~/.claude/skills/`, `~/.codex/skills/` 어디에도 없다. 런북은 존재하지 않는 도구의 `Audit`, `Maintenance`, `Setup` 모드 사용법을 설명하고, `exceptions.md` 스키마는 이 스킬이 정의하는 `P1`–`P12` 원칙 id를 필수 필드로 요구한다.
- AS-IS: 하네스 감사 절차가 리포 밖 비공개 스킬에 묶여 있고, 그 스킬이 사라져 절차 전체가 실행 불가능하다.
- TO-BE: 두 가지 중 하나를 고른다. (a) 스킬을 `.agents/skills/harness-diagnostics/`로 vendoring하고 Claude 쪽 미러를 둔다. (b) 런북을 리포 내부 절차로 다시 쓰고, `P1`–`P12`를 `design/operating-rules/harness-principles.md`에 리포 자체 정의로 옮긴다. 이 보고서는 (b)를 권장한다. 외부 스킬 버전에 리포 규칙이 종속되는 구조가 이번 문제의 원인이기 때문이다.

#### F-03 · Medium · `AGENTS.md`에 하네스 맵이 없고 `prompts/`가 등록되지 않음

- 근거: `AGENTS.md:#L19`–`#L31` (Source of Truth Map), `design/initiatives/I-0026-ai-slop-evaluation-orchestration.md:#L27`–`#L32` [wt]
- 문제: `AGENTS.md`는 `.claude/`, `.codex/`, `.agents/` 중 어느 것도 언급하지 않는다. 어떤 파일이 두 에이전트에 공유되고 어떤 파일이 한쪽 전용인지, 무엇이 tracked인지 알 방법이 없다. I-0026이 추가한 최상위 `prompts/` 디렉터리도 Source of Truth Map에 없어서 `AGENTS.md`만 따르는 에이전트는 발견하지 못한다.
- AS-IS: 하네스 구조 지식이 `.gitignore`의 허용 목록과 개인 기억에만 있다.
- TO-BE: `AGENTS.md`에 `## Agent Harness Map` 섹션을 추가한다. 5절에 제안 본문이 있다.

#### F-04 · Medium · 지시 문서에 모델명이 하드코딩됨

- 근거: `AGENTS.override.md:#L79`–`#L82` [wt], `prompts/ai-slop/strategy.md:#L50`–`#L64` [wt], `design/initiatives/I-0026-ai-slop-evaluation-orchestration.md:#L13`–`#L17` [wt]
- 문제: `gpt-5.5`, `gpt-5.3-codex-spark`, `gpt-5.4-mini` 같은 모델명이 이니셔티브, 전략, override 세 곳에 중복으로 박혀 있다. 사용자 전역 Codex 설정은 이미 다른 기본 모델을 쓴다. 모델이 바뀔 때마다 세 문서를 고쳐야 하고, Claude 세션에는 대응 모델이 정의되어 있지 않다.
- AS-IS: 역할과 모델이 문서마다 따로 묶여 있다.
- TO-BE: `design/operating-rules/agent-roles.md` 한 곳에 "역할 → 요구 능력 등급 → Codex 모델 / Claude 모델" 표를 두고, 다른 문서는 역할 이름만 참조한다.

### B. Claude Code 표면

#### F-05 · High · `settings.local.json`에 JWT 토큰이 있고 리포 `.gitignore`가 아닌 전역 ignore에만 의존

- 근거: `.claude/settings.local.json:#L54` [wt], `~/.config/git/ignore:#L1` (git check-ignore 결과), `.gitignore:#L64`–`#L72`
- 문제: allow 규칙 안에 서명된 JWT 문자열이 그대로 들어 있다. 이 파일이 커밋되지 않는 이유는 리포 `.gitignore`가 아니라 이 머신의 전역 git ignore 한 줄이다. 리포 `.gitignore`의 `.claude/` 규칙은 `!.claude/`로 즉시 무효화되고, 이후 `commands/`만 다시 ignore하므로 `settings.local.json`은 리포 규칙상 tracked 후보다. 다른 머신이나 다른 기여자는 이 파일을 그대로 커밋할 수 있다.
- AS-IS: 비밀값이 로컬 설정에 상주하고, 보호 장치가 리포 밖에 있다.
- TO-BE: 토큰이 들어간 규칙을 삭제하고 해당 토큰을 폐기한다. `.gitignore`에 `.claude/settings.local.json`을 명시한다. 토큰 같은 값은 allow 규칙이 아니라 환경 변수로만 다룬다.

#### F-06 · Medium · 과도하고 낡은 permission allowlist와 stale plugin 참조

- 근거: `.claude/settings.local.json:#L12`, `#L33`, `#L47`, `#L49`, `#L53`, `#L70`–`#L72`, `#L76` [wt], `~/.claude/plugins/installed_plugins.json` (rulebased-harness 없음), `~/.claude/settings.json` (`defaultMode: auto`)
- 문제: `Bash(pnpm:*)`, `Bash(npx:*)`, `Bash(python3:*)`, `Bash(curl:*)`, `Bash(git reset:*)`, `Bash(pkill:*)`처럼 사실상 무제한인 규칙이 섞여 있고, 옛 경로 `/Users/gim-yechan/project/mastersrunners`를 고정한 규칙이 남아 있다. `enabledPlugins`의 `rulebased-harness`는 설치 목록에 없다. 사용자 전역 설정이 `defaultMode: auto`라서 이 allowlist는 실질적으로 동작하지 않는 죽은 목록이다.
- AS-IS: 권한 목록이 의도를 설명하지 못하고 관리도 되지 않는다.
- TO-BE: tracked `.claude/settings.json`에 리포가 의도하는 최소 allow와 명시적 deny(`.env*` 읽기 등)만 둔다. 로컬 파일은 개인 편의 규칙만 담고 주기적으로 비운다.

#### F-07 · Low · 죽은 `/project-status` 커맨드

- 근거: `.claude/commands/project-status.md:#L24`, `#L27`, `#L39`, `#L54`, `#L71`, `#L129` [wt], `.gitignore:#L71`–`#L75`
- 문제: `oh-my-claudecode:explore` / `oh-my-claudecode:writer` subagent 타입은 이 환경에 없고, 파싱 대상 `docs/phase4-plan.md`도 없다. `.gitignore`의 `.omc/` 항목은 예전에 쓰던 플러그인의 흔적이다. 파일은 ignore되어 있지만 세션의 스킬 목록에는 `project-status`로 계속 노출된다.
- AS-IS: 실행하면 실패하는 커맨드가 노출된다.
- TO-BE: 삭제한다. 진행도 리포트가 필요하면 `tasks/` 폴더 상태를 읽는 tracked 스킬로 다시 만든다.

#### F-08 · Medium · tracked `.claude/settings.json` 부재, `.claude/worktrees/`가 ignore되지 않음

- 근거: `.gitignore:#L63`–`#L72`, `git check-ignore .claude/worktrees/...` 결과 (미ignore), `.gitignore:#L95` (`.worktrees`만 ignore)
- 문제: Claude Code용 공유 설정 파일이 없어서 리포가 Claude 세션에 기대하는 권한, 훅, 환경 변수가 정의되지 않았다. Claude Code가 격리 worktree를 만드는 기본 위치 `.claude/worktrees/`는 ignore되지 않아 `git status`에 노출된다.
- AS-IS: Claude 쪽 리포 설정이 사실상 0이다.
- TO-BE: `.claude/settings.json`을 추가하고 `.gitignore`에 `.claude/worktrees/`를 넣는다. 5절 참고.

### C. Codex 표면

#### F-09 · Medium · `.codex/config.toml`의 폐기 키와 미커밋 정리본

- 근거: `.codex/config.toml:#L2`–`#L3` (tracked), `codex features list` (`hooks` stable, `multi_agent` stable, `codex_hooks` 미존재), 워킹트리 diff [wt]
- 문제: tracked 버전은 `codex_hooks = false`와 `multi_agent = true`를 담고 있다. codex-cli 0.152에서 `codex_hooks`는 알려진 feature가 아니고 `multi_agent`는 기본 stable이다. 워킹트리에는 두 줄을 지운 정리본이 있지만 6월 이후 커밋되지 않았다.
- AS-IS: tracked 설정이 낡았고 정리본은 로컬에만 있다.
- TO-BE: 정리본을 커밋한다. `[agents] max_threads = 10`, `max_depth = 2`는 유지하되 왜 그 값인지 한 줄 주석을 붙인다.

#### F-10 · Low · 빈 `hooks.json` placeholder

- 근거: `.codex/hooks.json:#L1`–`#L3`, `design/initiatives/I-0025-agent-review-harness-retirement.md:#L22`
- 문제: I-0025는 이 파일을 "runtime configuration"이라며 보존했지만 내용은 빈 객체다. 리포가 Codex에 거는 훅이 하나도 없다는 뜻이고, 민감값 마스킹 같은 보호는 사용자 전역 `~/.codex/hooks.json`에만 있다.
- AS-IS: 있어도 아무 일도 하지 않는 파일.
- TO-BE: 리포가 원하는 최소 훅을 넣거나 파일을 삭제한다. 최소 후보는 `.env*` 읽기 차단과 `tasks/archive/**` 수정 차단이다.

#### F-11 · Medium · ast-grep 스킬의 절반 진행된 리팩터와 Claude 미공유

- 근거: `.agents/skills/ast-grep/SKILL.md:#L51`, 워킹트리 diff (`references/patterns.md` 139줄 삭제, `references/patterns/{ts-js,react,python,yaml}.md` untracked) [wt]
- 문제: `SKILL.md`는 여전히 `references/patterns.md`를 가리키는데 워킹트리에서 그 파일은 제목만 남았고 실제 예시는 untracked 4개 파일로 옮겨졌다. 커밋되면 링크가 깨지고, 커밋 안 하면 로컬과 clone이 다르다. 또한 `.agents/skills/`는 Codex 전용 경로라 유일한 tracked 스킬을 Claude는 쓰지 못한다. TypeScript 모노레포에 `python.md` 패턴이 추가된 것도 범위 밖이다.
- AS-IS: 스킬 하나가 두 상태로 갈라져 있고 한쪽 에이전트만 쓴다.
- TO-BE: 분할을 확정하고 `SKILL.md` 링크를 갱신해 커밋한다. `python.md`는 제외한다. `.claude/skills/ast-grep/SKILL.md`를 얇은 포워더로 추가해 Claude도 같은 스킬을 읽게 한다.

#### F-12 · Medium · fan-out 설정만 있고 오케스트레이션 계약이 없음

- 근거: `.codex/config.toml:#L6`–`#L8`, `git show 5d05bea --stat` (`initiative-orchestration-contract`, `worker-handoff-closeout-contract` 스킬 삭제), `AGENTS.override.md:#L119`–`#L126` [wt]
- 문제: I-0025는 오케스트레이션 계약 스킬을 지웠지만 `max_threads = 10`, `max_depth = 2`라는 병렬 실행 설정은 남겼다. 그 뒤 유일한 위임 규칙은 gitignore된 override와 untracked `prompts/`에만 있다. 10개 스레드가 무엇을 기준으로 위임하고 회수하는지 tracked 문서가 없다.
- AS-IS: 실행 용량은 열려 있고 규칙은 닫혀 있다.
- TO-BE: `design/operating-rules/agent-roles.md`에 위임 원칙(읽기 전용 역할, 결과 반환 형식, 범위 밖 경로 처리)을 짧게 적고, 평가 전용 상세는 `prompts/ai-slop/developer-instructions.md`가 담당하도록 연결한다.

### D. 태스크·문서 하네스

#### F-13 · High · I-0026 산출물이 2.5개월째 미커밋

- 근거: `tasks/active/I-0026-010-meta-ai-slop-evaluation-orchestration.md:#L83`–`#L97` [wt], `git status` (untracked `design/initiatives/I-0026-*.md`, `prompts/`, `tasks/active/I-0026-*.md`), `git log -1 --format=%ad` (2026-06-18)
- 문제: 시도 로그는 2026-06-18부터 2026-06-22까지 다섯 차례 세션을 기록하지만 커밋은 하나도 없다. `AGENTS.md:#L88`은 "Move the task to `tasks/active/` when work starts"를 상태 전이로 정의하는데, untracked 파일은 다른 에이전트와 CI에 보이지 않으므로 상태 모델이 깨진다. 이 태스크의 `verify` 항목 9개는 전부 `test -f`라서 통과해도 내용 검증이 없다.
- AS-IS: 활성 태스크가 로컬에만 존재한다.
- TO-BE: 산출물을 검토해 커밋하거나 명시적으로 폐기한다. 커밋할 경우 `prompts/`를 `AGENTS.md` Source of Truth Map에 등록한다. `verify`에 내용 검증(예: 필수 섹션 존재, 모델명 하드코딩 금지)을 추가한다.

#### F-14 · Low · `tasks/reviews/README.md`가 삭제된 스키마를 canonical로 지칭

- 근거: `tasks/reviews/README.md:#L3`, `#L6`–`#L7`, `reviewers/` 부재, `tasks/README.md:#L7`–`#L13` (Layout에 `reviews/` 없음), `design/initiatives/I-0025-agent-review-harness-retirement.md:#L15`
- 문제: I-0025는 `tasks/reviews/**`를 역사적 증거로 보존했지만 README는 여전히 "canonical 위치"라고 쓰고, 존재하지 않는 `reviewers/review-artifact.schema.json`과 `reviewers/protocols.json`을 참조한다. `tasks/README.md`의 Layout에는 `reviews/`가 없어 두 문서가 서로 모순이다.
- AS-IS: 퇴역한 하네스가 살아 있는 것처럼 보인다.
- TO-BE: README를 "historical, read-only, 새 파일 추가 금지"로 다시 쓰고, `tasks/README.md` Layout에 `reviews/ (historical)` 한 줄을 추가한다.

#### F-15 · Medium · `exceptions.md`의 미정의 원칙 id와 지난 재검토일

- 근거: `design/operating-rules/exceptions.md:#L17`, `#L34`, `#L44`, `#L54`, `#L65`, `#L3` (`last_verified: 2026-04-02`)
- 문제: 스키마가 요구하는 `P1`–`P12`는 부재한 외부 스킬의 어휘다(F-02). EX-0001부터 EX-0003의 `revisit_date`는 2026-04-01, EX-0004는 2026-05-06으로 모두 지났고 재검토 기록이 없다.
- AS-IS: 예외 등록부가 스스로 정한 규칙을 어기고 있다.
- TO-BE: 원칙 id를 리포 내부 정의로 바꾸고, 지난 예외 4건을 재검토해 날짜를 갱신하거나 닫는다. `ci-local`에 "revisit_date가 오늘보다 과거인 항목이 있으면 경고"를 추가한다.

#### F-16 · Medium · 가드레일 스크립트 2개가 어디에도 연결되지 않음

- 근거: `scripts/check-doc-frontmatter.sh`, `scripts/check-size-budgets.sh` 존재. `.github/workflows/ci.yml`, `scripts/ci-local.sh`, `scripts/pre-commit.sh`, `package.json` 모두 참조 0건. `design/operating-rules/commit-conventions.md:#L75`, `design/initiatives/I-0011-domain-truth-and-boundary-hardening.md:#L29`, `AGENTS.md:#L23`
- 문제: `AGENTS.md`는 `check-size-budgets.targets.json`을 readability budget registry로 지정하고, 커밋 규약은 `bash scripts/check-size-budgets.sh`를 Verify 트레일러 예시로 든다. `document-states.md:#L22`–`#L29`는 `design/**/*.md` 전체에 frontmatter를 요구한다. 그러나 두 검사 스크립트는 어떤 파이프라인에서도 실행되지 않는다. CI의 "Check harness structure" 단계는 디렉터리 4개 존재와 generated artifact 검사만 한다(`ci.yml:#L45`–`#L51`).
- AS-IS: 문서상 가드레일과 실행되는 가드레일이 다르다.
- TO-BE: 두 스크립트를 `ci-local.sh`의 "Check harness structure" 단계와 `ci.yml`에 연결한다. `check-doc-frontmatter.sh`의 검사 범위가 `document-states.md`의 요구와 다르면 둘 중 하나를 맞춘다.

#### F-17 · High · 하네스 변경이 로컬 브랜치에만 존재

- 근거: `git rev-list --count origin/dev..dev` = 26, `git rev-list --count main..dev` = 62, `git branch -a --contains 5d05bea` = `dev`만
- 문제: I-0025 하네스 퇴역 커밋을 포함한 26개 커밋이 `origin/dev`에 없다. `main`은 62커밋 뒤다. CI는 `push`와 `pull_request`에서만 돌기 때문에(`ci.yml:#L3`–`#L7`) 이 하네스 변경은 한 번도 CI를 통과한 적이 없다. 다른 머신의 에이전트는 퇴역 전 하네스를 본다.
- AS-IS: 하네스의 진실이 한 머신에 갇혀 있다.
- TO-BE: 워킹트리를 닫은 뒤 `dev`를 push하고 `main`으로 합치는 정상 흐름을 복구한다. 이 보고서가 제안하는 변경은 그 뒤에 얹는다.

#### F-18 · High · pre-push의 `ci:local`이 `dev`에서 항상 실패함

- 근거: `.husky/pre-push:#L4` (`pnpm ci:local`), `scripts/ci-local.sh:#L65` (`pnpm knip`), 이 보고서를 담은 문서 전용 커밋에서 `pnpm ci:local` 실행 결과 knip 단계 exit 1 (Unused files 1, Unused exports 12, Unused exported types 18. 대상은 `apps/web/src/pages/profile/profile-api.ts`, `components/layout/mobile-shell.ts`, `lib/regions.ts` 등 기존 코드), `.github/workflows/ci.yml:#L75` (CI도 `pnpm knip` 실행)
- 문제: pre-push 훅은 전체 `ci:local`을 돌리는데, 그 안의 knip 죽은 코드 검사가 `dev` HEAD의 기존 코드에서 실패한다. 문서만 바꿔도 push가 막힌다. 유일한 우회는 `--no-verify`이고, 그 습관이 F-17의 26커밋 드리프트를 만든 것으로 보인다. `ci.yml`에도 같은 knip 단계가 있으므로 push해도 CI는 빨갛다. 전체 `ci:local`은 이 머신에서 6분 이상 걸려 훅으로 쓰기에는 무겁다.
- AS-IS: 가장 강한 가드레일이 항상 빨갛고, 그래서 아무도 지키지 않는다.
- TO-BE: (1) knip 기준선을 `dev`에서 녹색으로 복구한다. 죽은 export를 지우거나 `knip.json` ignore로 등록하되 사유를 남긴다. (2) pre-push는 빠른 부분집합(`format:check`, `lint`, harness structure, typecheck)만 돌리고 전체 `ci:local`은 CI에 맡긴다. (3) `--no-verify` 사용은 커밋 규약에서 명시적으로 금지하고, 정 필요하면 `Verify:` 트레일러에 사유를 적게 한다.

## 4. TO-BE 목표 구조

원칙 다섯 가지:

1. **지시는 한 곳에서.** `AGENTS.md`가 유일한 최상위 지시이고 `CLAUDE.md`는 포인터다. override 파일은 쓰지 않는다. 작업 유형별 상세 규칙은 tracked 문서로 두고 `AGENTS.md`에서 링크한다.
2. **공유 설정은 tracked, 로컬 설정은 리포 `.gitignore`가 책임진다.** `.claude/settings.json`과 `.codex/config.toml`이 리포의 기대를 표현한다. `settings.local.json`, `AGENTS.override.md`, `.claude/worktrees/`는 리포 `.gitignore`에 명시한다.
3. **스킬은 `.agents/skills/`가 원본, `.claude/skills/`는 포워더.** 한 스킬을 두 에이전트가 같이 쓴다.
4. **역할과 모델은 표 하나로.** `design/operating-rules/agent-roles.md`가 역할, 능력 등급, 에이전트별 모델, 위임 원칙을 담는다. 다른 문서는 역할 이름만 쓴다.
5. **문서가 언급하는 가드레일은 반드시 실행된다.** 스크립트는 `ci-local.sh`와 `ci.yml` 양쪽에 연결하고, 연결되지 않은 스크립트는 문서에서도 지운다.

목표 트리:

```text
AGENTS.md                       # 최상위 지시 + Agent Harness Map 섹션
CLAUDE.md                       # AGENTS.md 포인터 (변경 없음)
.claude/
  settings.json                 # tracked: 최소 allow/deny, 훅
  skills/ast-grep/SKILL.md      # .agents/skills/ast-grep 포워더
  worktrees/                    # ignored
  settings.local.json           # ignored (리포 .gitignore로)
.codex/
  config.toml                   # tracked: features/agents 정리본
  hooks.json                    # tracked: 최소 훅 또는 삭제
  environments/                 # ignored (변경 없음)
.agents/skills/
  ast-grep/                     # 원본 스킬, references/patterns/ 분할 확정
design/operating-rules/
  agent-roles.md                # 역할 → 능력 등급 → 모델, 위임 원칙
  harness-principles.md         # P1–P12를 리포 내부 정의로
  exceptions.md                 # 원칙 id를 내부 정의로 참조
prompts/
  ai-slop/                      # tracked, AGENTS.md Source of Truth Map에 등록
docs/runbooks/harness-diagnostics.md   # 리포 내부 절차로 재작성
tasks/reviews/README.md         # historical, read-only 명시
```

## 5. 제안 파일 스니펫

아래는 I-0027 태스크가 적용할 후보 내용이다. 이 보고서는 제안만 담고 실제 변경은 태스크에서 한다.

### 5.1 `.gitignore` 변경

```diff
 # claude code
 .claude/
 !.claude/
 !.claude/agents/
 !.claude/agents/*.md
 !.claude/skills/
 !.claude/skills/*/
 !.claude/skills/*/SKILL.md
+!.claude/settings.json
+.claude/settings.local.json
+.claude/worktrees/
 .claude/commands/
 .claude/commands/*

-# oh-my-claudecode
-.omc/
-
 # local prompt scratch
 /prompts/local
 /prompts/user_requst.md
-AGENTS.override.md
```

`AGENTS.override.md`를 ignore 목록에서 빼는 이유는 실수로 생기면 `git status`에 보이게 하기 위해서다.

### 5.2 `.claude/settings.json` 초안

```json
{
  "permissions": {
    "allow": [
      "Bash(pnpm lint:*)",
      "Bash(pnpm typecheck:*)",
      "Bash(pnpm --filter @masters/api test:*)",
      "Bash(pnpm --filter @masters/web build:*)",
      "Bash(pnpm ci:local:*)",
      "Bash(git status:*)",
      "Bash(git diff:*)",
      "Bash(git log:*)"
    ],
    "deny": ["Read(./.env)", "Read(./.env.*)", "Read(./apps/**/.env*)"]
  }
}
```

파괴적 명령(`git reset`, `pkill`, `kill`)과 광범위 규칙(`pnpm:*`, `npx:*`, `python3:*`)은 넣지 않는다. 필요하면 세션에서 개별 승인한다.

### 5.3 `.codex/config.toml` 정리본

```toml
[features]
goals = true

[agents]
# I-0027: 평가 패스(judge 3회 + mechanical + aggregation)를 한 번에 돌리기 위한 상한.
max_threads = 10
max_depth = 2
```

### 5.4 `AGENTS.md`에 추가할 섹션

```markdown
## Agent Harness Map

Both Claude Code and Codex read `AGENTS.md`. `CLAUDE.md` only points here.

- Shared instructions: `AGENTS.md`, `design/operating-rules/agent-roles.md`
- Claude Code settings: `.claude/settings.json` (tracked). `.claude/settings.local.json` is local only.
- Codex settings: `.codex/config.toml`, `.codex/hooks.json` (tracked). `.codex/environments/` is local only.
- Skills: `.agents/skills/<name>/` is the source. `.claude/skills/<name>/SKILL.md` forwards to it.
- Evaluation prompts: `prompts/ai-slop/`. Read them only for AI-slop evaluation tasks.
- Do not create `AGENTS.override.md`. Put task-type rules in tracked docs and link them here.
- Harness audit procedure: `docs/runbooks/harness-diagnostics.md`. Principle ids live in `design/operating-rules/harness-principles.md`.
```

### 5.5 `.claude/skills/ast-grep/SKILL.md` 포워더

```markdown
---
name: ast-grep
description: AST-aware code search and rewrite with the ast-grep CLI. Use for structural refactors where rg is too broad.
---

Follow `.agents/skills/ast-grep/SKILL.md`. That file is the single source for this skill.
```

## 6. 로드맵

| 우선순위 | 태스크                                                          | 닫는 항목                    |
| -------- | --------------------------------------------------------------- | ---------------------------- |
| P0       | `tasks/todo/I-0027-010-meta-harness-dirty-state-closeout.md`    | F-09, F-11, F-13, F-17, F-18 |
| P0       | `tasks/todo/I-0027-030-meta-claude-shared-settings-baseline.md` | F-05, F-06, F-07, F-08       |
| P1       | `tasks/todo/I-0027-020-meta-agents-md-harness-map.md`           | F-01, F-03, F-04, F-12       |
| P1       | `tasks/todo/I-0027-050-meta-retired-harness-residue-cleanup.md` | F-02, F-14, F-15, F-16       |
| P2       | `tasks/todo/I-0027-040-meta-codex-config-and-skill-parity.md`   | F-10, F-11 (포워더)          |

P0 두 개는 서로 독립이다. P1은 P0-010이 끝난 뒤(워킹트리가 닫힌 뒤) 시작한다.

## 7. 리포 밖 관찰 (참고)

이 항목은 리포 변경 대상이 아니지만 하네스 판단에 영향을 준다.

- 사용자 전역 `~/.codex/config.toml`은 `sandbox_mode = "danger-full-access"`, `approval_policy = "never"`다. 리포는 Codex에 어떤 제한도 걸지 않으므로 Codex 세션의 안전장치는 전적으로 사용자 전역 훅에 의존한다.
- 민감값 마스킹 훅(`mask-sensitive-hook.py`)과 `.env` 접근 차단은 `~/.claude/settings.json`과 `~/.codex/hooks.json`에만 있다. 리포 clone만으로는 재현되지 않는다.
- 사용자 전역 `~/.claude/agents/`와 `~/.codex/agents/`에 `evidence-reader`, `issue-writer`, `gh-scout` 같은 읽기 전용 역할 에이전트가 있다. 리포 문서는 이들을 언급하지 않는다. `agent-roles.md`가 "리포가 기대하는 역할"과 "사용자가 제공하는 구현"을 분리해 적으면 된다.

## 8. 재현 명령

```bash
# 하네스 표면 존재 여부
for p in reviewers docs/phase4-plan.md .claude/settings.json .codex/agents .claude/agents .claude/skills; do
  [ -e "$p" ] && echo "EXISTS $p" || echo "MISSING $p"; done

# harness-diagnostics 스킬 검색
ls -d .agents/skills/*diagnos* .claude/skills/*diagnos* ~/.claude/skills/*diagnos* ~/.codex/skills/*diagnos* 2>/dev/null

# ignore 경로 확인
git check-ignore -v .claude/settings.local.json .claude/worktrees/x AGENTS.override.md

# 고아 스크립트
for s in check-doc-frontmatter check-size-budgets; do
  grep -c "$s" .github/workflows/ci.yml scripts/ci-local.sh scripts/pre-commit.sh package.json; done

# 브랜치 드리프트
git rev-list --count origin/dev..dev; git rev-list --count main..dev

# Codex feature 유효성
codex features list | grep -E '^(hooks|multi_agent|goals|codex_hooks) '
```
