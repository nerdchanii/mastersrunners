import type { Page } from "@playwright/test";

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

export async function setupGuestPublicEntry(page: Page) {
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
