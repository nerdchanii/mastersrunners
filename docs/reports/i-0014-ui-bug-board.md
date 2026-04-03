# I-0014 UI Bug Board

Use this report to turn the 2026-04-01 UI intake into bounded follow-up tasks. This is a live report artifact, not an approved future-state design doc.

## Report Meta

- related initiative: `I-0014-ui-bug-board-and-stabilization`
- related task: `I-0014-010`
- intake source: 2026-04-01 product-owner UI review in chat, plus same-day follow-up directives on messaging identity, feedback intake, cardless cleanup, and post-image visibility
- inspection basis: current routes, component code, design docs, domain docs, and Prisma schema
- scope: current web UI/UX, discoverability, and near-term product-gap intake

## Classification Rules

- `Type`
  - `bug`: current behavior is broken or misleading
  - `IA/discovery`: the feature exists or partly exists but is hard to find or enter
  - `product gap`: intended capability is not represented in the current product model yet
  - `visual cleanup`: the surface works but the presentation violates the intended product direction
- `Severity`
  - `P1`: major user-facing friction or high-priority product gap
  - `P2`: meaningful UX debt, but not the first stabilization wave
  - `P3`: polish or follow-up debt

## Raw Intake Mapping

| Original intake                                                           | Board issue |
| ------------------------------------------------------------------------- | ----------- |
| 1. 유저 검색이 없는 것 같아요.                                            | `UI-001`    |
| 2. 로그인/회원가입/퍼널/러너 정보 입력 부족                               | `UI-002`    |
| 3. 프로필 배경 이미지 제거, 깔끔한 프로필                                 | `UI-003`    |
| 4. 모바일 `+` 버튼을 GNB로 이동하고 게시글/운동기록 선택 제공             | `UI-004`    |
| 5. 서비스 소개 페이지 부족                                                | `UI-005`    |
| 6. Driver.js 도입 고민, 하지만 소개가 먼저                                | `UI-005`    |
| 7. 추천 알고리즘 준비 필요                                                | `UI-006`    |
| 8. 모바일 홈 빈 상태에서 추천/탐색 유도 필요                              | `UI-006`    |
| 9. 프로필 대대적 수정 필요                                                | `UI-003`    |
| 10. 메시지에서 크루톡/활동톡 접근성 개선                                  | `UI-007`    |
| 11. 메시지 설명 문구와 UI 다듬기                                          | `UI-007`    |
| 12. 사용자 이름 기반 채팅방 검색 필요                                     | `UI-007`    |
| 12-1. 메시지가 DB에 저장되는지 확인 필요                                  | `UI-007`    |
| 13. 크루 URL 초대 필요                                                    | `UI-008`    |
| 14. 크루 설정 카드 안의 카드 UI 정리 필요                                 | `UI-008`    |
| 15. 불필요한 라벨/필수 표시 축소 필요                                     | `UI-008`    |
| 16. 불쾌한 datepicker UX 교체 필요                                        | `UI-009`    |
| 17. 크루 프로필 사진/썸네일 등록 필요                                     | `UI-008`    |
| 18. 새 게시글 화면 상단과 GNB 관계 재설계 필요                            | `UI-004`    |
| 19. 워크아웃 없이 진행/다음 버튼 위치 재설계 필요                         | `UI-004`    |
| 20. 모바일 사진 선택은 권한 허용 후 갤러리형 grid가 더 적합               | `UI-010`    |
| 21. 게시글 작성 플로우, 해시태그/멘션, 미디어, 프로그레스바 정리 필요     | `UI-010`    |
| 22. 첨부 워크아웃 시각화, 지도/심박/칼로리/훈련부하, GPX/FIT 검증 필요    | `UI-011`    |
| 23. `/posts/:postId` 카드 UI 구성 제거 필요                               | `UI-012`    |
| 24. 공유 버튼은 네이티브 공유를 우선해야 함                               | `UI-012`    |
| 25. 크루 멤버/활동/태그/통계/게시판/게시물/채팅/대기멤버 위계 재정리 필요 | `UI-008`    |
| Follow-up. 메시지 방 이름이 DM/크루/활동 기준으로 구분되지 않는다         | `UI-007`    |
| Follow-up. 앱 전체에서 카드 UI가 과하게 반복된다                          | `UI-013`    |
| Follow-up. 사용자 피드백/버그 제보 접수 공간이 필요하다                   | `UI-014`    |
| Follow-up. 게시글에 등록한 이미지가 보이지 않는 것 같다                   | `UI-015`    |

