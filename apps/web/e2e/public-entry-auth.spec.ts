import { expect, test } from "@playwright/test";

const API_BASE = "http://localhost:4000/api/v1";

const guestCrew = {
  id: "crew-1",
  name: "한강 러너스",
  description: "한강에서 함께 달리는 공개 크루",
  imageUrl: null,
  coverImageUrl: null,
  isPublic: true,
  maxMembers: null,
  createdAt: "2026-04-01T09:00:00.000Z",
  creator: {
    id: "user-1",
    name: "한강대장",
    profileImage: null,
  },
  members: [
    {
      id: "member-1",
      userId: "user-1",
      role: "OWNER",
      status: "ACTIVE",
      joinedAt: "2026-04-01T09:00:00.000Z",
      user: {
        id: "user-1",
        name: "한강대장",
        profileImage: null,
      },
    },
  ],
  _count: {
    members: 12,
  },
};

const guestWorkout = {
  workout: {
    id: "workout-1",
    distance: 10000,
    duration: 3000,
    pace: 300,
    date: "2026-04-01T06:00:00.000Z",
    elevationGain: 125,
    avgHeartRate: 152,
    avgCadence: 174,
    workoutType: { name: "조깅" },
    route: { encodedPolyline: "_p~iF~ps|U_ulLnnqC_mqNvxq`@" },
  },
};

async function setupGuest(page: import("@playwright/test").Page) {
  await page.route(`${API_BASE}/config/public`, (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        authProviders: {
          google: true,
          kakao: true,
        },
        features: {
          challenges: false,
          events: false,
        },
      }),
    });
  });

  await page.route(`${API_BASE}/auth/me`, (route) => {
    route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({}) });
  });

  await page.route(`${API_BASE}/auth/refresh`, (route) => {
    route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({}) });
  });

  await page.route(`${API_BASE}/auth/logout`, (route) => {
    route.fulfill({ status: 204 });
  });

  await page.route(`${API_BASE}/feed/posts?limit=10`, (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        items: [
          {
            id: "post-1",
            content: "공개 피드에서 볼 수 있는 러닝 기록입니다.",
            visibility: "PUBLIC",
            hashtags: ["러닝"],
            createdAt: "2026-04-01T07:00:00.000Z",
            user: { id: "user-2", name: "공개러너", profileImage: null },
            images: [],
            workouts: [],
            _count: { likes: 0, comments: 0 },
            isLiked: false,
          },
        ],
        nextCursor: null,
        hasMore: false,
      }),
    });
  });

  await page.route(`${API_BASE}/feed/workouts?limit=10&excludeLinked=true`, (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        items: [],
        nextCursor: null,
        hasMore: false,
      }),
    });
  });

  await page.route(`${API_BASE}/crews/explore*`, (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        items: [
          {
            id: "crew-1",
            name: "한강 러너스",
            description: "한강에서 함께 달리는 공개 크루",
            imageUrl: null,
            region: "서울특별시",
            subRegion: "마포구",
            _count: { members: 12, activities: 4 },
            creator: { id: "user-1", name: "한강대장", profileImage: null },
          },
        ],
        nextCursor: null,
      }),
    });
  });

  await page.route(`${API_BASE}/crews/regions`, (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([{ region: "서울특별시", crewCount: 12 }]),
    });
  });

  await page.route(`${API_BASE}/crews/crew-1`, (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(guestCrew),
    });
  });

  await page.route(`${API_BASE}/crews/crew-1/activities`, (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        items: [
          {
            id: "activity-1",
            crewId: "crew-1",
            title: "토요일 한강 10K",
            description: "비회원도 일정은 먼저 볼 수 있습니다.",
            activityDate: "2026-04-05T07:00:00.000Z",
            location: "여의도 한강공원",
            latitude: null,
            longitude: null,
            createdBy: "user-1",
            createdAt: "2026-04-01T09:30:00.000Z",
            qrCode: "qr-1",
            activityType: "OFFICIAL",
            status: "SCHEDULED",
            completedAt: null,
            workoutTypeId: null,
            attendances: [],
          },
        ],
        nextCursor: null,
      }),
    });
  });

  await page.route(`${API_BASE}/crews/crew-1/boards`, (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          id: "board-1",
          crewId: "crew-1",
          name: "공지",
          type: "ANNOUNCEMENT",
          writePermission: "ADMINS_ONLY",
          sortOrder: 0,
          _count: { posts: 1 },
        },
      ]),
    });
  });

  await page.route(`${API_BASE}/crews/crew-1/posts`, (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        items: [],
        nextCursor: null,
      }),
    });
  });

  await page.route(`${API_BASE}/posts/post-1`, (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "post-1",
        content: "공개 피드에서 볼 수 있는 러닝 기록입니다.",
        visibility: "PUBLIC",
        hashtags: ["러닝"],
        createdAt: "2026-04-01T07:00:00.000Z",
        user: { id: "user-2", name: "공개러너", profileImage: null },
        images: [],
        workouts: [guestWorkout],
        _count: { likes: 0, comments: 0 },
        isLiked: false,
      }),
    });
  });

  await page.route(`${API_BASE}/posts/post-1/comments?limit=50`, (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          id: "comment-1",
          content: "좋은 기록이네요!",
          createdAt: "2026-04-01T08:00:00.000Z",
          user: { id: "user-3", name: "응원러너", profileImage: null },
          replies: [],
        },
      ]),
    });
  });
}

