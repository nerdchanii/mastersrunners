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

import * as challengeHookModule from "@/hooks/useChallenges";
import { challengeInvalidationTargets, challengeKeys } from "@/hooks/useChallenges";

const { fetchMock } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
}));

vi.mock("@/lib/api-client", () => ({
  api: {
    fetch: fetchMock,
  },
}));

const sourceDirectory = path.dirname(fileURLToPath(import.meta.url));
const challengeHookExports = challengeHookModule as unknown as Record<string, unknown>;
const challengeQueries = challengeHookExports.challengeQueries as
  | Record<string, (challengeId: string) => { queryKey: QueryKey }>
  | undefined;

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

function expectChallengeQueryFactory(name: string, expectedQueryKey: QueryKey) {
  const factory = challengeQueries?.[name];

  expect(factory, `challengeQueries.${name} must be exported as a query option factory`).toEqual(
    expect.any(Function),
  );
  expect(factory!("challenge-1").queryKey).toEqual(expectedQueryKey);
}

function getExportedHook<TFunction extends (...args: never[]) => unknown>(
  hookName: string,
): TFunction {
  expect(challengeHookExports[hookName], `${hookName} must be exported from useChallenges`).toEqual(
    expect.any(Function),
  );

  return challengeHookExports[hookName] as TFunction;
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

describe("challenge detail query migration source contract", () => {
  it("keeps the challenge detail route hook out of api-client ownership", async () => {
    const routeHookSource = await readSource("../[id]/useChallengeDetailPage.ts");

    expect(routeHookSource).not.toContain("@/lib/api-client");
    expect(routeHookSource).not.toMatch(/\bapi\.fetch\b/);
    expect(routeHookSource).not.toContain("challengeKeys");
    expect(routeHookSource).not.toContain("useQueryClient");
  });

  it("exposes detail and leaderboard query options keyed by challengeKeys", () => {
    expectChallengeQueryFactory("detail", challengeKeys.detail("challenge-1"));
    expectChallengeQueryFactory(
      "leaderboard",
      challengeKeys.leaderboard("challenge-1", { limit: 50 }),
    );
  });

  it("exposes detail and leaderboard hooks from the challenge domain module", () => {
    expect(challengeHookExports.useChallenge).toEqual(expect.any(Function));
    expect(challengeHookExports.useChallengeLeaderboard).toEqual(expect.any(Function));
  });
});

describe("challenge detail mutation invalidation contract", () => {
  const mutationCases: Array<{
    expectedInvalidations: readonly ExpectedInvalidation[];
    hookName: string;
    label: string;
    variables: unknown;
  }> = [
    {
      expectedInvalidations: [
        { exact: true, queryKey: challengeKeys.detail("challenge-1") },
        { exact: false, queryKey: challengeKeys.listFamily() },
        { exact: false, queryKey: challengeKeys.infiniteListFamily() },
      ],
      hookName: "useJoinChallenge",
      label: "join",
      variables: "challenge-1",
    },
    {
      expectedInvalidations: [
        { exact: true, queryKey: challengeKeys.detail("challenge-1") },
        { exact: false, queryKey: challengeKeys.listFamily() },
        { exact: false, queryKey: challengeKeys.infiniteListFamily() },
      ],
      hookName: "useLeaveChallenge",
      label: "leave",
      variables: "challenge-1",
    },
    {
      expectedInvalidations: [
        { exact: true, queryKey: challengeKeys.detail("challenge-1") },
        { exact: true, queryKey: challengeKeys.leaderboard("challenge-1", { limit: 50 }) },
      ],
      hookName: "useUpdateChallengeProgress",
      label: "update progress",
      variables: { challengeId: "challenge-1", currentValue: 42 },
    },
  ];

  beforeEach(() => {
    fetchMock.mockReset();
  });

  it.each(mutationCases)(
    "invalidates challenge query keys with the intended exactness after $label succeeds",
    async ({ expectedInvalidations, hookName, variables }) => {
      fetchMock.mockResolvedValue({ ok: true });
      const { queryClient, wrapper } = createQueryClientWrapper();
      const invalidateQueriesSpy = vi
        .spyOn(queryClient, "invalidateQueries")
        .mockResolvedValue(undefined);
      const useMutationHook = getExportedHook<MutationHook<unknown>>(hookName);

      const { result } = renderHook(() => useMutationHook(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync(variables);
      });

      expectInvalidationCalls(invalidateQueriesSpy, expectedInvalidations);
    },
  );

  it("keeps useDeleteChallenge scoped to the DELETE request", async () => {
    fetchMock.mockResolvedValue({ ok: true });
    const { queryClient, wrapper } = createQueryClientWrapper();
    const invalidateQueriesSpy = vi
      .spyOn(queryClient, "invalidateQueries")
      .mockResolvedValue(undefined);
    const useDeleteChallenge = getExportedHook<MutationHook<string>>("useDeleteChallenge");

    const { result } = renderHook(() => useDeleteChallenge(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync("challenge-1");
    });

    expect(fetchMock).toHaveBeenCalledWith("/challenges/challenge-1", { method: "DELETE" });
    expect(invalidateQueriesSpy).not.toHaveBeenCalled();
  });

  it("deletes from the route hook before navigating and broadly invalidating deleted challenges", async () => {
    const order: string[] = [];
    fetchMock.mockImplementation(async (requestPath: string, init?: { method?: string }) => {
      if (requestPath === "/challenges/challenge-1" && init?.method === "DELETE") {
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
    const { useChallengeDetailPage } = await import("../[id]/useChallengeDetailPage");

    const { result } = renderHook(
      () => useChallengeDetailPage("challenge-1", "info", () => order.push("navigate")),
      { wrapper },
    );

    await act(async () => {
      await result.current.deleteChallenge();
    });

    expect(order).toEqual(["DELETE", "navigate", "invalidate"]);
    expectInvalidationCalls(invalidateQueriesSpy, [
      { exact: false, queryKey: challengeInvalidationTargets.delete()[0] },
    ]);
  });
});

describe("challenge leaderboard auxiliary query recovery contract", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("exposes detail failure and recovers challenge data through route hook retry", async () => {
    const challengeDetail = {
      id: "challenge-1",
      title: "아침 러닝",
      description: null,
      type: "DISTANCE",
      targetValue: 42,
      targetUnit: "KM",
      startDate: "2026-05-01T00:00:00.000Z",
      endDate: "2026-05-31T00:00:00.000Z",
      isPublic: true,
      creatorId: "user-1",
      creator: { id: "user-1", name: "김러너", profileImage: null },
      isJoined: false,
      _count: { participants: 3 },
    };
    fetchMock
      .mockRejectedValueOnce(new Error("detail unavailable"))
      .mockResolvedValueOnce(challengeDetail);
    const { wrapper } = createQueryClientWrapper();
    const { useChallengeDetailPage } = await import("../[id]/useChallengeDetailPage");

    const { result } = renderHook(() => useChallengeDetailPage("challenge-1", "info", vi.fn()), {
      wrapper,
    });

    await waitFor(() => expect(result.current.error).toBe("detail unavailable"));

    expect(result.current.challenge).toBeNull();
    expect(result.current.retryChallenge).toEqual(expect.any(Function));

    await act(async () => {
      await result.current.retryChallenge();
    });

    await waitFor(() => expect(result.current.challenge).toEqual(challengeDetail));
    expect(result.current.error).toBeNull();
    expect(fetchMock).toHaveBeenCalledWith("/challenges/challenge-1");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("keeps leaderboard failure inline-retryable instead of route-fatal", async () => {
    fetchMock
      .mockRejectedValueOnce(new Error("leaderboard unavailable"))
      .mockResolvedValueOnce([{ rank: 1, progress: 42, user: { id: "user-1", name: "김러너" } }]);
    const { wrapper } = createQueryClientWrapper();
    const useChallengeLeaderboard =
      getExportedHook<
        (challengeId: string, options?: { enabled?: boolean }) => UseQueryResult<unknown[], Error>
      >("useChallengeLeaderboard");

    const { result } = renderHook(() => useChallengeLeaderboard("challenge-1", { enabled: true }), {
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
        { rank: 1, progress: 42, user: { id: "user-1", name: "김러너" } },
      ]),
    );
  });
});
