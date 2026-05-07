import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ReactNode } from "react";
import {
  createMemoryRouter,
  type LoaderFunctionArgs,
  MemoryRouter,
  Outlet,
  Route,
  RouterProvider,
  Routes,
} from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RootRouteErrorElement, RouteQueryRecoveryBoundary } from "./router";

const { queryResetMock, routeEvents } = vi.hoisted(() => {
  const routeEvents: string[] = [];

  return {
    queryResetMock: vi.fn(() => {
      routeEvents.push("query-reset");
    }),
    routeEvents,
  };
});

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();

  return {
    ...actual,
    QueryErrorResetBoundary: ({
      children,
    }: {
      children: (value: { reset: () => void }) => ReactNode;
    }) => <>{children({ reset: queryResetMock })}</>,
  };
});

vi.mock("@/components/common/BottomNav", () => ({
  BottomNav: () => <nav aria-label="bottom navigation" />,
}));

vi.mock("@/components/common/LoadingPage", () => ({
  LoadingPage: () => <div>loading</div>,
}));

vi.mock("@/components/layout/Header", () => ({
  default: () => <header aria-label="site header" />,
}));

vi.mock("@/pages/auth/callback", () => ({
  default: () => <div>auth callback</div>,
}));

vi.mock("@/pages/login", () => ({
  default: () => <div>login</div>,
}));

vi.mock("@/pages/not-found", () => ({
  default: () => <div>not found</div>,
}));

function ThrowingRoute(): ReactNode {
  routeEvents.push("route-render");
  throw new Error("route query failed");
}

function TestLayout() {
  return (
    <RouteQueryRecoveryBoundary>
      <Outlet />
    </RouteQueryRecoveryBoundary>
  );
}

describe("route query recovery", () => {
  beforeEach(() => {
    queryResetMock.mockClear();
    routeEvents.length = 0;
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  it("resets query errors before remounting the route fallback retry target", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/feed"]}>
        <Routes>
          <Route element={<TestLayout />}>
            <Route path="/feed" element={<ThrowingRoute />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByRole("button", { name: "다시 시도" });
    const eventCountBeforeRetry = routeEvents.length;

    await user.click(screen.getByRole("button", { name: "다시 시도" }));

    await waitFor(() => {
      expect(queryResetMock).toHaveBeenCalledTimes(1);
    });

    const retryEvents = routeEvents.slice(eventCountBeforeRetry);

    expect(retryEvents[0]).toBe("query-reset");
    expect(retryEvents).toContain("route-render");
  });

  it("resets query errors before retrying the root route error element at the same location", async () => {
    const user = userEvent.setup();
    let shouldThrow = true;

    const router = createMemoryRouter(
      [
        {
          path: "/",
          errorElement: <RootRouteErrorElement />,
          children: [
            {
              path: "feed",
              loader: ({ request }: LoaderFunctionArgs) => {
                routeEvents.push(`loader:${new URL(request.url).pathname}`);

                if (shouldThrow) {
                  throw new Error("root route query failed");
                }

                return null;
              },
              element: <div>feed recovered</div>,
            },
          ],
        },
      ],
      { initialEntries: ["/feed?tab=latest#comments"] },
    );

    render(<RouterProvider router={router} />);

    await screen.findByText("root route query failed");
    await screen.findByRole("button", { name: "다시 시도" });

    const eventCountBeforeRetry = routeEvents.length;
    shouldThrow = false;

    await user.click(screen.getByRole("button", { name: "다시 시도" }));

    await screen.findByText("feed recovered");

    const retryEvents = routeEvents.slice(eventCountBeforeRetry);

    expect(queryResetMock).toHaveBeenCalledTimes(1);
    expect(retryEvents[0]).toBe("query-reset");
    expect(retryEvents).toContain("loader:/feed");
    expect(router.state.location.pathname).toBe("/feed");
    expect(router.state.location.search).toBe("?tab=latest");
    expect(router.state.location.hash).toBe("#comments");
    expect(router.state.historyAction).toBe("REPLACE");
  });
});
