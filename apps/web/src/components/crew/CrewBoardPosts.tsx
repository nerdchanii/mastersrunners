import { ArrowLeft, Heart, MessageSquare, Pin, Plus } from "lucide-react";

import { TimeAgo } from "@/components/common/TimeAgo";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Board, BoardPost } from "@/hooks/useCrewBoards";
import { useBoardPosts } from "@/hooks/useCrewBoards";

import { CrewBoardComposerEntry } from "./CrewBoardComposerEntry";
import type { CrewBoardComposerNavigation } from "./useCrewBoardNavigation";

export function CrewBoardPosts({
  crewId,
  board,
  isMember,
  isAdmin,
  hideBoardNavigation = false,
  hideBoardHeader = false,
  showInlineCreateAction = true,
  announcementBoard,
  composer,
  onBack,
  onSelectBoard,
  onSelectPost,
}: {
  crewId: string;
  board: Board;
  isMember: boolean;
  isAdmin: boolean;
  hideBoardNavigation?: boolean;
  hideBoardHeader?: boolean;
  showInlineCreateAction?: boolean;
  announcementBoard: Board | null;
  composer: CrewBoardComposerNavigation;
  onBack: () => void;
  onSelectBoard: (board: Board) => void;
  onSelectPost: (postId: string) => void;
}) {
  const { data, isLoading } = useBoardPosts(crewId, board.id);
  const canWrite = board.writePermission === "ALL_MEMBERS" ? isMember : isAdmin;

  return (
    <div className="space-y-4">
      {(!hideBoardHeader || (canWrite && showInlineCreateAction)) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!hideBoardNavigation && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                aria-label="게시판 목록으로 돌아가기"
              >
                <ArrowLeft className="size-4" />
              </Button>
            )}
            {!hideBoardHeader && <h2 className="text-lg font-semibold">{board.name}</h2>}
          </div>
          {canWrite && showInlineCreateAction && (
            <Button size="sm" onClick={composer.toggleCreateForm}>
              <Plus className="size-4 mr-1" />
              글쓰기
            </Button>
          )}
        </div>
      )}

      <CrewBoardComposerEntry
        crewId={crewId}
        board={board}
        announcementBoard={announcementBoard}
        isAdmin={isAdmin}
        showForm={composer.showForm}
        onCancel={composer.closeCreateForm}
        onCreated={(createdBoard) => {
          composer.closeCreateForm();
          if (createdBoard.id !== board.id) {
            onSelectBoard(createdBoard);
          }
        }}
      />

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : !data?.items?.length ? (
        <div className="border-t border-border/50 py-8 text-center text-muted-foreground">
          아직 글이 없습니다.
        </div>
      ) : (
        <BoardPostList posts={data.items} board={board} onSelectPost={onSelectPost} />
      )}
    </div>
  );
}

function BoardPostList({
  posts,
  board,
  onSelectPost,
}: {
  posts: BoardPost[];
  board: Board;
  onSelectPost: (postId: string) => void;
}) {
  return (
    <div className="divide-y divide-border/50 border-t border-border/50">
      {posts.map((post) => (
        <article
          key={post.id}
          className="cursor-pointer py-4 transition-colors hover:bg-accent/20"
          onClick={() => onSelectPost(post.id)}
        >
          <div className="flex items-start gap-3">
            <UserAvatar user={post.author} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {board.type === "ANNOUNCEMENT" && (
                  <Badge variant="secondary" className="rounded-full px-2 py-0 text-[11px]">
                    공지
                  </Badge>
                )}
                {post.isPinned && <Pin className="size-3 text-primary" />}
                <h3 className="font-medium text-sm truncate">{post.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{post.content}</p>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
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
      ))}
    </div>
  );
}
