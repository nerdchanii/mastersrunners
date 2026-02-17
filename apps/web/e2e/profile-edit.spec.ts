import { test, expect } from "@playwright/test";
import { setupAuth, mockUser } from "./helpers/mock-auth";

const API_BASE = "http://localhost:4000/api/v1";

test.describe("프로필 수정 페이지", () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
  });

  test("프로필 수정 페이지가 로드된다", async ({ page }) => {
    await page.goto("/settings/profile");
    await expect(page.getByText("프로필 수정")).toBeVisible();
  });

  test("배경 이미지 영역 + 프로필 사진 영역이 존재한다", async ({ page }) => {
    await page.goto("/settings/profile");

    // 배경 이미지 영역 (gradient fallback)
    const coverArea = page.locator("[class*='aspect-\\[3\\/1\\]']");
    await expect(coverArea).toBeVisible();

    // 프로필 사진 (Avatar with ring)
    const avatar = page.locator("[class*='ring-4'][class*='ring-card']").first();
    await expect(avatar).toBeVisible();
  });

  test("이름/bio 폼 필드가 기존 값으로 채워진다", async ({ page }) => {
    await page.goto("/settings/profile");

    const nameInput = page.locator("#name");
    await expect(nameInput).toHaveValue(mockUser.name);

    const bioTextarea = page.locator("#bio");
    await expect(bioTextarea).toHaveValue(mockUser.bio!);
  });

  test("이름 글자수 카운터가 표시된다", async ({ page }) => {
    await page.goto("/settings/profile");
    await expect(page.getByText(`${mockUser.name.length}/50`)).toBeVisible();
  });

  test("bio 글자수 카운터가 표시된다", async ({ page }) => {
    await page.goto("/settings/profile");
    await expect(page.getByText(`${mockUser.bio!.length}/300`)).toBeVisible();
  });

  test("이름이 2자 미만이면 validation 에러가 표시된다", async ({ page }) => {
    await page.goto("/settings/profile");

    // Mock PATCH endpoint
    await page.route(`${API_BASE}/profile`, (route) => {
      if (route.request().method() === "PATCH") {
        route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockUser) });
      } else {
        route.continue();
      }
    });

    const nameInput = page.locator("#name");
    await nameInput.fill("A");

    // Submit
    await page.getByRole("button", { name: "저장" }).click();

    await expect(page.getByText("이름은 2자 이상이어야 합니다.")).toBeVisible();
  });

  test("저장/취소 버튼이 존재한다", async ({ page }) => {
    await page.goto("/settings/profile");
    await expect(page.getByRole("button", { name: "저장" })).toBeVisible();
    await expect(page.getByRole("button", { name: "취소" })).toBeVisible();
  });
});
