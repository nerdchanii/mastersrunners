import { api } from "@/lib/api-client";

interface CrewMember {
  id: string;
  userId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  status: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    profileImage: string | null;
  };
}

interface BannedUser {
  id: string;
  userId: string;
  reason: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    profileImage: string | null;
  };
}

interface CrewDetail {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isPublic: boolean;
  maxMembers: number | null;
  createdAt: string;
  creator: {
    id: string;
    name: string;
    profileImage: string | null;
  };
  members: CrewMember[];
  _count: {
    members: number;
  };
}

export async function fetchCrewSettingsDetail(crewId: string) {
  return api.fetch<CrewDetail>(`/crews/${crewId}`);
}

export async function fetchCrewBans(crewId: string) {
  return api.fetch<BannedUser[]>(`/crews/${crewId}/bans`);
}

export async function updateCrewSettings(
  crewId: string,
  data: {
    name: string;
    description?: string;
    isPublic: boolean;
    maxMembers?: number;
  },
) {
  await api.fetch(`/crews/${crewId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteCrew(crewId: string) {
  await api.fetch(`/crews/${crewId}`, { method: "DELETE" });
}

export async function unbanCrewUser(crewId: string, userId: string) {
  await api.fetch(`/crews/${crewId}/bans/${userId}`, {
    method: "DELETE",
  });
}