## Prioritized Issue Ledger

### UI-001 Search Discovery and Runner Lookup

- Type: `IA/discovery`
- Surface:
  - `apps/web/src/router.tsx`
  - `apps/web/src/pages/search/index.tsx`
  - `apps/web/src/hooks/useUserSearch.ts`
  - `apps/web/src/components/layout/Header.tsx`
  - `apps/web/src/components/common/BottomNav.tsx`
- Current repo evidence:
  - `/search` route already exists.
  - `useUserSearch()` already calls `/profile/search`.
  - Desktop header and mobile bottom nav do not expose search as a primary action.
- User intake:
  - “유저 검색이 없는 거 같아요.”
- Expected:
  - Runner search should feel like a first-class part of the app shell.
  - Search entry should be obvious on mobile and desktop.
- Actual:
  - Search exists as a route, but the current shell makes it feel absent.
- Repro steps:
  1. Open the app on mobile or desktop.
  2. Navigate only through the current primary shell.
  3. Try to discover runner search without deep linking.
- Severity: `P1`
- Frequency: `always`
- Coverage status:
  - No focused Playwright coverage found for search discoverability or runner-search entry.
- Candidate fix pack: `search-discovery-and-runner-lookup`
- Notes:
  - This is not a pure “missing backend feature” bug. It is mostly a shell discoverability failure.

### UI-002 Auth Entry, Signup Funnel, and Runner Identity Fields

- Type: `product gap`
- Surface:
  - `apps/web/src/pages/intro/index.tsx`
  - `apps/web/src/pages/login/index.tsx`
  - `apps/web/src/pages/onboarding/index.tsx`
  - `docs/domain/user-profile.md`
- Current repo evidence:
  - Logged-out entry now splits into a public intro route and a login-only handoff.
  - Onboarding now collects `name`, `bio`, `region`, `subRegion`, optional PB 4종, and `isPrivate`.
  - `docs/domain/user-profile.md` now treats PB and region fields as current truth.
- User intake:
  - 회원가입/로그인 동작 차이는 이해하지만, 가입 전후 퍼널에서 더 많은 러너 정보 입력이 필요하다.
  - 10K, 하프, 풀 PB 같은 핵심 프로필 필드를 고려했었는데 현재 반영이 없다.
- Expected:
  - Logged-out flow should explain the join funnel clearly.
  - Onboarding should capture the minimum runner identity fields needed for the intended product.
- Actual:
  - The minimum runner-identity surface now exists, and the remaining risk is keeping edit/clear behavior and regression coverage aligned with that truth.
- Repro steps:
  1. Log out and open the auth flow.
  2. Complete onboarding.
  3. Try to enter PB or runner-profile data.
- Severity: `P1`
- Frequency: `always`
- Coverage status:
  - No focused onboarding/browser regression coverage yet locks down the new PB/region/privacy flow.
- Candidate fix pack: `auth-funnel-and-runner-profile-model`
- Notes:
  - Do not rewrite domain docs to claim PB fields exist before implementation lands.

### UI-003 Profile Surface Cleanup and Background-Image Removal

- Type: `visual cleanup`
- Surface:
  - `apps/web/src/components/profile/ProfileHeader.tsx`
  - `apps/web/src/pages/profile/index.tsx`
  - `apps/web/src/pages/profile/[id]/index.tsx`
  - `apps/web/src/pages/settings/profile/index.tsx`
  - `design/frontend/social-profile.md`
- Current repo evidence:
  - `ProfileHeader` renders a full-width fallback gradient when `backgroundImage` is absent.
  - The current profile surface remains card-based and split across self-profile vs other-user profile routes.
- User intake:
  - 썸네일 외에 배경 이미지가 없어도 된다.
  - 인스타그램/X처럼 정보 입력과 정돈된 프로필 UI가 필요하다.
  - 프로필은 대대적 수정이 필요해 보인다.
- Expected:
  - Profile should remain clean and intentional without a fake cover image.
  - Text, stats, and actions should carry the surface instead of decorative background blocks.
- Actual:
  - The default gradient creates an unintended “cover image required” feeling.
