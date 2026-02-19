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
      userId: mockUser.id,
      status: "RSVP",
      method: null,
      rsvpAt: "2026-02-16T08:50:00.000Z",
      checkedAt: null,
      checkedBy: null,
      user: { id: mockUser.id, name: mockUser.name, profileImage: null },
    },
  ],
};

const mockActivityCheckedIn = {
  ...mockActivity,
  attendances: [
    {
      id: "att-1",
      userId: mockUser.id,
      status: "CHECKED_IN",
      method: "QR",
      rsvpAt: "2026-02-16T08:50:00.000Z",
      checkedAt: "2026-02-16T09:05:00.000Z",
      checkedBy: null,
      user: { id: mockUser.id, name: mockUser.name, profileImage: null },
    },
  ],
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
      role: "MEMBER",
      joinedAt: "2026-01-01T00:00:00.000Z",
      user: { id: mockUser.id, name: mockUser.name, profileImage: null },
    },
  ],
};

function setupRoutes(page: import("@playwright/test").Page, opts?: {
  activity?: typeof mockActivity;
  qrCheckInResponse?: { status: number; body: string };
}) {
  const activity = opts?.activity ?? mockActivity;
  return Promise.all([
    page.route(`${API_BASE}/crews/${mockCrewId}/activities/${mockActivityId}`, (route) => {
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
        body: JSON.stringify(mockCrew),
      });
    }),
    page.route(`${API_BASE}/crews/${mockCrewId}/activities/${mockActivityId}/qr-check-in`, (route) => {
      if (opts?.qrCheckInResponse) {
        route.fulfill({
          status: opts.qrCheckInResponse.status,
          contentType: "application/json",
          body: opts.qrCheckInResponse.body,
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      }
    }),
  ]);
}

test.describe("QR 체크인 페이지", () => {
  test.describe("URL code 파라미터로 접근", () => {
    test.beforeEach(async ({ page }) => {
      await setupAuth(page);
      await setupRoutes(page);
    });

    test("QR 체크인 페이지가 표시된다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}/activities/${mockActivityId}/qr-check-in?code=abc123`);

      await expect(page.getByText("QR 체크인")).toBeVisible();
      await expect(page.getByText("월요일 아침 러닝")).toBeVisible();
      await expect(page.getByRole("button", { name: /QR 코드로 체크인/ })).toBeVisible();
    });

    test("QR 코드로 체크인 버튼 클릭 시 체크인이 성공한다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}/activities/${mockActivityId}/qr-check-in?code=abc123`);

      await page.getByRole("button", { name: /QR 코드로 체크인/ }).click();

      // setCheckInSuccess(true) triggers success screen
      await expect(page.getByRole("heading", { name: "체크인 완료!" })).toBeVisible();
      await expect(page.getByRole("button", { name: "활동으로 돌아가기" })).toBeVisible();
    });

    test("잘못된 QR 코드로 체크인 실패 시 에러가 표시된다", async ({ page }) => {
      await setupRoutes(page, {
        qrCheckInResponse: {
          status: 400,
          body: JSON.stringify({ message: "유효하지 않은 QR 코드입니다." }),
        },
      });

      await page.goto(`/crews/${mockCrewId}/activities/${mockActivityId}/qr-check-in?code=wrong-code`);

      await page.getByRole("button", { name: /QR 코드로 체크인/ }).click();

      // Error state should show retry button
      await expect(page.getByRole("button", { name: "다시 시도" })).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("카메라 스캐너 모드 (code 파라미터 없음)", () => {
    test.beforeEach(async ({ page }) => {
      await setupAuth(page);
      await setupRoutes(page);
    });

    test("카메라 스캔 버튼과 수동 체크인 링크가 표시된다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}/activities/${mockActivityId}/qr-check-in`);

      await expect(page.getByText("QR 체크인")).toBeVisible();
      await expect(page.getByText("QR 코드 스캔")).toBeVisible();
      await expect(page.getByRole("button", { name: /카메라로 QR 스캔/ })).toBeVisible();
      await expect(page.getByText("카메라를 사용할 수 없나요?")).toBeVisible();
      await expect(page.getByRole("button", { name: "수동 체크인으로 이동" })).toBeVisible();
    });

    test("활동 정보가 카드에 표시된다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}/activities/${mockActivityId}/qr-check-in`);

      await expect(page.getByText("월요일 아침 러닝")).toBeVisible();
    });
  });

  test.describe("이미 체크인된 사용자", () => {
    test.beforeEach(async ({ page }) => {
      await setupAuth(page);
      await setupRoutes(page, { activity: mockActivityCheckedIn });
    });

    test("이미 체크인한 경우 성공 화면이 바로 표시된다", async ({ page }) => {
      await page.goto(`/crews/${mockCrewId}/activities/${mockActivityId}/qr-check-in?code=abc123`);

      await expect(page.getByText("체크인 완료!")).toBeVisible();
      await expect(page.getByRole("button", { name: "활동으로 돌아가기" })).toBeVisible();
    });
  });
});
