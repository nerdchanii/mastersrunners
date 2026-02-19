import { test, expect } from "@playwright/test";
import { setupAuth, mockUser } from "./helpers/mock-auth";

const API_BASE = "http://localhost:4000/api/v1";

const mockCrewId = "crew-1";
const mockActivityId = "activity-1";

const mockActivity = {
  id: mockActivityId,
  crewId: mockCrewId,
  title: "월요일 아침 러닝",
  description: "한강 공원에서 10K 러닝을 함께 합니다.",
  activityDate: new Date(Date.now() + 86400000).toISOString(),
  location: "올림픽공원 입구",
  latitude: 37.5204,
  longitude: 127.1215,
  createdBy: mockUser.id,
  createdAt: "2026-02-15T09:00:00.000Z",
  qrCode: "abc123",
  activityType: "OFFICIAL",
  status: "SCHEDULED",
  completedAt: null,
  workoutTypeId: null,
  attendances: [
    {
      id: "att-1",
      userId: "user-2",
      status: "CHECKED_IN",
      method: "QR",
      rsvpAt: "2026-02-16T08:50:00.000Z",
      checkedAt: "2026-02-16T09:05:00.000Z",
      checkedBy: null,
      user: { id: "user-2", name: "러닝맨", profileImage: null },
    },
    {
      id: "att-2",
      userId: "user-3",
      status: "RSVP",
      method: null,
      rsvpAt: "2026-02-16T08:55:00.000Z",
      checkedAt: null,
      checkedBy: null,
      user: { id: "user-3", name: "마라토너", profileImage: null },
    },
  ],
};

const mockCompletedActivity = {
  ...mockActivity,
  id: "activity-completed",
  title: "지난주 러닝",
  activityDate: "2026-02-10T09:00:00.000Z",
  status: "COMPLETED",
  completedAt: "2026-02-10T11:00:00.000Z",
  attendances: [
    {
      id: "att-3",
      userId: "user-2",
      status: "CHECKED_IN",
      method: "MANUAL",
      rsvpAt: "2026-02-10T08:50:00.000Z",
      checkedAt: "2026-02-10T09:05:00.000Z",
      checkedBy: null,
      user: { id: "user-2", name: "러닝맨", profileImage: null },
    },
    {
      id: "att-4",
      userId: "user-3",
      status: "NO_SHOW",
      method: null,
      rsvpAt: "2026-02-10T08:55:00.000Z",
      checkedAt: null,
      checkedBy: null,
      user: { id: "user-3", name: "마라토너", profileImage: null },
    },
  ],
};

const mockPopUpActivity = {
  ...mockActivity,
  id: "activity-popup",
  title: "번개 러닝",
  activityType: "POP_UP",
  createdBy: "user-2",
};

const mockCrew = {
  id: mockCrewId,
  name: "서울 러닝 크루",
  description: "서울에서 러닝하는 크루",
  imageUrl: null,
  isPublic: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  creator: { id: mockUser.id, name: mockUser.name, profileImage: null },
  _count: { members: 3 },
  members: [
    {
      id: "member-1",
      role: "OWNER",
      joinedAt: "2026-01-01T00:00:00.000Z",
      user: { id: mockUser.id, name: mockUser.name, profileImage: null },
    },
    {
      id: "member-2",
      role: "MEMBER",
      joinedAt: "2026-01-02T00:00:00.000Z",
      user: { id: "user-2", name: "러닝맨", profileImage: null },
    },
    {
      id: "member-3",
      role: "MEMBER",
      joinedAt: "2026-01-03T00:00:00.000Z",
      user: { id: "user-3", name: "마라토너", profileImage: null },
    },
  ],
};

const mockCrewMemberOnly = {
  ...mockCrew,
  members: [
    ...mockCrew.members.slice(1),
    {
      id: "member-me",
      role: "MEMBER",
      joinedAt: "2026-01-04T00:00:00.000Z",
      user: { id: mockUser.id, name: mockUser.name, profileImage: null },
    },
  ],
};

function setupActivityRoutes(page: import("@playwright/test").Page, opts?: {
  activity?: typeof mockActivity;
  crew?: typeof mockCrew;
}) {
  const activity = opts?.activity ?? mockActivity;
  const crew = opts?.crew ?? mockCrew;
  return Promise.all([
    page.route(`${API_BASE}/crews/${mockCrewId}/activities/${activity.id}`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(activity),
      });
    }),
    page.route(`${API_BASE}/crews/${mockCrewId}`, (route) => {
      if (route.request().url().includes("/activities")) return route.fallback();
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(crew),
      });
    }),
  ]);
}

