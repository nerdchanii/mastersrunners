import { describe, expect, it } from "vitest";

import {
  MOBILE_SHELL_BOTTOM_INSET_CLASS_NAME,
  MOBILE_SHELL_FEEDBACK_BOTTOM_OFFSET_CLASS_NAME,
  MOBILE_SHELL_FULL_HEIGHT_INSET_CLASS_NAME,
  MOBILE_SHELL_STICKY_BOTTOM_OFFSET_CLASS_NAME,
  MOBILE_SHELL_STICKY_PAGE_INSET_CLASS_NAME,
  MOBILE_SHELL_TOKENS_CLASS_NAME,
  resolveMobileRouteShell,
} from "./mobile-shell";

describe("mobile shell route mapping", () => {
  it("keeps /feed as the only feed-exception route", () => {
    expect(resolveMobileRouteShell("/feed")).toMatchObject({
      category: "feed-exception",
      showBottomNav: true,
      width: "list",
    });
    expect(resolveMobileRouteShell("/feed/saved").category).toBe("contained");
  });

  it("maps profile and crew hub surfaces to the same wide-surface family", () => {
    expect(resolveMobileRouteShell("/profile")).toMatchObject({
      category: "wide-surface",
      width: "wide",
    });
    expect(resolveMobileRouteShell("/profile/user-1")).toMatchObject({
      category: "wide-surface",
      width: "wide",
    });
    expect(resolveMobileRouteShell("/crews/crew-1")).toMatchObject({
      category: "wide-surface",
      width: "wide",
    });
    expect(resolveMobileRouteShell("/crews/crew-1/activities").category).toBe("wide-surface");
  });

  it("maps messages and crew creation into the full-height family", () => {
    expect(resolveMobileRouteShell("/messages")).toMatchObject({
      category: "full-height",
      showBottomNav: false,
      width: "detail",
    });
    expect(resolveMobileRouteShell("/messages/crew/crew-1")).toMatchObject({
      category: "full-height",
      showBottomNav: false,
    });
    expect(resolveMobileRouteShell("/crews/new")).toMatchObject({
      category: "full-height",
      showBottomNav: true,
      width: "form",
    });
  });

  it("keeps explicit contained route semantics for list and form subpatterns", () => {
    expect(resolveMobileRouteShell("/notifications")).toMatchObject({
      category: "contained",
      width: "list",
    });
    expect(resolveMobileRouteShell("/settings/profile")).toMatchObject({
      category: "contained",
      width: "form",
    });
    expect(resolveMobileRouteShell("/onboarding")).toMatchObject({
      category: "contained",
      width: "content",
    });
  });

  it("exports a single shell-owned bottom inset contract", () => {
    expect(MOBILE_SHELL_TOKENS_CLASS_NAME).toContain("--mobile-shell-bottom-inset");
    expect(MOBILE_SHELL_TOKENS_CLASS_NAME).toContain("--mobile-shell-sticky-page-inset");
    expect(MOBILE_SHELL_TOKENS_CLASS_NAME).toContain("--mobile-shell-full-height-inset");
    expect(MOBILE_SHELL_BOTTOM_INSET_CLASS_NAME).toBe("pb-[var(--mobile-shell-bottom-inset)]");
    expect(MOBILE_SHELL_STICKY_PAGE_INSET_CLASS_NAME).toBe(
      "pb-[var(--mobile-shell-sticky-page-inset)]",
    );
    expect(MOBILE_SHELL_STICKY_BOTTOM_OFFSET_CLASS_NAME).toBe(
      "bottom-[var(--mobile-shell-sticky-bottom-offset)]",
    );
    expect(MOBILE_SHELL_FULL_HEIGHT_INSET_CLASS_NAME).toBe(
      "pb-[var(--mobile-shell-full-height-inset)]",
    );
    expect(MOBILE_SHELL_FEEDBACK_BOTTOM_OFFSET_CLASS_NAME).toBe(
      "bottom-[var(--mobile-shell-feedback-bottom-offset)]",
    );
  });
});
