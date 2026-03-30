import { api } from "@/lib/api-client";

export async function updateChallenge(challengeId: string, body: Record<string, unknown>) {
  await api.fetch(`/challenges/${challengeId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
