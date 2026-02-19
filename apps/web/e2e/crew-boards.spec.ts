import { test, expect } from "@playwright/test";
import { setupAuth, mockUser } from "./helpers/mock-auth";

const API_BASE = "http://localhost:4000/api/v1";

const mockCrewId = "crew-1";

const mockCrew = {
  id: mockCrewId,
  name: "서울 러닝 크루",
  description: "서울에서 러닝하는 크루",
  imageUrl: null,
  isPublic: true,
  maxMembers: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  creator: { id: mockUser.id, name: mockUser.name, profileImage: null },
  _count: { members: 2 },
  members: [
    {
      id: "member-1",
      userId: mockUser.id,
      role: "MEMBER",
      status: "ACTIVE",
      joinedAt: "2026-01-01T00:00:00.000Z",
      user: { id: mockUser.id, name: mockUser.name, profileImage: null },
    },
    {
      id: "member-2",
      userId: "user-2",
      role: "OWNER",
      status: "ACTIVE",
      joinedAt: "2026-01-01T00:00:00.000Z",
      user: { id: "user-2", name: "러닝맨", profileImage: null },
    },
  ],
};

const mockBoards = [
  {
    id: "board-1",
    crewId: mockCrewId,
    name: "공지사항",
    type: "ANNOUNCEMENT",
    writePermission: "ADMIN_ONLY",
    sortOrder: 0,
    _count: { posts: 2 },
  },
  {
    id: "board-2",
    crewId: mockCrewId,
    name: "자유게시판",
    type: "FREE",
    writePermission: "ALL_MEMBERS",
    sortOrder: 1,
    _count: { posts: 5 },
  },
];

const mockPosts = {
  items: [
    {
      id: "post-1",
      boardId: "board-2",
      title: "오늘 러닝 후기",
      content: "한강에서 10K 달렸습니다. 날씨가 좋았어요!",
      isPinned: false,
      authorId: mockUser.id,
      author: { id: mockUser.id, name: mockUser.name, profileImage: null },
      createdAt: "2026-02-18T10:00:00.000Z",
      updatedAt: "2026-02-18T10:00:00.000Z",
      images: [],
      _count: { comments: 3, likes: 5 },
    },
    {
      id: "post-2",
      boardId: "board-2",
      title: "새 러닝화 추천해주세요",
      content: "예산 15만원 정도로 좋은 러닝화 있을까요?",
      isPinned: false,
      authorId: "user-2",
      author: { id: "user-2", name: "러닝맨", profileImage: null },
      createdAt: "2026-02-17T15:00:00.000Z",
      updatedAt: "2026-02-17T15:00:00.000Z",
      images: [],
      _count: { comments: 7, likes: 2 },
    },
  ],
  nextCursor: null,
};

const mockPostDetail = {
  id: "post-1",
  boardId: "board-2",
  title: "오늘 러닝 후기",
  content: "한강에서 10K 달렸습니다. 날씨가 좋았어요!",
  isPinned: false,
  authorId: mockUser.id,
  author: { id: mockUser.id, name: mockUser.name, profileImage: null },
  createdAt: "2026-02-18T10:00:00.000Z",
  updatedAt: "2026-02-18T10:00:00.000Z",
  images: [],
  comments: [
    {
      id: "comment-1",
      content: "대단해요! 저도 다음엔 같이 달려요",
      authorId: "user-2",
      author: { id: "user-2", name: "러닝맨", profileImage: null },
      parentId: null,
      createdAt: "2026-02-18T11:00:00.000Z",
      replies: [
        {
          id: "comment-2",
          content: "좋아요! 다음 주 같이 달려요",
          authorId: mockUser.id,
          author: { id: mockUser.id, name: mockUser.name, profileImage: null },
          parentId: "comment-1",
          createdAt: "2026-02-18T11:30:00.000Z",
          replies: [],
        },
      ],
    },
  ],
  _count: { comments: 2, likes: 5 },
  liked: false,
};

function setupBaseRoutes(page: import("@playwright/test").Page) {
  return Promise.all([
    page.route(`${API_BASE}/crews/${mockCrewId}`, (route) => {
      if (
        route.request().url().includes("/chat") ||
        route.request().url().includes("/activities") ||
        route.request().url().includes("/attendance") ||
        route.request().url().includes("/boards")
      )
        return route.fallback();
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockCrew),
      });
    }),
    page.route(`${API_BASE}/crews/${mockCrewId}/boards`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockBoards),
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
  ]);
}

