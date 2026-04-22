import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useWorkoutEntry } from "./use-workout-entry";

const { fetchMock, navigateMock } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
  navigateMock: vi.fn(),
}));

vi.mock("@/lib/api-client", () => ({
  api: {
    fetch: fetchMock,
  },
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => navigateMock,
}));

describe("useWorkoutEntry", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    navigateMock.mockReset();
    vi.unstubAllGlobals();
  });

  it("uploads workout files through the dedicated source presign endpoint", async () => {
    fetchMock.mockImplementation((path: string) => {
      if (path === "/workouts/source/presign") {
        return Promise.resolve({
          uploadUrl: "https://upload.example.com/workout-file",
          key: "workouts/user-1/1710000000000-run.fit",
        });
      }

      if (path === "/uploads/parse") {
        return Promise.resolve({
          workout: {
            distance: 5000,
            duration: 1800,
            date: "2026-04-22T00:00:00.000Z",
            startedAt: "2026-04-22T00:00:00.000Z",
          },
          workoutFile: {},
        });
      }

      throw new Error(`Unexpected request: ${path}`);
    });

    const uploadFetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", uploadFetchMock);

    const { result } = renderHook(() => useWorkoutEntry());
    const file = new File(["fit-data"], "tempo-run.fit", {
      type: "application/octet-stream",
    });

    await act(async () => {
      result.current.handleFileChange({
        target: { files: [file] },
      } as never);
    });

    await waitFor(() => expect(result.current.workoutCreated).toBe(true));

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/workouts/source/presign", {
      method: "POST",
      body: JSON.stringify({
        filename: "tempo-run.fit",
        contentType: "application/octet-stream",
      }),
    });
    expect(fetchMock).not.toHaveBeenCalledWith("/uploads/presign", expect.anything());
    expect(uploadFetchMock).toHaveBeenCalledWith("https://upload.example.com/workout-file", {
      method: "PUT",
      body: file,
      headers: { "Content-Type": "application/octet-stream" },
    });
  });
});
