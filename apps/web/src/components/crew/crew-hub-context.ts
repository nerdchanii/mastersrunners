import type { ReactNode } from "react";
import { useOutletContext } from "react-router-dom";

export interface CrewHubMember {
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

export interface CrewHubDetail {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  profileImageUrl?: string | null;
  coverImageUrl?: string | null;
  isPublic: boolean;
  maxMembers: number | null;
  createdAt: string;
  creator: {
    id: string;
    name: string;
    profileImage: string | null;
  };
  members: CrewHubMember[];
  _count: {
    members: number;
  };
}

interface CrewHubOutletContext {
  activeMembers: CrewHubMember[];
  crew: CrewHubDetail;
  crewId: string;
  currentUserId?: string;
  currentUserRole: CrewHubMember["role"] | null;
  homeHero: ReactNode;
  isAuthenticated: boolean;
  isMember: boolean;
  isOwnerOrAdmin: boolean;
  onMembersUpdate: () => Promise<void>;
  openAuthGate: (title: string) => void;
}

export function useCrewHubContext() {
  return useOutletContext<CrewHubOutletContext>();
}