test.describe("public entry auth recovery", () => {
  test.beforeEach(async ({ page }) => {
    await setupGuest(page);
  });

  test("feed에서 crews로 이동한 뒤 뒤로가기가 다시 feed로 돌아온다", async ({ page }) => {
    await page.goto("/feed");

    await expect(
      page.getByText("한강 반대편 둔치. 가볍게 시작하면 템포는 따라붙는다."),
    ).toBeVisible();
    await expect(page.getByText("오늘은 천천히, 내일은 더 강하게.")).toBeVisible();
    await expect(page.getByRole("link", { name: "내 기록", exact: true })).toHaveCount(0);

    await page.getByRole("link", { name: "크루", exact: true }).click();
    await expect(page).toHaveURL(/\/crews$/);
    await expect(page.getByText("한강 러너스")).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/\/feed$/);
    await expect(
      page.getByText("한강 반대편 둔치. 가볍게 시작하면 템포는 따라붙는다."),
    ).toBeVisible();
  });

  test("공개 게시글의 훈련 preview는 guest에서 로그인 모달을 띄우고 URL을 유지한다", async ({
    page,
  }) => {
    await page.goto("/posts/post-1");

    await page.getByTestId("post-workout-preview-workout-1").click();

    await expect(page).toHaveURL(/\/posts\/post-1$/);
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("dialog").getByText("훈련 리포트 보기")).toBeVisible();
  });

  test("공개 crews에서 내 크루는 로그인 모달로 막고 URL은 유지한다", async ({ page }) => {
    await page.goto("/crews");

    await page.getByRole("tab", { name: "내 크루" }).click();

    await expect(page).toHaveURL(/\/crews$/);
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("dialog").getByText("내 크루")).toBeVisible();
  });

  test("공개 post detail은 직접 접근되고 좋아요/댓글은 로그인 모달을 띄운다", async ({ page }) => {
    await page.goto("/posts/post-1");

    await expect(page).toHaveURL(/\/posts\/post-1$/);
    await expect(page.getByTestId("post-detail-document")).toBeVisible();

    await page.getByRole("button", { name: "좋아요" }).click();
    await expect(page).toHaveURL(/\/posts\/post-1$/);
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("dialog").getByText("게시글에 반응 남기기")).toBeVisible();

    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "답글 달기" }).click();
    await expect(page).toHaveURL(/\/posts\/post-1$/);
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("dialog").getByText("댓글 남기기")).toBeVisible();
  });

  test("공개 crew detail의 가입과 활동 진입은 로그인 모달을 띄운다", async ({ page }) => {
    await page.goto("/crews/crew-1");

    await expect(page.getByText("한강 러너스")).toBeVisible();

    await page.getByRole("button", { name: "로그인하고 크루 가입" }).click();
    await expect(page).toHaveURL(/\/crews\/crew-1$/);
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("dialog").getByText("크루 참여")).toBeVisible();

    await page.keyboard.press("Escape");
    await page.getByText("토요일 한강 10K").click();

    await expect(page).toHaveURL(/\/crews\/crew-1$/);
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("invite 진입의 로그인 모달은 원래 crew invite URL을 next로 보존한다", async ({ page }) => {
    await page.goto("/crews/crew-1?invite=1");

    await page.getByRole("button", { name: "로그인하고 가입하기" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("link", { name: "로그인" })).toHaveAttribute(
      "href",
      "/login?intent=login&next=%2Fcrews%2Fcrew-1%3Finvite%3D1",
    );
  });

  test("protected deep link는 로그인 화면으로 가되 next 경로를 보존한다", async ({ page }) => {
    await page.goto("/crews/crew-1/activities/activity-1");

    await expect(page).toHaveURL(
      /\/login\?intent=login&next=%2Fcrews%2Fcrew-1%2Factivities%2Factivity-1$/,
    );
  });

  test("공개 post 댓글 로딩 실패는 auth wall이 아니라 generic error로 보인다", async ({ page }) => {
    await page.route(`${API_BASE}/posts/post-1/comments?limit=50`, (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "server error" }),
      });
    });

    await page.goto("/posts/post-1");

    await expect(
      page.getByText("댓글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."),
    ).toBeVisible();
    await expect(page.getByText("댓글은 로그인 뒤에 이어서 볼 수 있습니다.")).toHaveCount(0);
  });
});
