import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  QueryClient,
  QueryClientProvider,
  type QueryKey,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { type PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as eventHookModule from "@/hooks/useEvents";
import { eventInvalidationTargets, eventKeys, eventQueries } from "@/hooks/useEvents";

const { fetchMock } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
}));

vi.mock("@/lib/api-client", () => ({
  api: {
    fetch: fetchMock,
  },
}));

const sourceDirectory = path.dirname(fileURLToPath(import.meta.url));
const eventHookExports = eventHookModule as unknown as Record<string, unknown>;
const eventQueryFactories = eventQueries as unknown as Record<
  string,
  (eventId: string) => { queryKey: QueryKey }
>;

type MutationHook<TVariables> = () => UseMutationResult<unknown, Error, TVariables, unknown>;
type ExpectedInvalidation = {
  exact: boolean;
  queryKey: QueryKey;
};

async function readSource(relativePath: string) {
  return readFile(path.join(sourceDirectory, relativePath), "utf8");
}

function createQueryClientWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { queryClient, wrapper };
}

function expectEventQueryFactory(name: string, expectedQueryKey: QueryKey) {
  const factory = eventQueryFactories[name];

  expect(factory, `eventQueries.${name} must be exported as a query option factory`).toEqual(
    expect.any(Function),
  );
  expect(factory("event-1").queryKey).toEqual(expectedQueryKey);
}

function getFirstExportedHook<TFunction extends (...args: never[]) => unknown>(
  hookNames: readonly string[],
): TFunction {
  const hookName = hookNames.find((candidate) => typeof eventHookExports[candidate] === "function");

  expect(
    hookName,
    `Expected one of ${hookNames.join(", ")} to be exported from useEvents`,
  ).toBeDefined();

  return eventHookExports[hookName!] as TFunction;
}

function expectInvalidationCalls(
  invalidateQueriesSpy: ReturnType<typeof vi.spyOn>,
  expectedInvalidations: readonly ExpectedInvalidation[],
) {
  expect(invalidateQueriesSpy).toHaveBeenCalledTimes(expectedInvalidations.length);

  for (const [index, expectedInvalidation] of expectedInvalidations.entries()) {
    const filters = invalidateQueriesSpy.mock.calls[index]?.[0] as
      | { exact?: boolean; queryKey?: QueryKey }
      | undefined;

    expect(filters?.queryKey).toEqual(expectedInvalidation.queryKey);
    expect(filters?.exact === true).toBe(expectedInvalidation.exact);
  }
}

describe("event detail query migration source contract", () => {
  it("keeps the event detail route hook out of api-client ownership", async () => {
    const routeHookSource = await readSource("../[id]/useEventDetailPage.ts");

    expect(routeHookSource).not.toContain("@/lib/api-client");
    expect(routeHookSource).not.toMatch(/\bapi\.fetch\b/);
    expect(routeHookSource).not.toContain("eventKeys");
    expect(routeHookSource).not.toContain("useQueryClient");
  });

  it("exposes detail, my result, and results query options keyed by eventKeys", () => {
    expectEventQueryFactory("detail", eventKeys.detail("event-1"));
    expectEventQueryFactory("myResult", eventKeys.myResult("event-1"));
    expectEventQueryFactory("results", eventKeys.results("event-1"));
  });

  it("exposes detail, my result, and results hooks from the event domain module", () => {
    expect(eventHookExports.useEvent).toEqual(expect.any(Function));
    expect(eventHookExports.useEventMyResult).toEqual(expect.any(Function));
    expect(eventHookExports.useEventResults).toEqual(expect.any(Function));
  });
});

