import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { PropsWithChildren, ReactElement } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useUpdateWorkoutVisibility, workoutKeys } from "@/hooks/useWorkouts";

import ShareToggle from "../../workout/ShareToggle";
import { LikeButton } from "../LikeButton";

const apiMock = vi.hoisted(() => ({
  fetch: vi.fn(),
  fetchSession: vi.fn(),
  logout: vi.fn(),
}));

const toastMock = vi.hoisted(() => ({
  error: vi.fn(),
}));

vi.mock("@/lib/api-client", () => ({
  api: apiMock,
}));

vi.mock("sonner", () => ({
  toast: toastMock,
}));

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    logout: vi.fn(),
    refreshUser: vi.fn(),
    user: {
      id: "user-1",
      email: "runner@example.com",
      name: "김러너",
      profileImage: null,
      backgroundImage: null,
      bio: null,
      isPrivate: false,
      workoutSharingDefault: "PUBLIC",
      region: "서울",
      subRegion: "성동구",
      pb5kSeconds: null,
      pb10kSeconds: null,
      pbHalfMarathonSeconds: null,
      pbMarathonSeconds: null,
      createdAt: "2026-05-07T00:00:00.000Z",
    },
  }),
}));

type TestWorkout = {
  id: string;
  distance: number;
  duration: number;
  pace: number;
  date: string;
  memo: string | null;
  visibility: "PRIVATE" | "FOLLOWERS" | "PUBLIC";
};

const sourceDirectory = path.dirname(fileURLToPath(import.meta.url));

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });
}

function renderWithProviders(ui: ReactElement) {
  const queryClient = createQueryClient();
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );

  return { queryClient, ...render(ui, { wrapper }) };
}

function createWorkout(overrides: Partial<TestWorkout> = {}): TestWorkout {
  return {
    id: "workout-1",
    distance: 5000,
    duration: 1500,
    pace: 300,
    date: "2026-05-07",
    memo: null,
    visibility: "PRIVATE",
    ...overrides,
  };
}

function createDeferred<TValue>() {
  let reject!: (reason?: unknown) => void;
  let resolve!: (value: TValue | PromiseLike<TValue>) => void;
  const promise = new Promise<TValue>((promiseResolve, promiseReject) => {
    reject = promiseReject;
    resolve = promiseResolve;
  });

  return { promise, reject, resolve };
}

async function readOwnedSource(relativePath: string) {
  return readFile(path.join(sourceDirectory, relativePath), "utf8");
}

function extractExportedFunctionSource(source: string, functionName: string) {
  const start = source.indexOf(`export function ${functionName}`);
  expect(start).toBeGreaterThanOrEqual(0);
  const nextExport = source.indexOf("\nexport function ", start + 1);

  return nextExport === -1 ? source.slice(start) : source.slice(start, nextExport);
}

