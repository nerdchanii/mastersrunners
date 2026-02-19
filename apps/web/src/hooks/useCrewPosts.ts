import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

interface CrewPost {
  id: string;
  userId: string;
  crewId: string;
  content: string;
  visibility: string;
  createdAt: string;
  user: { id: string; name: string; profileImage: string | null };
  images: { id: string; imageUrl: string; sortOrder: number }[];
  _count: { likes: number; comments: number };
}

interface CrewProfile {
  crew: {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    coverImageUrl: string | null;
    location: string | null;
    region: string | null;
    subRegion: string | null;
    creator: { id: string; name: string; profileImage: string | null };
    _count: { members: number; activities: number; boards: number };
  };
  recentPosts: CrewPost[];
  upcomingActivities: { id: string; title: string; activityDate: string; location: string | null; status: string }[];
}

export const crewPostKeys = {
  posts: (crewId: string) => ["crews", crewId, "posts"] as const,
  profile: (crewId: string) => ["crews", crewId, "profile"] as const,
};

export function useCrewPosts(crewId: string, cursor?: string) {
  return useQuery({
    queryKey: [...crewPostKeys.posts(crewId), cursor],
    queryFn: () =>
      api.fetch<{ items: CrewPost[]; nextCursor: string | null }>(
        `/crews/${crewId}/posts${cursor ? `?cursor=${cursor}` : ""}`
      ),
    enabled: !!crewId,
  });
}

export function useCrewProfile(crewId: string) {
  return useQuery({
    queryKey: crewPostKeys.profile(crewId),
    queryFn: () => api.fetch<CrewProfile>(`/crews/${crewId}/profile`),
    enabled: !!crewId,
  });
}

export function useCreateCrewPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ crewId, content, visibility }: { crewId: string; content: string; visibility?: string }) =>
      api.fetch(`/crews/${crewId}/posts`, {
        method: "POST",
        body: JSON.stringify({ content, visibility }),
      }),
    onSuccess: (_r, { crewId }) => {
      qc.invalidateQueries({ queryKey: crewPostKeys.posts(crewId) });
      qc.invalidateQueries({ queryKey: crewPostKeys.profile(crewId) });
    },
  });
}
