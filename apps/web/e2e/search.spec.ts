import { expect, test } from "@playwright/test";

import { setupAuth } from "./helpers/mock-auth";

const API_BASE = "http://localhost:4000/api/v1";

const mockSearchUsers = [
  {
    id: "user-9",
    name: "러너 김",
    email: "runner@example.com",
    profileImage: null,
    bio: "주말마다 한강을 달립니다",
    _count: { followers: 12, following: 8, workouts: 42 },
    isFollowing: false,
  },
];

const mockPopularHashtags = [
  { tag: "러닝", count: 12 },
  { tag: "한강", count: 8 },
];

const mockHashtagPosts = {
  items: [
    {
      id: "post-1",
      content: "한강에서 템포런 완료",
      hashtags: ["러닝", "한강"],
      createdAt: "2026-04-05T07:00:00.000Z",
      isLiked: false,
      user: {
        id: "user-9",
        name: "러너 김",
        profileImage: null,
      },
      _count: {
        likes: 3,
        comments: 1,
      },
      images: [],
      workouts: [],
    },
  ],
  nextCursor: null,
};

test.describe("검색 UX", () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);

    await page.route(`${API_BASE}/profile/search*`, (route) => {
      const url = new URL(route.request().url());
      const query = url.searchParams.get("q");

      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(query === "없음" ? [] : mockSearchUsers),
      });
    });

    await page.route(`${API_BASE}/posts/hashtags/popular?limit=10`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockPopularHashtags),
      });
    });

    await page.route(`${API_BASE}/posts/hashtag/*`, (route) => {
      const url = decodeURIComponent(route.request().url());
      const hasNoResults = url.includes("/posts/hashtag/없음?");

      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          hasNoResults
            ? {
                items: [],
                nextCursor: null,
              }
            : mockHashtagPosts,
        ),
      });
    });
  });

  test("검색 화면은 제목만 보여주고 과한 설명 카피를 두지 않는다", async ({ page }) => {
    await page.goto("/search");

    await expect(page.getByRole("heading", { name: "검색" })).toBeVisible();
    await expect(page.getByText("러너와 해시태그를 검색하세요.")).toHaveCount(0);
    await expect(page.getByText("이름이나 이메일로 바로 찾을 수 있습니다.")).toBeVisible();
  });

  test("사용자 검색은 리스트 중심으로 결과를 보여준다", async ({ page }) => {
    await page.goto("/search");

    const input = page.getByPlaceholder("러너 이름 또는 이메일로 검색...");
    await input.fill("러너");

    await expect(page).toHaveURL(/q=%EB%9F%AC%EB%84%88/);
    await expect(page.getByText("1명의 사용자")).toBeVisible();
    await expect(page.getByText("러너 김")).toBeVisible();
  });

  test("사용자 검색 결과가 없으면 짧은 empty state를 보여준다", async ({ page }) => {
    await page.goto("/search");

    await page.getByPlaceholder("러너 이름 또는 이메일로 검색...").fill("없음");

    await expect(page.getByText('"없음"에 대한 사용자가 없습니다.')).toBeVisible();
  });

  test("해시태그 탭은 인기 태그와 결과 리스트를 보여준다", async ({ page }) => {
    await page.goto("/search");

    await page.getByRole("tab", { name: "해시태그" }).click();
    await expect(page.getByText("인기 해시태그")).toBeVisible();

    await page.getByPlaceholder("태그 검색...").fill("러닝");

    await expect(page).toHaveURL(/hashtag=%EB%9F%AC%EB%8B%9D/);
    await expect(page.getByText("#러닝 태그 게시글")).toBeVisible();
    await expect(page.getByText("한강에서 템포런 완료")).toBeVisible();
  });
});