test.describe("크루 게시판", () => {
  test.describe("게시판 목록", () => {
    test.beforeEach(async ({ page }) => {
      await setupAuth(page);
      await setupBaseRoutes(page);
    });

    test("게시판 탭이 표시된다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}`);

      await page.getByRole("tab", { name: "게시판" }).click();

      await expect(page.getByText("공지사항")).toBeVisible();
      await expect(page.getByText("자유게시판")).toBeVisible();
    });

    test("게시판 타입과 글 수가 표시된다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}`);

      await page.getByRole("tab", { name: "게시판" }).click();

      await expect(page.getByText("공지", { exact: true }).first()).toBeVisible();
      await expect(page.getByText("자유", { exact: true }).first()).toBeVisible();
      await expect(page.getByText("2개 글")).toBeVisible();
      await expect(page.getByText("5개 글")).toBeVisible();
    });

    test("게시판 클릭 시 글 목록이 표시된다", async ({ page }) => {
      await page.route(
        `${API_BASE}/crews/${mockCrewId}/boards/board-2/posts*`,
        (route) => {
          route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(mockPosts),
          });
        },
      );

      await page.goto(`/crews/${mockCrewId}`);

      await page.getByRole("tab", { name: "게시판" }).click();
      await page.getByText("자유게시판").click();

      await expect(page.getByText("오늘 러닝 후기")).toBeVisible();
      await expect(page.getByText("새 러닝화 추천해주세요")).toBeVisible();
    });
  });

  test.describe("글 목록", () => {
    test.beforeEach(async ({ page }) => {
      await setupAuth(page);
      await setupBaseRoutes(page);
      await page.route(
        `${API_BASE}/crews/${mockCrewId}/boards/board-2/posts*`,
        (route) => {
          route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(mockPosts),
          });
        },
      );
    });

    test("글쓰기 버튼이 표시된다 (ALL_MEMBERS 권한)", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}`);

      await page.getByRole("tab", { name: "게시판" }).click();
      await page.getByText("자유게시판").click();

      await expect(page.getByRole("button", { name: "글쓰기" })).toBeVisible();
    });

    test("글 클릭 시 상세가 표시된다", async ({ page }) => {
      await page.route(
        `${API_BASE}/crews/${mockCrewId}/boards/board-2/posts/post-1`,
        (route) => {
          route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(mockPostDetail),
          });
        },
      );

      await page.goto(`/crews/${mockCrewId}`);

      await page.getByRole("tab", { name: "게시판" }).click();
      await page.getByText("자유게시판").click();
      await page.getByText("오늘 러닝 후기").first().click();

      await expect(page.getByText("한강에서 10K 달렸습니다. 날씨가 좋았어요!")).toBeVisible();
      await expect(page.getByText("댓글")).toBeVisible();
    });
  });

  test.describe("글 상세", () => {
    test.beforeEach(async ({ page }) => {
      await setupAuth(page);
      await setupBaseRoutes(page);
      await page.route(
        `${API_BASE}/crews/${mockCrewId}/boards/board-2/posts/**`,
        (route) => {
          route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(mockPostDetail),
          });
        },
      );
      await page.route(
        `${API_BASE}/crews/${mockCrewId}/boards/board-2/posts`,
        (route) => {
          if (route.request().url().includes("/posts/")) return route.fallback();
          route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(mockPosts),
          });
        },
      );
    });

    test("댓글과 대댓글이 표시된다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}`);

      await page.getByRole("tab", { name: "게시판" }).click();
      await page.getByText("자유게시판").click();
      await page.getByText("오늘 러닝 후기").first().click();

      await expect(page.getByText("대단해요! 저도 다음엔 같이 달려요")).toBeVisible();
      await expect(page.getByText("좋아요! 다음 주 같이 달려요")).toBeVisible();
    });

    test("댓글 입력 필드가 있다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}`);

      await page.getByRole("tab", { name: "게시판" }).click();
      await page.getByText("자유게시판").click();
      await page.getByText("오늘 러닝 후기").first().click();

      await expect(page.getByPlaceholder("댓글을 입력하세요...")).toBeVisible();
    });
  });
});
