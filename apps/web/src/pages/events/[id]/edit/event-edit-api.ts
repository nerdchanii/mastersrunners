import { api } from "@/lib/api-client";

export async function updateEvent(eventId: string, body: Record<string, unknown>) {
  await api.fetch(`/events/${eventId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