- Repro steps:
  1. Open a profile without `backgroundImage`.
  2. View the screen on mobile.
  3. Compare the visual emphasis between the gradient block and real profile content.
- Severity: `P1`
- Frequency: `always`
- Coverage status:
  - `apps/web/e2e/profile.spec.ts` and `apps/web/e2e/profile-edit.spec.ts` exist.
  - No visual guard currently locks down cover-image fallback behavior.
- Candidate fix pack: `profile-layout-and-cover-removal`
- Notes:
  - Backend fields can remain for now even if the UI stops leaning on cover imagery.

### UI-004 Mobile Navigation and Create Entry Rework

- Type: `IA/discovery`
- Surface:
  - `apps/web/src/components/common/BottomNav.tsx`
  - `apps/web/src/pages/posts/new/index.tsx`
  - `apps/web/src/pages/posts/new/post-composer-steps.tsx`
  - `apps/web/src/pages/workouts/new/index.tsx`
- Current repo evidence:
  - Mobile uses a separate floating FAB that only opens `/posts/new`.
  - Post composer keeps its own back button and runs under the main shell.
  - Workout/post step actions live in body content instead of a tighter shell action zone.
- User intake:
  - 모바일 `+` 버튼은 GNB 안으로 들어가야 한다.
  - 눌렀을 때 게시글과 운동기록 둘 다 선택할 수 있어야 한다.
  - 새 게시글 상단 뒤로가기/GNB 관계와 “워크아웃 없이 진행 / 다음” 버튼 위치도 재설계가 필요하다.
- Expected:
  - Creation should be part of the primary navigation model, not a detached floating affordance.
  - New-post and new-workout flows should feel like one creation system.
- Actual:
  - Creation entry is post-only and visually detached from the bottom nav.
- Repro steps:
  1. Open the app on mobile.
  2. Compare the bottom nav with the floating FAB.
  3. Enter `/posts/new` and inspect shell + action placement.
- Severity: `P1`
- Frequency: `always`
- Coverage status:
  - No targeted Playwright coverage found for mobile create-entry behavior or composer shell behavior.
- Candidate fix pack: `mobile-nav-and-create-entry`
- Notes:
  - This likely needs one shared creation entry that can branch into post vs workout flows.
  - Seeded task split: `I-0014-090` handles the nav entry and switcher, and `I-0014-100` handles composer-shell progress and action placement.

### UI-005 Service Introduction and Guided Orientation

- Type: `product gap`
- Surface:
  - logged-out/public entry surfaces
  - login and onboarding entry points
- Current repo evidence:
  - `/` now renders a dedicated service-intro surface.
  - `/login` remains a login-only shell, and logged-in `/` redirects to `/feed`.
- User intake:
  - 서비스를 소개하는 페이지가 너무 없다.
  - Driver.js를 붙일 수도 있겠지만, 그 전에 서비스 소개가 먼저다.
- Expected:
  - A new visitor should understand what the service is, why they should sign up, and where to begin.
- Actual:
  - The core intro surface now exists; guided product education such as Driver.js remains intentionally deferred.
- Repro steps:
  1. Log out.
  2. Enter the app fresh.
  3. Look for a clear product introduction or guided orientation.
- Severity: `P2`
- Frequency: `always`
- Coverage status:
  - No focused intro/browser regression coverage yet locks down the new entry contract.
- Candidate fix pack: `service-intro-and-orientation`
- Notes:
  - Driver.js should stay behind this work, not ahead of it.

### UI-006 Feed Empty State and Recommendation Readiness

- Type: `product gap`
- Surface:
  - `apps/web/src/pages/feed/index.tsx`
  - `apps/web/src/components/feed/FeedSidebar.tsx`
- Current repo evidence:
  - Empty feed now opens recommendation-ready modules for runners, crews, events, and challenges.
  - The feed distinguishes “empty feed” from “empty current tab” so one quiet tab does not masquerade as a dead-end home state.
- User intake:
  - 추천 알고리즘을 붙일 준비가 필요하다.
  - 모바일 홈에 게시글이 없을 때 추천 기반 콘텐츠나 팔로우 탐색 유도가 필요하다.
- Expected:
  - New or cold-start users should get an actionable home state that can later host recommendation logic.
- Actual:
  - The empty feed is now exploration-first, while the recommendation algorithm itself is still intentionally lightweight.