describe("social and workout interaction hooks", () => {
  beforeEach(() => {
    apiMock.fetch.mockReset();
    apiMock.fetchSession.mockReset();
    apiMock.logout.mockReset();
    toastMock.error.mockReset();
  });

  it("keeps the LikeButton visual leaf out of mutation policy ownership", async () => {
    const source = await readOwnedSource("../LikeButton.tsx");
    const visualLeafSource = extractExportedFunctionSource(source, "LikeButtonControl");

    expect(visualLeafSource).not.toContain("@/lib/api-client");
    expect(visualLeafSource).not.toMatch(/\bapi\.(fetch|fetchSession)\b/);
    expect(visualLeafSource).not.toMatch(/\buse(ToggleSocialLike|SocialLikeInteraction)\b/);
  });

  it("keeps like error presentation out of the social interaction hook", async () => {
    const source = await readOwnedSource("../../../hooks/useSocial.ts");

    expect(source).not.toContain("sonner");
    expect(source).not.toMatch(/\btoast\./);
  });

  it("keeps the ShareToggle visual leaf out of mutation policy ownership", async () => {
    const source = await readOwnedSource("../../workout/ShareToggle.tsx");
    const visualLeafSource = extractExportedFunctionSource(source, "ShareToggleControl");

    expect(visualLeafSource).not.toContain("@/lib/api-client");
    expect(visualLeafSource).not.toMatch(/\bapi\.(fetch|fetchSession)\b/);
    expect(visualLeafSource).not.toMatch(
      /\buse(UpdateWorkoutVisibility|WorkoutVisibilityInteraction)\b/,
    );
  });

  it("rolls back LikeButton optimistic display state when the mutation fails", async () => {
    const user = userEvent.setup();
    const deferred = createDeferred<unknown>();
    apiMock.fetch.mockReturnValueOnce(deferred.promise);

    renderWithProviders(
      <LikeButton entityType="post" entityId="post-1" initialLiked={false} initialCount={2} />,
    );

    const button = screen.getByRole("button", { name: "좋아요" });
    await user.click(button);

    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("3")).toBeInTheDocument();

    deferred.reject(new Error("like failed"));

    await waitFor(() => expect(button).toHaveAttribute("aria-pressed", "false"));
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(toastMock.error).toHaveBeenCalledWith("like failed");
    expect(apiMock.fetch).toHaveBeenCalledWith("/posts/post-1/like", { method: "POST" });
  });

  it("rolls back ShareToggle selection and shows an inline mutation failure", async () => {
    const user = userEvent.setup();
    const deferred = createDeferred<TestWorkout>();
    apiMock.fetch.mockReturnValueOnce(deferred.promise);

    renderWithProviders(<ShareToggle workoutId="workout-1" initialVisibility="PRIVATE" />);

    const select = screen.getByRole("combobox", { name: "공개 설정" });
    await user.selectOptions(select, "PUBLIC");

    expect(select).toHaveValue("PUBLIC");

    deferred.reject(new Error("visibility failed"));

    await waitFor(() => expect(select).toHaveValue("PRIVATE"));
    expect(screen.getByRole("alert")).toHaveTextContent("visibility failed");
    expect(apiMock.fetch).toHaveBeenCalledWith("/workouts/workout-1", {
      method: "PATCH",
      body: JSON.stringify({ visibility: "PUBLIC" }),
    });
  });

  it("clears stale ShareToggle inline failure when the workout identity changes", async () => {
    const user = userEvent.setup();
    const deferred = createDeferred<TestWorkout>();
    apiMock.fetch.mockReturnValueOnce(deferred.promise);

    const { rerender } = renderWithProviders(
      <ShareToggle workoutId="workout-1" initialVisibility="PRIVATE" />,
    );

    const select = screen.getByRole("combobox", { name: "공개 설정" });
    await user.selectOptions(select, "PUBLIC");

    deferred.reject(new Error("visibility failed"));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("visibility failed"));

    rerender(<ShareToggle workoutId="workout-2" initialVisibility="FOLLOWERS" />);

    await waitFor(() => expect(select).toHaveValue("FOLLOWERS"));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("syncs ShareToggle selection to the successful mutation result", async () => {
    const user = userEvent.setup();
    apiMock.fetch.mockResolvedValueOnce(createWorkout({ visibility: "FOLLOWERS" }));

    renderWithProviders(<ShareToggle workoutId="workout-1" initialVisibility="PRIVATE" />);

    const select = screen.getByRole("combobox", { name: "공개 설정" });
    await user.selectOptions(select, "FOLLOWERS");

    await waitFor(() => expect(select).toHaveValue("FOLLOWERS"));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("optimistically updates workout detail, list, and feed visibility then rolls back on failure", async () => {
    const deferred = createDeferred<TestWorkout>();
    apiMock.fetch.mockReturnValueOnce(deferred.promise);
    const queryClient = createQueryClient();
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const listKey = workoutKeys.list({ limit: 10 });
    const feedKey = workoutKeys.feed({ excludeLinked: true, limit: 10 });

    queryClient.setQueryData(workoutKeys.detail("workout-1"), createWorkout());
    queryClient.setQueryData(listKey, [
      createWorkout(),
      createWorkout({ id: "workout-2", visibility: "FOLLOWERS" }),
    ]);
    queryClient.setQueryData(feedKey, {
      pageParams: [null],
      pages: [
        {
          hasMore: false,
          items: [createWorkout(), createWorkout({ id: "workout-2", visibility: "PUBLIC" })],
          nextCursor: null,
        },
      ],
    });

    const { result } = renderHook(() => useUpdateWorkoutVisibility(), { wrapper });

    await act(async () => {
      const promise = result.current.mutateAsync({
        visibility: "PUBLIC",
        workoutId: "workout-1",
      });

      await waitFor(() => {
        expect(
          queryClient.getQueryData<TestWorkout>(workoutKeys.detail("workout-1")),
        ).toMatchObject({
          visibility: "PUBLIC",
        });
      });
      expect(queryClient.getQueryData<TestWorkout[]>(listKey)?.[0]).toMatchObject({
        visibility: "PUBLIC",
      });
      expect(
        queryClient.getQueryData<{ pages: Array<{ items: TestWorkout[] }> }>(feedKey)?.pages[0]
          ?.items[0],
      ).toMatchObject({ visibility: "PUBLIC" });

      deferred.reject(new Error("visibility failed"));

      await expect(promise).rejects.toThrow("visibility failed");
    });

    expect(queryClient.getQueryData<TestWorkout>(workoutKeys.detail("workout-1"))).toMatchObject({
      visibility: "PRIVATE",
    });
    expect(queryClient.getQueryData<TestWorkout[]>(listKey)?.[0]).toMatchObject({
      visibility: "PRIVATE",
    });
    expect(
      queryClient.getQueryData<{ pages: Array<{ items: TestWorkout[] }> }>(feedKey)?.pages[0]
        ?.items[0],
    ).toMatchObject({ visibility: "PRIVATE" });
  });

  it("invalidates exact workout visibility targets after success", async () => {
    apiMock.fetch.mockResolvedValueOnce(createWorkout({ visibility: "PUBLIC" }));
    const queryClient = createQueryClient();
    const invalidateQueriesSpy = vi
      .spyOn(queryClient, "invalidateQueries")
      .mockResolvedValue(undefined);
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useUpdateWorkoutVisibility(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        visibility: "PUBLIC",
        workoutId: "workout-1",
      });
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledTimes(3);
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: workoutKeys.detail("workout-1"),
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: workoutKeys.listFamily() });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: workoutKeys.feedFamily() });
    expect(invalidateQueriesSpy).not.toHaveBeenCalledWith({ queryKey: workoutKeys.all });
  });
});
