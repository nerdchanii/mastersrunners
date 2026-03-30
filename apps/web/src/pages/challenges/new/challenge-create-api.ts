import { api } from "@/lib/api-client";

export async function createChallenge(body: Record<string, unknown>) {
  return api.fetch<{ id: string }>("/challenges", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