- Repro steps:
  1. Use a user with no follows or no available feed items.
  2. Open `/feed`.
  3. Inspect the empty state on mobile.
- Severity: `P1`
- Frequency: `always` for new/cold-start users
- Coverage status:
  - No focused Playwright coverage found for empty-feed exploration behavior.
- Candidate fix pack: `empty-feed-and-recommendation-readiness`
- Notes:
  - This task should prepare slots and fallback modules first, not ship the recommendation algorithm itself.

### UI-007 Messaging Hub, Room Identity, Search, and Chat Entry

- Type: `IA/discovery`
- Surface:
  - `apps/web/src/pages/messages/index.tsx`
  - `apps/web/src/pages/messages/[id]/index.tsx`
  - `apps/web/src/hooks/useMessages.ts`
  - `apps/web/src/pages/crews/[id]/index.tsx`
  - `apps/web/src/pages/crews/[id]/activities/[activityId]/chat.tsx`
  - `apps/web/src/components/crew/GroupChat.tsx`
  - `apps/api/src/conversations/repositories/conversations.repository.ts`
  - `apps/api/src/conversations/conversations.service.ts`
  - `design/backend/messaging-realtime.md`
  - `packages/database/prisma/schema.prisma`
- Current repo evidence:
  - Messages page still uses the description “러너들과 대화하세요”.
  - There is no list search/filter UI on `/messages`.
  - `useMessages.ts` types the hub list as `Conversation.type: "DIRECT"` and `MessagesPage` renders names from `getOtherUser()`, so the hub is DM-centric by construction.
  - Crew and activity chat storage already exists in schema/repository fields (`Conversation.type`, `crewId`, `activityId`), but `design/backend/messaging-realtime.md` still records the user-facing API as direct-message only.
  - Crew chat title currently renders as `${crew.name} 크루 채팅`, while activity chat title renders as `${activityTitle} 활동 채팅`, which omits crew context on the activity route.
- User intake:
  - 메시지에서 크루 톡방과 크루 활동 톡방에 더 쉽게 접근하고 싶다.
  - “러너들과 대화하세요” 문구는 없어도 될 것 같다.
  - 사용자 이름 기반으로 채팅방을 검색할 수 있어야 한다.
  - 메시지가 DB에 저장되는지 확인이 필요하다.
  - DM, 크루 단체톡, 활동톡이 같은 이름처럼 보이지 않게 구분돼야 한다.
  - 활동 채팅방은 `크루명 / 활동명`, 크루 단체톡은 `크루명`처럼 보여야 한다.
- Expected:
  - Messages should work as one coherent communication hub with room-type context, clearer copy, faster crew/activity entry, and participant-name search.
  - DM, crew, and activity rooms should not collapse into ambiguous same-name rows.
- Actual:
  - The page is mostly a plain DM list with generic copy, while crew/activity chat entry lives on separate routes with a different naming strategy.
- Repro steps:
  1. Open `/messages`.
  2. Try to search conversations by user name or find a crew/activity room.
  3. Compare `/messages` with crew chat and activity chat surfaces.
  4. Consider the same crew/activity/user name appearing in different room types.
- Severity: `P1`
- Frequency: `always`
- Coverage status:
  - `apps/web/e2e/messages.spec.ts` exists for basic message flows.
  - No focused coverage found for room search or crew/activity entry from the messages hub.
- Candidate fix pack: `messaging-room-identity-and-hub`
- Notes:
  - Direct messages are persisted in DB via Prisma `Conversation` and `Message`, and group-chat primitives also exist in the same schema.
  - The next implementation task should treat room naming as part of IA, not as cosmetic copy only.

### UI-008 Crew Invite, Settings IA, Media Fields, and Hierarchy Cleanup

- Type: `visual cleanup`
- Surface:
  - `apps/web/src/pages/crews/[id]/settings/index.tsx`
  - `apps/web/src/components/crew/CrewForm.tsx`
  - crew detail tabs and crew side surfaces
- Current repo evidence:
  - Invite-by-URL/share flow now exists in both crew detail and settings.
  - Crew detail primary order is now `활동 -> 채팅 -> 게시판`, with operator tools visually separated.
  - Crew settings now uses flatter form shells and exposes separate profile-image and cover-image URL fields with live previews.
