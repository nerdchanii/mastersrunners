import type { Page } from "@playwright/test";

const API_BASE = "http://localhost:4000/api/v1";

export const mockUser = {
  id: "test-user-1",
  email: "test@example.com",
  name: "테스트러너",
  profileImage: null,
  backgroundImage: null,
  bio: "마스터즈 러닝 클럽 멤버",
  createdAt: "2026-01-01T00:00:00.000Z",
};

export async function setupAuth(page: Page) {
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
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        accessToken: "mock-access-token-new",
        refreshToken: "mock-refresh-token-new",
      }),
    });
  });

  // Navigate to a page on the origin first to set localStorage
  await page.goto("/login");
  await page.evaluate(() => {
    window.localStorage.setItem("accessToken", "mock-access-token");
    window.localStorage.setItem("refreshToken", "mock-refresh-token");
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
        { lat: 37.5665, lon: 126.978, elevation: 35, heartRate: 140, cadence: 165, timestamp: "2026-02-15T09:00:00Z" },
        { lat: 37.567, lon: 126.979, elevation: 38, heartRate: 148, cadence: 170, timestamp: "2026-02-15T09:05:00Z" },
        { lat: 37.568, lon: 126.98, elevation: 42, heartRate: 155, cadence: 175, timestamp: "2026-02-15T09:10:00Z" },
        { lat: 37.569, lon: 126.981, elevation: 40, heartRate: 160, cadence: 172, timestamp: "2026-02-15T09:15:00Z" },
        { lat: 37.57, lon: 126.982, elevation: 36, heartRate: 152, cadence: 170, timestamp: "2026-02-15T09:20:00Z" },
      ]),
    },
  ],
  workoutFiles: [
    {
      id: "file-1",
      originalFilename: "morning_run.fit",
      fileType: "FIT",
      fileSize: 245760,
      createdAt: "2026-02-15T09:30:00.000Z",
    },
  ],
  workoutLaps: [
    { lapNumber: 1, distance: 1000, duration: 295, avgPace: 295, avgHeartRate: 142, maxHeartRate: 155, avgCadence: 168, calories: 65 },
    { lapNumber: 2, distance: 1000, duration: 290, avgPace: 290, avgHeartRate: 148, maxHeartRate: 162, avgCadence: 170, calories: 67 },
    { lapNumber: 3, distance: 1000, duration: 298, avgPace: 298, avgHeartRate: 150, maxHeartRate: 165, avgCadence: 171, calories: 66 },
    { lapNumber: 4, distance: 1000, duration: 302, avgPace: 302, avgHeartRate: 153, maxHeartRate: 170, avgCadence: 172, calories: 68 },
    { lapNumber: 5, distance: 1000, duration: 285, avgPace: 285, avgHeartRate: 158, maxHeartRate: 178, avgCadence: 175, calories: 70 },
  ],
};
