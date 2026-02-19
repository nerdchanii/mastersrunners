import { test, expect } from "@playwright/test";
import { setupAuth, mockUser } from "./helpers/mock-auth";

const API_BASE = "http://localhost:4000/api/v1";

const mockMyCrews = [
  {
    id: "crew-1",
    name: "서울 러닝 크루",
    imageUrl: null,
    _count: { members: 15 },
    creator: { id: mockUser.id, name: mockUser.name, profileImage: null },
  },
];

const mockExploreCrews = {
  items: [
    {
      id: "crew-2",
      name: "한강 러너스",
      description: "한강을 달리는 크루",
      imageUrl: null,
      region: "서울특별시",
      subRegion: "마포구",
      _count: { members: 25, activities: 10 },
      creator: { id: "user-3", name: "한강러너", profileImage: null },
    },
    {
      id: "crew-3",
      name: "부산 비치 러닝",
      description: "해운대를 달립니다",
      imageUrl: null,
      region: "부산광역시",
      subRegion: "해운대구",
      _count: { members: 18, activities: 5 },
      creator: { id: "user-4", name: "비치러너", profileImage: null },
    },
  ],
  nextCursor: null,
};

const mockRegions = [
  { region: "서울특별시", crewCount: 15 },
  { region: "부산광역시", crewCount: 8 },
  { region: "경기도", crewCount: 12 },
];

const mockSubRegions = [
  { subRegion: "마포구", crewCount: 3 },
  { subRegion: "강남구", crewCount: 5 },
];

const mockRecommend = [
  {
    id: "crew-4",
    name: "추천 러닝 크루",
    description: "지역 기반 추천",
    imageUrl: null,
    region: "서울특별시",
    subRegion: null,
    _count: { members: 30, activities: 20 },
    creator: { id: "user-5", name: "추천러너", profileImage: null },
  },
];

function setupRoutes(page: import("@playwright/test").Page) {
  return Promise.all([
    page.route(`${API_BASE}/crews/my`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockMyCrews),
      });
    }),
    page.route(`${API_BASE}/crews/explore*`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockExploreCrews),
      });
    }),
    page.route(`${API_BASE}/crews/recommend`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockRecommend),
      });
    }),
    page.route(`${API_BASE}/crews/regions`, (route) => {
      const url = route.request().url();
      if (url.match(/\/regions\/[^/]+/)) return route.fallback();
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockRegions),
      });
    }),
    page.route(`${API_BASE}/crews/regions/**`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockSubRegions),
      });
    }),
  ]);
}

test.describe("크루 탐색", () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await setupRoutes(page);
  });

  test.describe("탭 구조", () => {
    test("내 크루 탭이 기본으로 표시된다", async ({ page }) => {
      await page.goto("/crews");

      await expect(page.getByText("서울 러닝 크루")).toBeVisible();
    });

    test("크루 찾기 탭으로 전환이 가능하다", async ({ page }) => {
      await page.goto("/crews");

      await page.getByRole("tab", { name: "크루 찾기" }).click();

      await expect(page.getByText("한강 러너스")).toBeVisible();
    });
  });

  test.describe("크루 찾기", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/crews");
      await page.getByRole("tab", { name: "크루 찾기" }).click();
    });

    test("크루 목록이 표시된다", async ({ page }) => {
      await expect(page.getByText("한강 러너스")).toBeVisible();
      await expect(page.getByText("부산 비치 러닝")).toBeVisible();
    });

    test("지역 필터가 표시된다", async ({ page }) => {
      await expect(page.getByText("서울", { exact: false }).first()).toBeVisible();
      await expect(page.getByText("부산", { exact: false }).first()).toBeVisible();
      await expect(page.getByText("경기", { exact: false }).first()).toBeVisible();
    });

    test("정렬 옵션이 표시된다", async ({ page }) => {
      await expect(page.getByText("활동순", { exact: false }).first()).toBeVisible();
      await expect(page.getByText("멤버순", { exact: false }).first()).toBeVisible();
      await expect(page.getByText("최신순", { exact: false }).first()).toBeVisible();
    });

    test("추천 크루가 표시된다", async ({ page }) => {
      await expect(page.getByText("추천 크루", { exact: false }).first()).toBeVisible();
      await expect(page.getByText("추천 러닝 크루")).toBeVisible();
    });
  });
});