- User intake:
  - 크루 URL로 초대할 수 있으면 좋겠다.
  - 크루 설정 > 기본정보의 카드 안 카드 UI는 정리해야 한다.
  - 라벨과 `*` 표시는 줄여도 된다.
  - 크루 프로필 사진과 커버 이미지를 등록할 수 있어야 한다.
  - 크루 상세 탭의 위계와 시각 구성을 전반적으로 손봐야 한다.
- Expected:
  - Crew management should feel flatter, clearer, and easier to scan.
  - Invite/share, media, and IA hierarchy should match community-management priorities.
- Actual:
  - Invite/share and IA hierarchy are substantially cleaner; the remaining long-term gap is richer media upload workflow beyond the current URL-entry contract.
- Repro steps:
  1. Open a crew detail page.
  2. Open crew settings as owner/admin.
  3. Inspect tab hierarchy, field structure, and available actions.
- Severity: `P1`
- Frequency: `always`
- Coverage status:
  - Crew-related Playwright coverage exists for chat, boards, attendance, and explore.
  - No focused invite/settings IA coverage was found.
- Candidate fix pack: `crew-ia-settings-and-invite-flow`
- Notes:
  - Invite URLs may need API work and therefore possible `backend-reviewer` involvement.
  - Seeded task split: `I-0014-130`, `I-0014-140`, `I-0014-150`, and `I-0014-160`.

### UI-009 Date Picker Modernization

- Type: `visual cleanup`
- Surface:
  - `apps/web/src/pages/workouts/new/index.tsx`
  - `apps/web/src/pages/workouts/[id]/edit.tsx`
  - `apps/web/src/pages/challenges/new/index.tsx`
  - `apps/web/src/pages/challenges/[id]/edit/index.tsx`
- Current repo evidence:
  - Current forms use native `type="date"` inputs.
  - There is no shared calendar/date-picker component in the web package yet.
- User intake:
  - 현재 datepicker UX가 불쾌하고, 더 미니멀한 대안이 필요하다.
- Expected:
  - Date picking should be consistent, lightweight, and mobile-friendly.
- Actual:
  - Native date inputs vary by platform and do not provide one controlled UX language.
- Repro steps:
  1. Open workout or challenge create/edit forms on mobile.
  2. Tap date inputs.
  3. Compare the experience across flows and devices.
- Severity: `P2`
- Frequency: `always`
- Coverage status:
  - No focused date-input UI coverage was found.
- Candidate fix pack: `date-picker-modernization`
- Notes:
  - Prefer solving this after higher-priority shell, onboarding, and messaging work.

### UI-010 Post Composer Media, Text, and Progress Feedback

- Type: `bug`
- Surface:
  - `apps/web/src/pages/posts/new/index.tsx`
  - `apps/web/src/pages/posts/new/post-composer-steps.tsx`
- Current repo evidence:
  - Post composer displays step labels under the progress bars.
  - Content and hashtags are split across separate inputs.
  - Mobile media selection is a standard file input with click-to-upload messaging.
  - There is no declared video-upload path in the current post composer.
- User intake:
  - 모바일에서는 사진첩 접근 후 3x3 grid형 선택이 더 자연스럽다.
  - 내용 입력창 하나에서 해시태그와 멘션을 추출해 보여주면 좋겠다.
  - 이미지를 고르면 내용 단계에서 작게 보이면 좋겠다.
  - 현재 단계 텍스트는 지우고 상단 검은 progress bar만으로도 충분하다.
  - Instagram에 가까운 작성 흐름이 필요하다.
- Expected:
  - Media and text composition should feel like one connected funnel, not disconnected form blocks.
- Actual:
  - The composer is functional but feels mechanical and step-heavy.
- Repro steps:
  1. Open `/posts/new` on mobile.
  2. Go through workout, photo, text, and preview steps.
  3. Compare the affordances with an image-first social composer.
- Severity: `P1`
- Frequency: `always`
- Coverage status:
  - No focused Playwright coverage found for the post-composer funnel.
- Candidate fix pack: `post-composer-mobile-funnel`
- Notes:
  - Video support is intentionally out of scope in the current round and should not be implied by composer UI or copy.
  - Seeded task split: `I-0014-100`, `I-0014-180`, `I-0014-190`, and `I-0014-210`.

### UI-011 Workout Attachment, GPX/FIT Visualization, and Deep-Linking

