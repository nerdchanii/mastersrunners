import { api } from "@/lib/api-client";

interface CrewInviteLinkResponse {
  path: string;
}

export async function fetchCrewInviteLink(crewId: string) {
  return api.fetch<CrewInviteLinkResponse>(`/crews/${crewId}/invite-link`);
}

export function resolveCrewInviteUrl(path: string) {
  if (typeof window === "undefined") {
    return path;
  }

  return new URL(path, window.location.origin).toString();
}
