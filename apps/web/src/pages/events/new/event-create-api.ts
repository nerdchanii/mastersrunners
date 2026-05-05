import { api } from "@/lib/api-client";

export async function createEvent(body: Record<string, unknown>) {
  return api.fetch<{ id: string }>("/events", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