describe("event detail mutation invalidation contract", () => {
  const mutationCases: Array<{
    expectedInvalidations: readonly ExpectedInvalidation[];
    hookNames: readonly string[];
    label: string;
    variables: unknown;
  }> = [
    {
      expectedInvalidations: [
        { exact: true, queryKey: eventKeys.detail("event-1") },
        { exact: true, queryKey: eventKeys.myResult("event-1") },
        { exact: false, queryKey: eventKeys.listFamily() },
        { exact: false, queryKey: eventKeys.infiniteListFamily() },
      ],
      hookNames: ["useRegisterEvent", "useJoinEvent"],
      label: "register",
      variables: "event-1",
    },
    {
      expectedInvalidations: [
        { exact: true, queryKey: eventKeys.detail("event-1") },
        { exact: true, queryKey: eventKeys.myResult("event-1") },
        { exact: false, queryKey: eventKeys.listFamily() },
        { exact: false, queryKey: eventKeys.infiniteListFamily() },
      ],
      hookNames: ["useCancelEventRegistration", "useCancelRegistration", "useLeaveEvent"],
      label: "cancel",
      variables: "event-1",
    },
    {
      expectedInvalidations: [
        { exact: true, queryKey: eventKeys.detail("event-1") },
        { exact: true, queryKey: eventKeys.myResult("event-1") },
        { exact: true, queryKey: eventKeys.results("event-1") },
      ],
      hookNames: ["useSubmitEventResult"],
      label: "submit result",
      variables: { body: { resultTime: 3600 }, eventId: "event-1" },
    },
    {
      expectedInvalidations: [
        { exact: true, queryKey: eventKeys.detail("event-1") },
        { exact: true, queryKey: eventKeys.myResult("event-1") },
      ],
      hookNames: ["useLinkEventWorkout"],
      label: "link workout",
      variables: { eventId: "event-1", workoutId: "workout-1" },
    },
    {
      expectedInvalidations: [
        { exact: true, queryKey: eventKeys.detail("event-1") },
        { exact: true, queryKey: eventKeys.myResult("event-1") },
      ],
      hookNames: ["useUnlinkEventWorkout"],
      label: "unlink workout",
      variables: { eventId: "event-1" },
    },
  ];

  beforeEach(() => {
    fetchMock.mockReset();
  });

  it.each(mutationCases)(
    "invalidates event query keys with the intended exactness after $label succeeds",
    async ({ expectedInvalidations, hookNames, variables }) => {
      fetchMock.mockResolvedValue({ ok: true });
      const { queryClient, wrapper } = createQueryClientWrapper();
      const invalidateQueriesSpy = vi
        .spyOn(queryClient, "invalidateQueries")
        .mockResolvedValue(undefined);
      const useMutationHook = getFirstExportedHook<MutationHook<unknown>>(hookNames);

      const { result } = renderHook(() => useMutationHook(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync(variables);
      });

      expectInvalidationCalls(invalidateQueriesSpy, expectedInvalidations);
    },
  );

  it("keeps useDeleteEvent scoped to the DELETE request", async () => {
    fetchMock.mockResolvedValue({ ok: true });
    const { queryClient, wrapper } = createQueryClientWrapper();
    const invalidateQueriesSpy = vi
      .spyOn(queryClient, "invalidateQueries")
      .mockResolvedValue(undefined);
    const useDeleteEvent = getFirstExportedHook<MutationHook<string>>(["useDeleteEvent"]);

    const { result } = renderHook(() => useDeleteEvent(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync("event-1");
    });

    expect(fetchMock).toHaveBeenCalledWith("/events/event-1", { method: "DELETE" });
    expect(invalidateQueriesSpy).not.toHaveBeenCalled();
  });

  it("deletes from the route hook before navigating and broadly invalidating deleted events", async () => {
    const order: string[] = [];
    fetchMock.mockImplementation(async (path: string, init?: { method?: string }) => {
      if (path === "/events/event-1" && init?.method === "DELETE") {
        order.push("DELETE");
      }

      return { ok: true };
    });
    const { queryClient, wrapper } = createQueryClientWrapper();
    const invalidateQueriesSpy = vi
      .spyOn(queryClient, "invalidateQueries")
      .mockImplementation(async () => {
        order.push("invalidate");
      });
    const { useEventDetailPage } = await import("../[id]/useEventDetailPage");

    const { result } = renderHook(
      () => useEventDetailPage("event-1", "info", () => order.push("navigate")),
      { wrapper },
    );

    await act(async () => {
      await result.current.deleteEvent();
    });

    expect(order).toEqual(["DELETE", "navigate", "invalidate"]);
    expectInvalidationCalls(invalidateQueriesSpy, [
      { exact: false, queryKey: eventInvalidationTargets.delete()[0] },
    ]);
  });
});

describe("event results auxiliary query recovery contract", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("keeps results failure inline-retryable instead of route-fatal", async () => {
    fetchMock
      .mockRejectedValueOnce(new Error("results unavailable"))
      .mockResolvedValueOnce([{ resultRank: 1, user: { id: "user-1", name: "김러너" } }]);
    const { wrapper } = createQueryClientWrapper();
    const useEventResults = getFirstExportedHook<
      (eventId: string, options?: { enabled?: boolean }) => UseQueryResult<unknown[], Error>
    >(["useEventResults"]);

    const { result } = renderHook(() => useEventResults("event-1", { enabled: true }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.refetch).toEqual(expect.any(Function));

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() =>
      expect(result.current.data).toEqual([
        { resultRank: 1, user: { id: "user-1", name: "김러너" } },
      ]),
    );
  });
});
