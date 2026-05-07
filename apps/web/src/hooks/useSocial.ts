import { type QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { type MouseEvent, useEffect, useRef, useState } from "react";

import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

import { invalidateQueryKeys } from "./query-key-utils";
import { postKeys } from "./usePosts";
import { workoutKeys } from "./useWorkouts";

export type SocialEntityType = "post" | "workout";

interface SocialInvalidationInput {
  entityId: string;
  entityType: SocialEntityType;
}

interface ToggleLikeInput {
  entityId: string;
  entityType: SocialEntityType;
  isLiked: boolean;
}

interface UseSocialLikeInteractionInput {
  entityId: string;
  entityType: SocialEntityType;
  initialCount?: number;
  initialLiked?: boolean;
  onError?: (error: unknown) => void;
  pending?: boolean;
}

interface LikeableCacheValue {
  id?: string;
  isLiked?: boolean;
  liked?: boolean;
  likeCount?: number;
  likesCount?: number;
  _count?: {
    comments?: number;
    likes: number;
  };
}

export const socialKeys = {
  all: ["social"] as const,
  entity: (entityType: SocialEntityType, entityId: string) =>
    [...socialKeys.all, entityType, entityId] as const,
  like: (entityType: SocialEntityType, entityId: string) =>
    [...socialKeys.entity(entityType, entityId), "like"] as const,
};

export const socialInvalidationTargets = {
  toggleLike: ({ entityId, entityType }: SocialInvalidationInput) => [
    socialEntityDetailKey(entityType, entityId),
    socialEntityFeedKey(entityType),
  ],
};

function socialEntityDetailKey(entityType: SocialEntityType, entityId: string) {
  return entityType === "workout" ? workoutKeys.detail(entityId) : postKeys.detail(entityId);
}

function socialEntityFeedKey(entityType: SocialEntityType) {
  return entityType === "workout" ? workoutKeys.feedFamily() : postKeys.feedFamily();
}

function socialEntityLikeEndpoint(entityType: SocialEntityType, entityId: string) {
  return entityType === "workout" ? `/workouts/${entityId}/like` : `/posts/${entityId}/like`;
}

function updateLikeableCache<TValue extends LikeableCacheValue>(
  current: TValue | undefined,
  wasLiked: boolean,
) {
  if (!current) {
    return current;
  }

  const delta = wasLiked ? -1 : 1;
  return {
    ...current,
    isLiked: current.isLiked === undefined ? current.isLiked : !wasLiked,
    liked: current.liked === undefined ? current.liked : !wasLiked,
    likeCount:
      typeof current.likeCount === "number"
        ? Math.max(0, current.likeCount + delta)
        : current.likeCount,
    likesCount:
      typeof current.likesCount === "number"
        ? Math.max(0, current.likesCount + delta)
        : current.likesCount,
    _count: current._count
      ? {
          ...current._count,
          likes: Math.max(0, current._count.likes + delta),
        }
      : current._count,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function updateLikeableEntityInCache(
  current: unknown,
  entityId: string,
  wasLiked: boolean,
): unknown {
  if (Array.isArray(current)) {
    return current.map((item) => updateLikeableEntityInCache(item, entityId, wasLiked));
  }

  if (!isRecord(current)) {
    return current;
  }

  if (Array.isArray(current.pages)) {
    return {
      ...current,
      pages: current.pages.map((page) => updateLikeableEntityInCache(page, entityId, wasLiked)),
    };
  }

  if (Array.isArray(current.items)) {
    return {
      ...current,
      items: current.items.map((item) => updateLikeableEntityInCache(item, entityId, wasLiked)),
    };
  }

  if (current.id === entityId) {
    return updateLikeableCache(current as LikeableCacheValue, wasLiked);
  }

  return current;
}

export function useToggleSocialLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ entityId, entityType, isLiked }: ToggleLikeInput) =>
      api.fetch(socialEntityLikeEndpoint(entityType, entityId), {
        method: isLiked ? "DELETE" : "POST",
      }),
    onMutate: async ({ entityId, entityType, isLiked }) => {
      const detailKey = socialEntityDetailKey(entityType, entityId);
      const feedKey = socialEntityFeedKey(entityType);

      await queryClient.cancelQueries({ queryKey: detailKey });
      await queryClient.cancelQueries({ queryKey: feedKey });

      const previousDetail = queryClient.getQueryData(detailKey);
      const previousFeeds = queryClient.getQueriesData({ queryKey: feedKey });

      queryClient.setQueryData(detailKey, (current: LikeableCacheValue | undefined) =>
        updateLikeableCache(current, isLiked),
      );
      queryClient.setQueriesData({ queryKey: feedKey }, (current) =>
        updateLikeableEntityInCache(current, entityId, isLiked),
      );

      return { detailKey, previousDetail, previousFeeds };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(context.detailKey, context.previousDetail);
      }
      context?.previousFeeds.forEach(([queryKey, value]: [QueryKey, unknown]) => {
        queryClient.setQueryData(queryKey, value);
      });
    },
    onSettled: (_result, _error, { entityId, entityType }) =>
      invalidateQueryKeys(
        queryClient,
        socialInvalidationTargets.toggleLike({
          entityId,
          entityType,
        }),
      ),
  });
}

export function useSocialLikeInteraction({
  entityId,
  entityType,
  initialCount = 0,
  initialLiked = false,
  onError,
  pending = false,
}: UseSocialLikeInteractionInput) {
  const { user } = useAuth();
  const toggleLike = useToggleSocialLike();
  const [displayLiked, setDisplayLiked] = useState(initialLiked);
  const [displayCount, setDisplayCount] = useState(initialCount);
  const [animating, setAnimating] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const currentEntityRef = useRef({ entityId, entityType });
  currentEntityRef.current = { entityId, entityType };
  const isPending = pending || toggleLike.isPending;

  useEffect(() => {
    setDisplayLiked(initialLiked);
    setDisplayCount(initialCount);
    setAnimating(false);
    setShowAuthDialog(false);
  }, [entityId, entityType, initialCount, initialLiked]);

  const toggle = async (event?: MouseEvent) => {
    event?.preventDefault();
    event?.stopPropagation();

    if (isPending) return;
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    const previousLiked = displayLiked;
    const previousCount = displayCount;
    const nextLiked = !displayLiked;
    const nextCount = Math.max(0, displayCount + (displayLiked ? -1 : 1));
    const requestEntity = { entityId, entityType };

    setDisplayLiked(nextLiked);
    setDisplayCount(nextCount);

    if (!displayLiked) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 400);
    }

    try {
      await toggleLike.mutateAsync({ entityId, entityType, isLiked: previousLiked });
    } catch (err) {
      if (
        currentEntityRef.current.entityId !== requestEntity.entityId ||
        currentEntityRef.current.entityType !== requestEntity.entityType
      ) {
        return;
      }

      setDisplayLiked(previousLiked);
      setDisplayCount(previousCount);
      onError?.(err);
    }
  };

  return {
    animating,
    displayCount,
    displayLiked,
    isPending,
    showAuthDialog,
    setShowAuthDialog,
    toggle,
  };
}
