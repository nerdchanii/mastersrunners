import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";

import {
  cleanQueryParams,
  invalidateQueryKeys,
  type QueryParams,
  toQueryString,
} from "./query-key-utils";

export type CommentEntityType = "post" | "workout";
export type CommentListParams = QueryParams & { limit?: number };

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  parentId?: string | null;
  mentionedUserId?: string | null;
  user: {
    id: string;
    name: string;
    profileImage: string | null;
  };
  replies?: Comment[];
}

interface CommentsResponse {
  cursor: string | null;
  data: Comment[];
  hasMore: boolean;
}

interface CreateCommentInput {
  content: string;
  entityId: string;
  entityType: CommentEntityType;
  mentionedUserIds?: string[];
  parentId?: string;
}

interface DeleteCommentInput {
  commentId: string;
  entityId: string;
  entityType: CommentEntityType;
}

const DEFAULT_COMMENT_LIST_PARAMS = { limit: 50 };

export const commentKeys = {
  all: ["comments"] as const,
  entity: (entityType: CommentEntityType, entityId: string) =>
    [...commentKeys.all, entityType, entityId] as const,
  listFamily: (entityType: CommentEntityType, entityId: string) =>
    [...commentKeys.entity(entityType, entityId), "list"] as const,
  list: (entityType: CommentEntityType, entityId: string, params?: CommentListParams) =>
    [...commentKeys.listFamily(entityType, entityId), cleanQueryParams(params)] as const,
  detail: (entityType: CommentEntityType, entityId: string, commentId: string) =>
    [...commentKeys.entity(entityType, entityId), "detail", commentId] as const,
};

export const commentInvalidationTargets = {
  create: (entityType: CommentEntityType, entityId: string) => [
    commentKeys.listFamily(entityType, entityId),
  ],
  delete: (entityType: CommentEntityType, entityId: string) => [
    commentKeys.listFamily(entityType, entityId),
  ],
};

function commentCollectionEndpoint(entityType: CommentEntityType, entityId: string) {
  return entityType === "workout"
    ? `/workouts/${entityId}/comments`
    : `/posts/${entityId}/comments`;
}

function normalizeComments(data: CommentsResponse | Comment[]) {
  return Array.isArray(data) ? data : data.data;
}

export function useComments(
  entityType: CommentEntityType,
  entityId: string,
  params: CommentListParams = DEFAULT_COMMENT_LIST_PARAMS,
) {
  return useQuery({
    queryKey: commentKeys.list(entityType, entityId, params),
    queryFn: async () => {
      const data = await api.fetchSession<CommentsResponse | Comment[]>(
        `${commentCollectionEndpoint(entityType, entityId)}${toQueryString(params)}`,
      );
      return normalizeComments(data);
    },
    enabled: !!entityId,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      content,
      entityId,
      entityType,
      mentionedUserIds,
      parentId,
    }: CreateCommentInput) => {
      const body: Record<string, unknown> = { content };
      if (parentId) {
        body.parentId = parentId;
      }
      if (mentionedUserIds?.length) {
        if (entityType === "workout") {
          body.mentionedUserIds = mentionedUserIds;
        } else {
          body.mentionedUserId = mentionedUserIds[0];
        }
      }

      return api.fetch(commentCollectionEndpoint(entityType, entityId), {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    onSuccess: (_result, { entityId, entityType }) =>
      invalidateQueryKeys(queryClient, commentInvalidationTargets.create(entityType, entityId)),
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, entityId, entityType }: DeleteCommentInput) =>
      api.fetch(`${commentCollectionEndpoint(entityType, entityId)}/${commentId}`, {
        method: "DELETE",
      }),
    onSuccess: (_result, { entityId, entityType }) =>
      invalidateQueryKeys(queryClient, commentInvalidationTargets.delete(entityType, entityId)),
  });
}
