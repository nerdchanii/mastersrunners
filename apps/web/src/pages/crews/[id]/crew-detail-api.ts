import { api } from "@/lib/api-client";

interface CrewMember {
  id: string;
  userId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  status: "ACTIVE" | "PENDING" | "LEFT";
  joinedAt: string;
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
  profileImageUrl?: string | null;
  coverImageUrl?: string | null;
  location?: string | null;
  region?: string | null;
  subRegion?: string | null;
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

export async function fetchCrewDetail(crewId: string) {
  return api.fetch<CrewDetail>(`/crews/${crewId}`);
}

export async function joinCrew(crewId: string) {
  await api.fetch(`/crews/${crewId}/join`, { method: "POST" });
}

export async function leaveCrew(crewId: string) {
  await api.fetch(`/crews/${crewId}/leave`, { method: "DELETE" });
}