- Type: `bug`
- Surface:
  - `apps/web/src/pages/posts/[id]/index.tsx`
  - `apps/web/src/pages/workouts/detail/index.tsx`
  - `apps/web/src/pages/workouts/new/index.tsx`
  - `design/backend/upload-ingestion.md`
  - `design/frontend/workout-experience.md`
- Current repo evidence:
  - Workout detail deep-link exists, but file-derived visuals are intentionally being scoped down for the current batch.
  - Post detail now renders attached workouts as summary cards that deep-link into `/workouts/:id`.
  - Upload preview already shows some parsed metrics, but GPX/FIT availability differs by parser and file content.
- User intake:
  - 첨부된 운동기록 카드가 해당 워크아웃으로 연결되지 않는다.
  - 지도/거리/시간/심박/칼로리/훈련부하 같은 richer visual system이 필요하다.
  - GPX와 FIT는 데이터가 다르니 같이 검증해야 하며, 이 확인이 필요하다는 기록도 남겨달라.
- Expected:
  - Attached workouts should deep-link cleanly into workout detail.
  - The current batch should stop at safe summary metrics until GPX/FIT sample review reopens richer visuals.
- Actual:
  - Attached workouts now deep-link, and the active repo decision is to keep the linked detail surface inside a safe-summary contract.
- Repro steps:
  1. Open a post with attached workouts.
  2. Inspect the attached workout module.
  3. Compare it with `/workouts/:id`.
- Severity: `P1`
- Frequency: `always`
- Coverage status:
  - `apps/web/e2e/workout-detail.spec.ts`, `apps/web/e2e/file-upload.spec.ts`, and `apps/web/e2e/upload-preview.spec.ts` exist.
  - No focused coverage found for attached-workout deep-linking or cross-surface metric parity.
- Candidate fix pack: `workout-attachment-and-detail-visuals`
- Notes:
  - Mandatory checkpoint: before implementing GPX/FIT-driven metric or map changes, pause and review representative sample files with the product owner/user because file-format coverage and metric availability differ.

### UI-012 Cardless Detail Layouts and Native Share Behavior

- Type: `visual cleanup`
- Surface:
  - `apps/web/src/pages/posts/[id]/index.tsx`
  - `apps/web/src/components/feed/PostFeedCard.tsx`
  - `apps/web/src/components/feed/FeedCard.tsx`
- Current repo evidence:
  - `/posts/:id` stacks `PostCard`, attached-workout `Card`, and comment `Card`.
  - Post share currently copies a link to clipboard only.
  - Workout share-card generation already uses `navigator.share` when available for generated files.
- User intake:
  - `/post/:postId`에서 카드 UI를 퇴출시키고 싶다.
  - 공유 버튼은 클립보드 복사보다 네이티브 공유가 우선이어야 한다.
- Expected:
  - Detail pages should feel like clean document layouts, not stacked card piles.
  - Mobile share buttons should use native share sheets when possible and fall back gracefully.
- Actual:
  - Card composition dominates post detail, and post share behavior is copy-link only.
- Repro steps:
  1. Open `/posts/:id`.
  2. Inspect the detail composition.
  3. Tap share on a mobile-capable browser.
- Severity: `P1`
- Frequency: `always`
- Coverage status:
  - No focused coverage found for post-detail layout composition or native-share fallback behavior.
- Candidate fix pack: `cardless-detail-layouts-and-share`
- Notes:
  - This is both a visual-system direction and a concrete interaction gap.

### UI-013 Cardless App Surface Foundation

- Type: `visual cleanup`
- Surface:
  - `apps/web/src/components/ui/card.tsx`
  - `apps/web/src/pages/login/index.tsx`
  - `apps/web/src/pages/onboarding/index.tsx`
  - `apps/web/src/pages/messages/index.tsx`
  - `apps/web/src/components/crew/GroupChat.tsx`
  - `apps/web/src/components/post/PostCard.tsx`
  - `apps/web/src/pages/settings/profile/index.tsx`
  - `apps/web/src/components/profile/ProfileHeader.tsx`
- Current repo evidence:
  - Core app surfaces still import and render the shared `Card` primitive heavily across login, onboarding, messages, group chat, post detail, and profile/settings shells.
  - Even where `Card` is not imported directly, multiple pages still mimic the same bordered-box treatment with `rounded-xl border bg-card`.
  - This creates nested card-in-card composition on settings, chat, and detail surfaces.
