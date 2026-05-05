import path from "node:path";
import { fileURLToPath } from "node:url";

import { expect, test } from "@playwright/test";

import { setupAuth } from "./helpers/mock-auth";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_BASE = "http://localhost:4000/api/v1";

test.describe("게시글 사진 선택", () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);

    await page.route(`${API_BASE}/workouts`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await page.route(`${API_BASE}/uploads/presign`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          uploadUrl: "http://localhost:4000/upload-target/post-image-1",
          key: "posts/post-image-1.png",
          publicUrl: "http://localhost:4000/uploads/post-image-1.png",
        }),
      });
    });

    await page.route("http://localhost:4000/upload-target/**", (route) => {
      route.fulfill({
        status: 200,
        body: "",
      });
    });
  });

  test("사진 단계가 gallery-first grid를 보여주고 다음 단계까지 선택 이미지를 유지한다", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/posts/new");

    await page.getByRole("button", { name: "워크아웃 없이 진행" }).click();

    await expect(page.getByText("사진첩에서 선택")).toBeVisible();
    await expect(page.getByRole("button", { name: "사진첩 열기" })).toBeVisible();
    await expect(page.getByRole("button", { name: "사진 추가" })).toBeVisible();

    const fileInput = page.locator("input[type='file']");
    await fileInput.setInputFiles(
      path.resolve(__dirname, "../../../node_modules/swagger-ui-dist/favicon-32x32.png"),
    );

    await expect(page.getByAltText("선택한 사진 1")).toBeVisible();
    await expect(
      page.getByText("선택한 사진은 다음 내용 작성 단계 상단에도 유지됩니다."),
    ).toBeVisible();

    await page.getByRole("button", { name: "다음" }).click();

    await expect(page.getByText("이 게시글에 첨부될 사진")).toBeVisible();
    await expect(page.getByAltText("선택한 사진 1")).toBeVisible();
  });
});
