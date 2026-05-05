import type { Page } from "@playwright/test";

const API_BASE = "http://localhost:4000/api/v1";

export const mockUser = {
  id: "test-user-1",
  email: "test@example.com",
  name: "테스트러너",
  profileImage: null,
  backgroundImage: null,
  bio: "마스터즈 러닝 클럽 멤버",
  isPrivate: false,
  workoutSharingDefault: "FOLLOWERS",
  region: "서울특별시",
  subRegion: "마포구",
  pb5kSeconds: 1260,
  pb10kSeconds: 2700,
  pbHalfMarathonSeconds: 5940,
  pbMarathonSeconds: 12900,
  createdAt: "2026-01-01T00:00:00.000Z",
};

export async function setupAuth(page: Page) {
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

  // Mock /auth/me endpoint BEFORE any navigation
  await page.route(`${API_BASE}/auth/me`, (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockUser),
    });
  });

  // Mock auth refresh endpoint
  await page.route(`${API_BASE}/auth/refresh`, (route) => {
    route.fulfill({
      status: 204,
    });
  });

  await page.route(`${API_BASE}/auth/logout`, (route) => {
    route.fulfill({
      status: 204,
    });
  });

  await page.route(`${API_BASE}/conversations?limit=100`, (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: [],
        nextCursor: null,
      }),
    });
  });

  await page.route(`${API_BASE}/conversations/unread-count`, (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        count: 0,
      }),
    });
  });

  await page.route(`${API_BASE}/notifications/unread-count`, (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        count: 0,
      }),
    });
  });
}

export const mockProfileStats = {
  postCount: 12,
  followerCount: 48,
  followingCount: 23,
  workoutCount: 156,
};

export const mockWorkoutDetail = {
  id: "workout-1",
  distance: 10500,
  duration: 3120,
  pace: 297,
  date: "2026-02-15T09:00:00.000Z",
  memo: "아침 조깅 10K 완주! 날씨가 좋았다.",
  visibility: "PUBLIC",
  calories: 680,
  elevationGain: 125,
  avgHeartRate: 152,
  maxHeartRate: 178,
  avgCadence: 172,
  maxCadence: 185,
  liked: false,
  likeCount: 5,
  commentCount: 2,
  user: {
    id: "test-user-1",
    name: "테스트러너",
    profileImage: null,
  },
  workoutType: { id: "wt-1", name: "달리기", category: "RUNNING" },
  shoe: { id: "shoe-1", brand: "Nike", model: "Vaporfly 3" },
  workoutRoutes: [
    {
      id: "route-1",
      routeData: JSON.stringify([
        {
          lat: 37.5665,
          lon: 126.978,
          elevation: 35,
          heartRate: 140,
          cadence: 165,
          timestamp: "2026-02-15T09:00:00Z",
        },
        {
          lat: 37.567,
          lon: 126.979,
          elevation: 38,
          heartRate: 148,
          cadence: 170,
          timestamp: "2026-02-15T09:05:00Z",
        },
        {
          lat: 37.568,
          lon: 126.98,
          elevation: 42,
          heartRate: 155,
          cadence: 175,
          timestamp: "2026-02-15T09:10:00Z",
        },
        {
          lat: 37.569,
          lon: 126.981,
          elevation: 40,
          heartRate: 160,
          cadence: 172,
          timestamp: "2026-02-15T09:15:00Z",
        },
        {
          lat: 37.57,
          lon: 126.982,
          elevation: 36,
          heartRate: 152,
          cadence: 170,
          timestamp: "2026-02-15T09:20:00Z",
        },
      ]),
    },
  ],
  workoutFiles: [
    {
      id: "file-1",
      originalFileName: "morning_run.fit",
      fileType: "FIT",
      fileSize: 245760,
      createdAt: "2026-02-15T09:30:00.000Z",
    },
  ],
  workoutLaps: [
    {
      lapNumber: 1,
      distance: 1000,
      duration: 295,
      pace: 295,
      avgHeartRate: 158,
      maxHeartRate: 165,
      avgCadence: 175,
      calories: 70,
    },
    {
      id: "l2",
      workoutId: "mock1",
      lapNumber: 2,
      trigger: "AUTO_KM",
      distance: 1000,
      duration: 290,
      pace: 290,
      avgHeartRate: 162,
      maxHeartRate: 168,
      avgCadence: 176,
      calories: 72,
    },
    {
      id: "l3",
      workoutId: "mock1",
      lapNumber: 3,
      trigger: "AUTO_KM",
      distance: 1000,
      duration: 298,
      pace: 298,
      avgHeartRate: 165,
      maxHeartRate: 172,
      avgCadence: 174,
      calories: 75,
    },
    {
      id: "l4",
      workoutId: "mock1",
      lapNumber: 4,
      trigger: "AUTO_KM",
      distance: 1000,
      duration: 302,
      pace: 302,
      avgHeartRate: 168,
      maxHeartRate: 175,
      avgCadence: 173,
      calories: 76,
    },
    {
      id: "l5",
      workoutId: "mock1",
      lapNumber: 5,
      trigger: "AUTO_KM",
      distance: 1000,
      duration: 285,
      pace: 285,
      avgHeartRate: 172,
      maxHeartRate: 178,
      avgCadence: 175,
      calories: 70,
    },
  ],
};