- User intake:
  - 카드 UI가 앱 전체에서 너무 많이 반복된다.
  - 우리 서비스에서 카드 UI가 필요한 곳이 거의 없다.
- Expected:
  - The default app language should be sections, dividers, lists, sheets, and flowing document layouts.
  - Cards should remain only where the card itself is the interaction, not as the default wrapper for every page region.
- Actual:
  - Many primary surfaces still read as stacked generic cards rather than a deliberate running-community product UI.
- Repro steps:
  1. Open login, onboarding, messages, profile/settings, and post detail surfaces.
  2. Count how many bordered rounded boxes are used as generic layout wrappers.
  3. Inspect nested shells such as profile/settings and chat containers.
- Severity: `P1`
- Frequency: `always`
- Coverage status:
  - No focused visual-regression coverage exists for the app’s cardless direction.
- Candidate fix pack: `cardless-app-surface-foundation`
- Notes:
  - Do not try to remove every card in one sweep.
  - First-wave work should define allowed card use and flatten the most visible shell-level surfaces first.
  - Seeded task split: `I-0014-050`, `I-0014-080`, and `I-0014-140`.

### UI-014 Feedback Intake and Backoffice Readiness

- Type: `product gap`
- Surface:
  - `apps/web/src/router.tsx`
  - `apps/web/src/components/layout/Header.tsx`
  - `apps/web/src/components/common/BottomNav.tsx`
  - current API surface under `apps/api/src/`
- Current repo evidence:
  - No `feedback`, `support`, `bug report`, `문의`, or similar user-facing submission route was found in the active web routes.
  - No dedicated feedback-intake module or API endpoint was found in `apps/api/src/`.
  - Current issue discovery is happening out of band in chat rather than through a product surface.
- User intake:
  - 사용자들이 버그를 고쳐달라고 피드백을 접수할 수 있는 공간이 필요하다.
  - 피드백을 볼 백오피스도 결국 필요하지만, 일단 접수부터 가능해야 한다.
- Expected:
  - Users should have an in-product way to submit bug reports and improvement feedback.
  - The first version should be durable enough that a later backoffice can read the same intake stream.
- Actual:
  - There is no obvious way to report a bug or request a fix from inside the product.
- Repro steps:
  1. Open the app as an authenticated user.
  2. Try to find a place to submit a bug report or product feedback.
  3. Look for any operator intake surface or persistence path.
- Severity: `P1`
- Frequency: `always`
- Coverage status:
  - The first intake surface now exists, but no focused end-to-end coverage exists yet for submission discovery or confirmation UX.
- Candidate fix pack: `feedback-intake-and-ops-readiness`
- Notes:
  - The first implementation can prioritize authenticated submission, durable storage, and clear confirmation states before building a full backoffice.
  - Status update, 2026-04-01: `I-0014-040` adds an authenticated `/feedback` route plus durable `FeedbackSubmission` persistence so users can submit product bugs without waiting for a staff backoffice.
  - Remaining gap: operator review tooling is still a follow-up and should read the same intake stream instead of creating a second inbox.
  - Status update, 2026-04-02: `I-0014-230` now tracks a single `ops.dev.mastersrunners.com` host plus Cloudflare Access plus API RBAC so the future backoffice is not exposed as a public app route.
  - Seeded task split, 2026-04-02: `I-0014-260` covers inbox/triage and `I-0014-270` covers task/issue/initiative handoff actions built on the same submission stream.

### UI-015 Post Media Visibility and Detail Parity

- Type: `bug`
- Surface:
  - `apps/web/src/components/feed/PostFeedCard.tsx`
  - `apps/web/src/components/post/PostCard.tsx`
  - `apps/web/src/pages/posts/[id]/index.tsx`
  - `apps/web/src/hooks/usePosts.ts`
- Current repo evidence:
  - `PostFeedCard` renders `post.images` and opens them through `ImageLightbox`.
  - `usePost()` already fetches `images` for post detail payloads.
  - `PostDetailPage` renders `PostCard`, but `PostCard` does not accept or render any image props.
- User intake:
  - 게시글에 등록한 이미지들이 이미지가 안 보이는 것 같다.
- Expected:
  - Attached post images should remain visible wherever the post is viewed, including detail routes.
