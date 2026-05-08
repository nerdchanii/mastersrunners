import { isCrewHubSurfacePath } from "@/components/crew/crew-hub-routes";

export type MobileLayoutCategory = "contained" | "wide-surface" | "full-height" | "feed-exception";

export type MobileWidthCategory = "content" | "detail" | "list" | "form" | "wide";

export interface MobileRouteShell {
  category: MobileLayoutCategory;
  showBottomNav: boolean;
  width: MobileWidthCategory;
}

const PROFILE_SURFACE_PATTERN = /^\/profile(?:\/[^/]+)?\/?$/;
const MESSAGES_PATTERN = /^\/messages(?:\/.*)?$/;

export const MOBILE_SHELL_TOKENS_CLASS_NAME =
  "[--mobile-shell-safe-area-bottom:env(safe-area-inset-bottom)] " +
  "[--mobile-shell-bottom-inset:calc(5rem+var(--mobile-shell-safe-area-bottom))] " +
  "[--mobile-shell-sticky-bottom-offset:var(--mobile-shell-bottom-inset)] " +
  "[--mobile-shell-sticky-page-inset:calc(var(--mobile-shell-bottom-inset)+3rem)] " +
  "[--mobile-shell-full-height-inset:calc(0.5rem+var(--mobile-shell-safe-area-bottom))] " +
  "[--mobile-shell-feedback-bottom-offset:var(--mobile-shell-bottom-inset)]";

export const MOBILE_SHELL_SAFE_AREA_PADDING_CLASS_NAME =
  "pb-[var(--mobile-shell-safe-area-bottom)]";
export const MOBILE_SHELL_BOTTOM_INSET_CLASS_NAME = "pb-[var(--mobile-shell-bottom-inset)]";
export const MOBILE_SHELL_STICKY_PAGE_INSET_CLASS_NAME =
  "pb-[var(--mobile-shell-sticky-page-inset)]";
export const MOBILE_SHELL_STICKY_BOTTOM_OFFSET_CLASS_NAME =
  "bottom-[var(--mobile-shell-sticky-bottom-offset)]";
export const MOBILE_SHELL_FULL_HEIGHT_INSET_CLASS_NAME =
  "pb-[var(--mobile-shell-full-height-inset)]";
export const MOBILE_SHELL_FEEDBACK_BOTTOM_OFFSET_CLASS_NAME =
  "bottom-[var(--mobile-shell-feedback-bottom-offset)]";

export function isFeedExceptionPath(pathname: string): boolean {
  return pathname === "/feed";
}

export function isWideSurfacePath(pathname: string): boolean {
  return PROFILE_SURFACE_PATTERN.test(pathname) || isCrewHubSurfacePath(pathname);
}

export function isFullHeightPath(pathname: string): boolean {
  return MESSAGES_PATTERN.test(pathname) || pathname === "/crews/new";
}

export function shouldShowBottomNav(pathname: string): boolean {
  return !MESSAGES_PATTERN.test(pathname);
}

export function resolveMobileLayoutCategory(pathname: string): MobileLayoutCategory {
  if (isFeedExceptionPath(pathname)) {
    return "feed-exception";
  }

  if (isFullHeightPath(pathname)) {
    return "full-height";
  }

  if (isWideSurfacePath(pathname)) {
    return "wide-surface";
  }

  return "contained";
}

export function resolveMobileWidthCategory(pathname: string): MobileWidthCategory {
  if (
    pathname === "/posts/new" ||
    pathname === "/workouts/new" ||
    pathname === "/settings/profile" ||
    pathname === "/crews/new"
  ) {
    return "form";
  }

  if (pathname === "/feed" || pathname === "/notifications" || pathname === "/crews") {
    return "list";
  }

  if (pathname === "/onboarding") {
    return "content";
  }

  if (
    pathname === "/profile" ||
    PROFILE_SURFACE_PATTERN.test(pathname) ||
    isCrewHubSurfacePath(pathname)
  ) {
    return "wide";
  }

  return "detail";
}

export function resolveMobileRouteShell(pathname: string): MobileRouteShell {
  return {
    category: resolveMobileLayoutCategory(pathname),
    showBottomNav: shouldShowBottomNav(pathname),
    width: resolveMobileWidthCategory(pathname),
  };
}
