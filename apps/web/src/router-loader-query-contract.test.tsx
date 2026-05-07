import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { QueryClient } from "@tanstack/react-query";
import type { LoaderFunctionArgs } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { eventQueries } from "./hooks/useEvents";
import { eventDetailLoader } from "./router-loaders";

const sourceDirectory = path.dirname(fileURLToPath(import.meta.url));

async function readSource(relativePath: string) {
  return readFile(path.join(sourceDirectory, relativePath), "utf8");
}

describe("router loader query contract", () => {
  it("prefetches event detail through a domain query option with ensureQueryData", async () => {
    const eventDetail = { id: "event-1", title: "Seoul Marathon" };
    const detailQuery = eventQueries.detail("event-1");
    const detailSpy = vi.spyOn(eventQueries, "detail").mockReturnValue(detailQuery);
    const ensureQueryData = vi.fn().mockResolvedValue(eventDetail);
    const queryClient = { ensureQueryData } as unknown as QueryClient;

    const loader = eventDetailLoader(queryClient);
    const result = await loader({
      params: { id: "event-1" },
      request: new Request("https://masters.test/events/event-1"),
    } as unknown as LoaderFunctionArgs);

    expect(detailSpy).toHaveBeenCalledWith("event-1");
    expect(ensureQueryData).toHaveBeenCalledWith(detailQuery);
    expect(result).toBe(eventDetail);
  });

  it("keeps router loader source on query options, not direct api fetches", async () => {
    const routerSource = await readSource("router.tsx");
    const loaderSource = await readSource("router-loaders.ts");
    const contractSource = `${routerSource}\n${loaderSource}`;

    expect(routerSource).toMatch(/loader:\s*eventDetailLoader\(queryClient\)/);
    expect(contractSource).toContain("ensureQueryData");
    expect(contractSource).toContain("eventQueries.detail");
    expect(contractSource).not.toContain("@/lib/api-client");
    expect(contractSource).not.toMatch(/\bapi\.fetch\b/);
  });
});
