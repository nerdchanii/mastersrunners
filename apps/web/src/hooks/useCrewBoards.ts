import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

interface BoardAuthor {
  id: string;
  name: string;
  profileImage: string | null;
}

interface BoardComment {
  id: string;
  content: string;
  authorId: string;
  author: BoardAuthor;
  parentId: string | null;
  createdAt: string;
  replies?: BoardComment[];
}

export interface BoardPost {
  id: string;
  boardId: string;
  title: string;
  content: string;
  isPinned: boolean;
  authorId: string;
  author: BoardAuthor;
  createdAt: string;
  updatedAt: string;
  images: { id: string; url: string; order: number }[];
  comments?: BoardComment[];
  _count: { comments: number; likes: number };
  liked?: boolean;
}

export interface Board {
  id: string;
  crewId: string;
  name: string;
  type: string;
  writePermission: string;
  sortOrder: number;
  _count: { posts: number };
}

export const boardKeys = {
  boards: (crewId: string) => ["crews", crewId, "boards"] as const,
  posts: (crewId: string, boardId: string) => ["crews", crewId, "boards", boardId, "posts"] as const,
  post: (crewId: string, boardId: string, postId: string) =>
    ["crews", crewId, "boards", boardId, "posts", postId] as const,
};

export function useBoards(crewId: string) {
  return useQuery({
    queryKey: boardKeys.boards(crewId),
    queryFn: () => api.fetch<Board[]>(`/crews/${crewId}/boards`),
    enabled: !!crewId,
  });
}

export function useBoardPosts(crewId: string, boardId: string) {
  return useQuery({
    queryKey: boardKeys.posts(crewId, boardId),
    queryFn: () =>
      api.fetch<{ items: BoardPost[]; nextCursor: string | null }>(
        `/crews/${crewId}/boards/${boardId}/posts`,
      ),
    enabled: !!crewId && !!boardId,
  });
}

export function useBoardPost(crewId: string, boardId: string, postId: string) {
  return useQuery({
    queryKey: boardKeys.post(crewId, boardId, postId),
    queryFn: () =>
      api.fetch<BoardPost>(`/crews/${crewId}/boards/${boardId}/posts/${postId}`),
    enabled: !!crewId && !!boardId && !!postId,
  });
}

export function useCreateBoard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ crewId, data }: { crewId: string; data: { name: string; type?: string; writePermission?: string } }) =>
      api.fetch(`/crews/${crewId}/boards`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: (_r, { crewId }) => { qc.invalidateQueries({ queryKey: boardKeys.boards(crewId) }); },
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ crewId, boardId, data }: { crewId: string; boardId: string; data: { title: string; content: string } }) =>
      api.fetch(`/crews/${crewId}/boards/${boardId}/posts`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: (_r, { crewId, boardId }) => { qc.invalidateQueries({ queryKey: boardKeys.posts(crewId, boardId) }); },
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ crewId, boardId, postId }: { crewId: string; boardId: string; postId: string }) =>
      api.fetch(`/crews/${crewId}/boards/${boardId}/posts/${postId}`, { method: "DELETE" }),
    onSuccess: (_r, { crewId, boardId }) => { qc.invalidateQueries({ queryKey: boardKeys.posts(crewId, boardId) }); },
  });
}

export function useToggleLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ crewId, boardId, postId, liked }: { crewId: string; boardId: string; postId: string; liked: boolean }) =>
      api.fetch(`/crews/${crewId}/boards/${boardId}/posts/${postId}/like`, { method: liked ? "DELETE" : "POST" }),
    onSuccess: (_r, { crewId, boardId, postId }) => {
      qc.invalidateQueries({ queryKey: boardKeys.post(crewId, boardId, postId) });
      qc.invalidateQueries({ queryKey: boardKeys.posts(crewId, boardId) });
    },
  });
}

export function useCreateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ crewId, boardId, postId, content, parentId }: {
      crewId: string; boardId: string; postId: string; content: string; parentId?: string;
    }) =>
      api.fetch(`/crews/${crewId}/boards/${boardId}/posts/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content, parentId }),
      }),
    onSuccess: (_r, { crewId, boardId, postId }) => {
      qc.invalidateQueries({ queryKey: boardKeys.post(crewId, boardId, postId) });
    },
  });
}