test.describe("크루 활동 상세 페이지", () => {
  test.describe("Admin 사용자 (OWNER)", () => {
    test.beforeEach(async ({ page }) => {
      await setupAuth(page);
      await setupActivityRoutes(page);
    });

    test("활동 기본 정보와 타입/상태 뱃지가 표시된다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}/activities/${mockActivityId}`);

      await expect(page.getByText("월요일 아침 러닝")).toBeVisible();
      await expect(page.getByText("올림픽공원 입구")).toBeVisible();
      await expect(page.getByText("한강 공원에서 10K 러닝을 함께 합니다.")).toBeVisible();
      // 활동 타입 뱃지
      await expect(page.getByText("공식", { exact: true })).toBeVisible();
      // 상태 뱃지
      await expect(page.getByText("예정", { exact: true })).toBeVisible();
    });

    test("Admin 드롭다운 메뉴가 표시된다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}/activities/${mockActivityId}`);

      const menuTrigger = page.locator("button").filter({ has: page.locator("svg.lucide-ellipsis") });
      await expect(menuTrigger).toBeVisible();

      await menuTrigger.click();
      await expect(page.getByText("수정")).toBeVisible();
      await expect(page.getByText("삭제")).toBeVisible();
    });

    test("QR 코드가 표시된다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}/activities/${mockActivityId}`);

      const qrCode = page.locator("#activity-qr-code");
      await expect(qrCode).toBeVisible();
      await expect(page.getByRole("button", { name: /QR 코드 저장/ })).toBeVisible();
    });

    test("참석자 통계 바가 상태별로 표시된다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}/activities/${mockActivityId}`);

      await expect(page.getByText("참석자 (2명)")).toBeVisible();
      await expect(page.getByText(/전체.*2.*명/)).toBeVisible();
      await expect(page.getByText(/체크인.*1.*명/)).toBeVisible();
      await expect(page.getByText(/신청.*1.*명/)).toBeVisible();
    });

    test("위치가 있으면 지도가 표시된다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}/activities/${mockActivityId}`);

      const mapContainer = page.locator(".leaflet-container");
      await expect(mapContainer).toBeVisible();
    });

    test("활동 관리 카드가 표시된다 (종료/취소)", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}/activities/${mockActivityId}`);

      await expect(page.getByRole("button", { name: "활동 종료" })).toBeVisible();
      await expect(page.getByRole("button", { name: "활동 취소" })).toBeVisible();
    });

    test("RSVP 참석자 옆에 대리 체크인 버튼이 있다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}/activities/${mockActivityId}`);

      await expect(page.getByRole("button", { name: "대리 체크인" })).toBeVisible();
    });
  });

  test.describe("일반 멤버 (MEMBER) - RSVP 전", () => {
    test.beforeEach(async ({ page }) => {
      await setupAuth(page);
      await setupActivityRoutes(page, { crew: mockCrewMemberOnly });
    });

    test("Admin 메뉴가 표시되지 않는다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}/activities/${mockActivityId}`);

      await expect(page.getByText("월요일 아침 러닝")).toBeVisible();
      const menuTrigger = page.locator("button").filter({ has: page.locator("svg.lucide-ellipsis") });
      await expect(menuTrigger).not.toBeVisible();
    });

    test("참석 신청 버튼이 표시된다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}/activities/${mockActivityId}`);

      await expect(page.getByRole("button", { name: "참석 신청" })).toBeVisible();
    });
  });

  test.describe("종료된 활동", () => {
    test.beforeEach(async ({ page }) => {
      await setupAuth(page);
      await setupActivityRoutes(page, {
        activity: mockCompletedActivity,
        crew: mockCrewMemberOnly,
      });
    });

    test("종료된 활동은 체크인이 불가하다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}/activities/activity-completed`);

      await expect(page.getByText("종료", { exact: true })).toBeVisible();
      await expect(page.getByText("이 활동은 종료되었습니다.")).toBeVisible();
      await expect(page.getByRole("button", { name: "참석 신청" })).not.toBeVisible();
    });

    test("불참 상태가 표시된다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}/activities/activity-completed`);

      // NO_SHOW 뱃지 확인
      await expect(page.getByText("불참", { exact: true }).first()).toBeVisible();
    });
  });

  test.describe("번개 활동 (POP_UP)", () => {
    test.beforeEach(async ({ page }) => {
      await setupAuth(page);
      await setupActivityRoutes(page, { activity: mockPopUpActivity });
    });

    test("번개 뱃지가 표시된다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}/activities/activity-popup`);

      await expect(page.getByText("번개", { exact: true })).toBeVisible();
    });
  });

  test.describe("활동 수정 페이지", () => {
    test.beforeEach(async ({ page }) => {
      await setupAuth(page);
      await setupActivityRoutes(page);
    });

    test("수정 페이지에 기존 데이터가 프리필된다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}/activities/${mockActivityId}/edit`);

      await expect(page.getByText("활동 수정")).toBeVisible();
      await expect(page.locator("#title")).toHaveValue("월요일 아침 러닝");
      await expect(page.locator("#location")).toHaveValue("올림픽공원 입구");
    });
  });
});
