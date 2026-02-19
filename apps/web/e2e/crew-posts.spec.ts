import { test, expect } from "@playwright/test";
import { setupAuth, mockUser } from "./helpers/mock-auth";

const API_BASE = "http://localhost:4000/api/v1";

const mockCrewId = "crew-1";

const mockCrew = {
  id: mockCrewId,
  name: "서울 러닝 크루",
  description: "서울에서 러닝하는 크루",
  imageUrl: null,
  coverImageUrl: null,
  location: "서울 한강",
  region: "서울특별시",
  subRegion: "마포구",
  isPublic: true,
  maxMembers: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  creator: { id: mockUser.id, name: mockUser.name, profileImage: null },
  _count: { members: 2 },
  members: [
    {
      id: "member-1",
      userId: mockUser.id,
      role: "OWNER",
      status: "ACTIVE",
      joinedAt: "2026-01-01T00:00:00.000Z",
      user: { id: mockUser.id, name: mockUser.name, profileImage: null },
    },
    {
      id: "member-2",
      userId: "user-2",
      role: "MEMBER",
      status: "ACTIVE",
      joinedAt: "2026-01-02T00:00:00.000Z",
      user: { id: "user-2", name: "러닝맨", profileImage: null },
    },
  ],
};

const mockCrewPosts = {
  items: [
    {
      id: "post-1",
      userId: mockUser.id,
      crewId: mockCrewId,
      content: "이번 주 토요일 한강 러닝에 참여해주세요!",
      visibility: "PUBLIC",
      createdAt: "2026-02-18T10:00:00.000Z",
      user: { id: mockUser.id, name: mockUser.name, profileImage: null },
      images: [],
      _count: { likes: 12, comments: 5 },
    },
  ],
  nextCursor: null,
};

const mockCrewProfile = {
  crew: {
    id: mockCrewId,
    name: "서울 러닝 크루",
    description: "서울에서 러닝하는 크루",
    imageUrl: null,
    coverImageUrl: null,
    location: "서울 한강",
    region: "서울특별시",
    subRegion: "마포구",
    creator: { id: mockUser.id, name: mockUser.name, profileImage: null },
    _count: { members: 2, activities: 5, boards: 2 },
  },
  recentPosts: [],
  upcomingActivities: [],
};

function setupBaseRoutes(page: import("@playwright/test").Page) {
  return Promise.all([
    page.route(`${API_BASE}/crews/${mockCrewId}`, (route) => {
      const url = route.request().url();
      if (
        url.includes("/posts") ||
        url.includes("/chat") ||
        url.includes("/activities") ||
        url.includes("/attendance") ||
        url.includes("/boards") ||
        url.includes("/profile")
      )
        return route.fallback();
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockCrew),
      });
    }),
    page.route(`${API_BASE}/crews/${mockCrewId}/posts*`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockCrewPosts),
      });
    }),
    page.route(`${API_BASE}/crews/${mockCrewId}/profile`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockCrewProfile),
      });
    }),
    page.route(`${API_BASE}/crews/${mockCrewId}/chat*`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ conversation: null, messages: [], nextCursor: null }),
      });
    }),
    page.route(`${API_BASE}/crews/${mockCrewId}/activities*`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ items: [], nextCursor: null }),
      });
    }),
    page.route(`${API_BASE}/crews/${mockCrewId}/attendance-stats*`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ activities: [], memberStats: [], overallRate: 0 }),
      });
    }),
    page.route(`${API_BASE}/crews/${mockCrewId}/boards`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    }),
  ]);
}

test.describe("크루 게시물", () => {
  test.describe("게시물 탭", () => {
    test.beforeEach(async ({ page }) => {
      await setupAuth(page);
      await setupBaseRoutes(page);
    });

    test("게시물 탭이 표시된다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}`);

      await page.getByRole("tab", { name: "게시물" }).click();

      await expect(page.getByText("이번 주 토요일 한강 러닝에 참여해주세요!")).toBeVisible();
    });

    test("게시물에 좋아요/댓글 수가 표시된다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}`);

      await page.getByRole("tab", { name: "게시물" }).click();

      await expect(page.getByText("12")).toBeVisible();
      await expect(page.getByText("5")).toBeVisible();
    });

    test("크루장에게 작성 버튼이 표시된다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}`);

      await page.getByRole("tab", { name: "게시물" }).click();

      await expect(page.getByRole("button", { name: "크루 게시물 작성" })).toBeVisible();
    });
  });

  test.describe("게시물 작성 (OWNER)", () => {
    test.beforeEach(async ({ page }) => {
      await setupAuth(page);
      await setupBaseRoutes(page);
    });

    test("작성 버튼 클릭 시 폼이 표시된다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}`);

      await page.getByRole("tab", { name: "게시물" }).click();
      await page.getByRole("button", { name: "크루 게시물 작성" }).click();

      await expect(page.getByPlaceholder("크루 소식을 공유하세요...")).toBeVisible();
    });

    test("게시물 작성 후 토스트가 표시된다", async ({ page }) => {
      await page.route(`${API_BASE}/crews/${mockCrewId}/posts`, (route) => {
        if (route.request().method() === "POST") {
          route.fulfill({
            status: 201,
            contentType: "application/json",
            body: JSON.stringify({
              id: "post-new",
              userId: mockUser.id,
              crewId: mockCrewId,
              content: "새로운 크루 게시물입니다.",
              visibility: "PUBLIC",
              createdAt: new Date().toISOString(),
              user: { id: mockUser.id, name: mockUser.name, profileImage: null },
              images: [],
              _count: { likes: 0, comments: 0 },
            }),
          });
          return;
        }
        route.fallback();
      });

      await page.goto(`/crews/${mockCrewId}`);

      await page.getByRole("tab", { name: "게시물" }).click();
      await page.getByRole("button", { name: "크루 게시물 작성" }).click();
      await page.getByPlaceholder("크루 소식을 공유하세요...").fill("새로운 크루 게시물입니다.");
      await page.getByRole("button", { name: "작성", exact: true }).click();

      await expect(page.getByText("게시물이 작성되었습니다")).toBeVisible();
    });
  });
});