- Actual:
  - Feed cards can show images, but the detail composition drops post media entirely.
- Repro steps:
  1. Create or open a post with attached images.
  2. View the post in the feed.
  3. Open `/posts/:id` for the same post and compare the rendered media.
- Severity: `P1`
- Frequency: `always` for image-bearing posts
- Coverage status:
  - No focused Playwright coverage was found for post-image parity between feed and detail routes.
- Candidate fix pack: `post-media-visibility-and-detail-parity`
- Notes:
  - This should be handled before or together with broader cardless post-detail cleanup so media does not get lost again during layout refactors.
  - Status update, 2026-04-02: `I-0014-240` closed this regression after authenticated live `/feed` verification confirmed persisted post images render from stored R2 URLs again.
  - Residual mixed-content warnings from third-party `profileImage` URLs are tracked separately by `I-0014-250`; they are not part of the post-media visibility regression itself.

## Suggested Fix-Pack Order

1. `messaging-room-identity-and-hub`
2. `search-discovery-and-runner-lookup`
3. `post-media-visibility-and-detail-parity`
4. `mobile-nav-and-create-entry`
5. `auth-funnel-and-runner-profile-model`
6. `feedback-intake-and-ops-readiness`
7. `profile-layout-and-cover-removal`
8. `crew-ia-settings-and-invite-flow`
9. `post-composer-mobile-funnel`
10. `workout-attachment-and-detail-visuals`
11. `cardless-app-surface-foundation`
12. `cardless-detail-layouts-and-share`
13. `empty-feed-and-recommendation-readiness`
14. `service-intro-and-orientation`
15. `date-picker-modernization`

## Seeded Task Map

### Autonomous Tasks

- `I-0014-020`
  - covers `UI-007` messaging room identity, hub copy, and chat entry
- `I-0014-030`
  - covers `UI-015` post-image visibility regression on detail routes
- `I-0014-040`
  - covers `UI-014` user feedback intake before backoffice
- `I-0014-050`
  - covers the post-detail slice of `UI-012` and the post-detail portion of `UI-013`
- `I-0014-060`
  - covers `UI-001` search discoverability
- `I-0014-080`
  - covers the profile-header slice of `UI-003` and part of `UI-013`
- `I-0014-090`
  - covers the shell-entry part of `UI-004`
- `I-0014-100`
  - covers the composer-shell part of `UI-004` and `UI-010`
- `I-0014-130`
  - covers the invite-url part of `UI-008`
- `I-0014-140`
  - covers the settings-shell and form-chrome part of `UI-008` and part of `UI-013`
- `I-0014-170`
  - covers `UI-009`
- `I-0014-180`
  - covers the still-image media-selection part of `UI-010`
- `I-0014-190`
  - covers the text, hashtag, mention, and preview part of `UI-010`

### Product Checkpoint Required

- `I-0014-070`
  - covers `UI-002` auth funnel and runner identity fields
- `I-0014-110`
  - covers `UI-005` service introduction and first-visit orientation
- `I-0014-120`
  - covers `UI-006` empty-feed exploration and recommendation-ready slots
- `I-0014-150`
  - covers the media-field part of `UI-008`
- `I-0014-160`
  - covers the hierarchy part of `UI-008`
- `I-0014-200`
  - covers `UI-011` workout attachment deeplinks and safe-summary detail
- `I-0014-210`
  - covers the unresolved video-support question inside `UI-010`

### Already Completed Outside I-0014

- `I-0015-010`
  - covers the reported manual check-in permission bug for non-operator crew members

## Cross-Cutting Guardrails

- Do not “fix” the docs by pretending PB fields, recommendation surfaces, or cleaner profile models already exist.
- For user-facing UI implementation tasks, route review through `frontend-reviewer`, `ui-ux-reviewer`, and `po-reviewer`.
- Treat room naming, room-type labels, and list grouping as part of messaging correctness, not mere copy polish.
- Treat cardless cleanup as a sequenced visual-system migration, not as one repository-wide sweep.
- For feedback intake, prefer shipping submission durability and confirmation UX before any staff backoffice.
- Treat the recommendation algorithm itself as later work. First create empty-state slots, exploration modules, and data contracts that can host it.
- Any workout visual task must record the GPX/FIT sample review checkpoint with the product owner/user before it is considered done.
