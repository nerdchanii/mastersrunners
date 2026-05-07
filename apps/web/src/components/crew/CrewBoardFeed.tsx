import { Heart, MessageSquare, Pin } from "lucide-react";

import { TimeAgo } from "@/components/common/TimeAgo";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Board, BoardPostWithBoard } from "@/hooks/useCrewBoards";
import { useBoardPostFeeds } from "@/hooks/useCrewBoards";

import { CrewBoardComposerEntry } from "./CrewBoardComposerEntry";
import type { CrewBoardComposerNavigation } from "./useCrewBoardNavigation";

export function CrewBoardFeed({
  crewId,
  boards,
  defaultComposerBoard,
  announcementBoard,
  isAuthenticated,
  isAdmin,
  canOpenBoardPosts,
  composer,
  onRequireAuth,
  onSelectPost,
}: {
  crewId: string;
  boards: Board[] | undefined;
  defaultComposerBoard: Board | undefined;
  announcementBoard: Board | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  canOpenBoardPosts: boolean;
  composer: CrewBoardComposerNavigation;
  onRequireAuth: () => void;
  onSelectPost: (post: BoardPostWithBoard) => void;
}) {
  const { items, isLoading } = useBoardPostFeeds(crewId, boards);

  if (!boards || boards.length === 0) {
    return (
      <div className="border-t border-border/50 py-8 text-center text-muted-foreground">
        아직 게시판이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {defaultComposerBoard ? (
        <CrewBoardComposerEntry
          crewId={crewId}
          board={defaultComposerBoard}
          announcementBoard={announcementBoard}
          isAdmin={isAdmin}
          showForm={composer.showForm}
          onCancel={composer.closeCreateForm}
          onCreated={composer.closeCreateForm}
        />
      ) : null}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : items.length === 0 ? (
        <div className="border-t border-border/50 py-8 text-center text-muted-foreground">
          아직 글이 없습니다.
        </div>
      ) : (
        <BoardPostFeedList
          posts={items}
          canOpenBoardPosts={canOpenBoardPosts}
          isAuthenticated={isAuthenticated}
          onRequireAuth={onRequireAuth}
          onSelectPost={onSelectPost}
        />
      )}
    </div>
  );
}

function BoardPostFeedList({
  posts,
  canOpenBoardPosts,
  isAuthenticated,
  onRequireAuth,
  onSelectPost,
}: {
  posts: BoardPostWithBoard[];
  canOpenBoardPosts: boolean;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
  onSelectPost: (post: BoardPostWithBoard) => void;
}) {
  return (
    <div className="divide-y divide-border/50 border-t border-border/50">
      {posts.map((post) => {
        const canAttemptOpen = canOpenBoardPosts || !isAuthenticated;

        return (
          <article
            key={`${post.board.id}:${post.id}`}
            className={
              canAttemptOpen ? "cursor-pointer py-4 transition-colors hover:bg-accent/20" : "py-4"
            }
            onClick={() => {
              if (canOpenBoardPosts) {
                onSelectPost(post);
                return;
              }

              if (!isAuthenticated) {
                onRequireAuth();
              }
            }}
          >
            <div className="flex items-start gap-3">
              <UserAvatar user={post.author} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {post.board.type === "ANNOUNCEMENT" && (
                    <Badge variant="secondary" className="rounded-full px-2 py-0 text-[11px]">
                      공지
                    </Badge>
                  )}
                  {post.isPinned && <Pin className="size-3 text-primary" />}
                  <h3 className="truncate text-sm font-medium">{post.title}</h3>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{post.content}</p>
                <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{post.author.name}</span>
                  <TimeAgo date={post.createdAt} />
                  <span className="flex items-center gap-0.5">
                    <MessageSquare className="size-3" /> {post._count.comments}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Heart className="size-3" /> {post._count.likes}
                  </span>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
