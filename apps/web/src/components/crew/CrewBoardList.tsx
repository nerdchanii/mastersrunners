import { ArrowLeft, Heart, MessageSquare, Pin, Plus, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AuthGateDialog } from "@/components/common/AuthGateDialog";
import { TimeAgo } from "@/components/common/TimeAgo";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  type Board,
  type BoardPost,
  type BoardPostWithBoard,
  useBoardPost,
  useBoardPostFeeds,
  useBoardPosts,
  useBoards,
  useCreateComment,
  useCreatePost,
  useToggleLike,
} from "@/hooks/useCrewBoards";
import { useAuth } from "@/lib/auth-context";

interface Props {
  crewId: string;
  canOpenBoardPosts: boolean;
  isAuthenticated: boolean;
  isMember: boolean;
  isAdmin: boolean;
  onRequireAuth: () => void;
  defaultSelectedBoardId?: string;
  defaultSelectedPostId?: string;
  defaultSelectedBoardType?: string;
  composerDefaultBoardType?: string;
  allowedBoardTypes?: string[];
  routedBoardId?: string;
  routedPostId?: string;
  composerNonce?: number;
  hideBoardHeader?: boolean;
  showInlineCreateAction?: boolean;
  isActive?: boolean;
  onCloseRoutedPost?: () => void;
  onSelectRoutedPost?: (board: Board, postId: string) => void;
  onComposerHandled?: () => void;
}

export default function CrewBoardList({
  crewId,
  canOpenBoardPosts,
  isAuthenticated,
  isMember,
  isAdmin,
  onRequireAuth,
  defaultSelectedBoardId,
  defaultSelectedPostId,
  defaultSelectedBoardType,
  composerDefaultBoardType,
  allowedBoardTypes,
  routedBoardId,
  routedPostId,
  composerNonce = 0,
  hideBoardHeader = false,
  showInlineCreateAction = true,
  isActive = true,
  onCloseRoutedPost,
  onSelectRoutedPost,
  onComposerHandled,
}: Props) {
  const { data: boards, isLoading } = useBoards(crewId);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const visibleBoards = allowedBoardTypes?.length
    ? boards?.filter((board) => allowedBoardTypes.includes(board.type))
    : boards;
  const announcementBoard = visibleBoards?.find((item) => item.type === "ANNOUNCEMENT") ?? null;
  const defaultComposerBoard =
    visibleBoards?.find((item) => item.type === composerDefaultBoardType) ?? visibleBoards?.[0];
  const routedPostBoard = routedBoardId
    ? visibleBoards?.find((item) => item.id === routedBoardId)
    : undefined;

  useEffect(() => {
    if (!visibleBoards || selectedBoard) {
      return;
    }

    const board =
      visibleBoards.find((item) => item.id === defaultSelectedBoardId) ??
      visibleBoards.find((item) => item.type === defaultSelectedBoardType);
    if (!board) {
      return;
    }

    setSelectedBoard(board);
    if (defaultSelectedPostId) {
      setSelectedPost(defaultSelectedPostId);
    }
  }, [
    visibleBoards,
    defaultSelectedBoardId,
    defaultSelectedBoardType,
    defaultSelectedPostId,
    selectedBoard,
  ]);

  useEffect(() => {
    if (!isActive || !composerNonce || !defaultSelectedBoardId || selectedBoard) {
      return;
    }

    const board = visibleBoards?.find((item) => item.id === defaultSelectedBoardId);
    if (board) {
      setSelectedBoard(board);
    }
  }, [composerNonce, defaultSelectedBoardId, isActive, selectedBoard, visibleBoards]);

  const openPost = (board: Board, postId: string) => {
    if (onSelectRoutedPost) {
      onSelectRoutedPost(board, postId);
      return;
    }

    setSelectedBoard(board);
    setSelectedPost(postId);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (routedPostId && routedPostBoard) {
    return (
      <PostDetail
        crewId={crewId}
        board={routedPostBoard}
        postId={routedPostId}
        isMember={isMember}
        onBack={
          onCloseRoutedPost ??
          (() => {
            setSelectedPost(null);
            setSelectedBoard(null);
          })
        }
      />
    );
  }

  if (selectedPost && selectedBoard) {
    return (
      <PostDetail
        crewId={crewId}
        board={selectedBoard}
        postId={selectedPost}
        isMember={isMember}
        onBack={() => setSelectedPost(null)}
      />
    );
  }

  if (selectedBoard) {
    return (
      <BoardPosts
        crewId={crewId}
        board={selectedBoard}
        isMember={isMember}
        isAdmin={isAdmin}
        isActive={isActive}
        hideBoardNavigation={!!defaultSelectedBoardId || !!defaultSelectedBoardType}
        hideBoardHeader={hideBoardHeader}
        showInlineCreateAction={showInlineCreateAction}
        composerNonce={composerNonce}
        announcementBoard={announcementBoard}
        onComposerHandled={onComposerHandled}
        onBack={() => setSelectedBoard(null)}
        onSelectBoard={setSelectedBoard}
        onSelectPost={(postId) => openPost(selectedBoard, postId)}
      />
    );
  }

  return (
    <BoardFeed
      crewId={crewId}
      boards={visibleBoards}
      defaultComposerBoard={defaultComposerBoard}
      announcementBoard={announcementBoard}
      isAuthenticated={isAuthenticated}
      isMember={isMember}
      isAdmin={isAdmin}
      canOpenBoardPosts={canOpenBoardPosts}
      isActive={isActive}
      composerNonce={composerNonce}
      onComposerHandled={onComposerHandled}
      onRequireAuth={onRequireAuth}
      onSelectPost={(post) => openPost(post.board, post.id)}
    />
  );
}

function BoardFeed({
  crewId,
  boards,
  defaultComposerBoard,
  announcementBoard,
  isAuthenticated,
  isMember,
  isAdmin,
  canOpenBoardPosts,
  isActive = true,
  composerNonce = 0,
  onComposerHandled,
  onRequireAuth,
  onSelectPost,
}: {
  crewId: string;
  boards: Board[] | undefined;
  defaultComposerBoard: Board | undefined;
  announcementBoard: Board | null;
  isAuthenticated: boolean;
  isMember: boolean;
  isAdmin: boolean;
  canOpenBoardPosts: boolean;
  isActive?: boolean;
  composerNonce?: number;
  onComposerHandled?: () => void;
  onRequireAuth: () => void;
  onSelectPost: (post: BoardPostWithBoard) => void;
}) {
  const { items, isLoading } = useBoardPostFeeds(crewId, boards);
  const [showForm, setShowForm] = useState(false);

  const canWrite = !!defaultComposerBoard && (isMember || isAdmin);

  useEffect(() => {
    if (!isActive || !composerNonce || !canWrite) {
      return;
    }
    setShowForm(true);
    onComposerHandled?.();
  }, [composerNonce, canWrite, isActive, onComposerHandled]);

  useEffect(() => {
    if (isActive) {
      return;
    }
    setShowForm(false);
  }, [isActive]);

  const closeCreateForm = () => {
    setShowForm(false);
  };

  if (!boards || boards.length === 0) {
    return (
      <div className="border-t border-border/50 py-8 text-center text-muted-foreground">
        아직 게시판이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showForm && defaultComposerBoard && (
        <BoardPostComposer
          crewId={crewId}
          board={defaultComposerBoard}
          announcementBoard={announcementBoard}
          isAdmin={isAdmin}
          onCancel={closeCreateForm}
          onCreated={() => setShowForm(false)}
        />
      )}

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

export function BoardPostComposer({
  crewId,
  board,
  announcementBoard,
  isAdmin,
  onCancel,
  onCreated,
}: {
  crewId: string;
  board: Board;
  announcementBoard: Board | null;
  isAdmin: boolean;
  onCancel: () => void;
  onCreated: (board: Board) => void;
}) {
  const createPost = useCreatePost();
  const [isAnnouncementPost, setIsAnnouncementPost] = useState(board.type === "ANNOUNCEMENT");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const canWriteAnnouncement = isAdmin && !!announcementBoard;
  const targetBoard = isAnnouncementPost && announcementBoard ? announcementBoard : board;

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;
    createPost.mutate(
      { crewId, boardId: targetBoard.id, data: { title: title.trim(), content: content.trim() } },
      {
        onSuccess: () => {
          toast.success(
            targetBoard.type === "ANNOUNCEMENT"
              ? "공지사항이 작성되었습니다."
              : "글이 작성되었습니다.",
          );
          setTitle("");
          setContent("");
          onCreated(targetBoard);
        },
        onError: () => toast.error("글 작성에 실패했습니다."),
      },
    );
  };

  return (
    <section className="space-y-3 border-t border-border/50 pt-4">
      {canWriteAnnouncement && (
        <label className="flex cursor-pointer items-center gap-3 rounded-md border border-border/50 bg-muted/20 p-3 text-sm font-medium">
          <Checkbox
            checked={isAnnouncementPost}
            onCheckedChange={(checked) => setIsAnnouncementPost(checked === true)}
          />
          공지
        </label>
      )}
      <Input placeholder="제목" value={title} onChange={(e) => setTitle(e.target.value)} />
      <Textarea
        className="min-h-[120px]"
        placeholder="크루 멤버가 바로 이해할 수 있게 짧게 적어주세요."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>
          취소
        </Button>
        <Button size="sm" onClick={handleSubmit} disabled={createPost.isPending}>
          작성
        </Button>
      </div>
    </section>
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

function BoardPosts({
  crewId,
  board,
  isMember,
  isAdmin,
  isActive = true,
  hideBoardNavigation = false,
  hideBoardHeader = false,
  showInlineCreateAction = true,
  composerNonce = 0,
  announcementBoard,
  onComposerHandled,
  onBack,
  onSelectBoard,
  onSelectPost,
}: {
  crewId: string;
  board: Board;
  isMember: boolean;
  isAdmin: boolean;
  isActive?: boolean;
  hideBoardNavigation?: boolean;
  hideBoardHeader?: boolean;
  showInlineCreateAction?: boolean;
  composerNonce?: number;
  announcementBoard: Board | null;
  onComposerHandled?: () => void;
  onBack: () => void;
  onSelectBoard: (board: Board) => void;
  onSelectPost: (postId: string) => void;
}) {
  const { data, isLoading } = useBoardPosts(crewId, board.id);
  const [showForm, setShowForm] = useState(false);

  const canWrite = board.writePermission === "ALL_MEMBERS" ? isMember : isAdmin;

  useEffect(() => {
    if (!isActive || !composerNonce || !canWrite) {
      return;
    }
    setShowForm(true);
    onComposerHandled?.();
  }, [composerNonce, canWrite, isActive, onComposerHandled]);

  useEffect(() => {
    if (isActive) {
      return;
    }
    setShowForm(false);
  }, [isActive]);

  return (
    <div className="space-y-4">
      {(!hideBoardHeader || (canWrite && showInlineCreateAction)) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!hideBoardNavigation && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="size-4" />
              </Button>
            )}
            {!hideBoardHeader && <h2 className="text-lg font-semibold">{board.name}</h2>}
          </div>
          {canWrite && showInlineCreateAction && (
            <Button size="sm" onClick={() => setShowForm(!showForm)}>
              <Plus className="size-4 mr-1" />
              글쓰기
            </Button>
          )}
        </div>
      )}

      {showForm && (
        <BoardPostComposer
          crewId={crewId}
          board={board}
          announcementBoard={announcementBoard}
          isAdmin={isAdmin}
          onCancel={() => setShowForm(false)}
          onCreated={(createdBoard) => {
            setShowForm(false);
            if (createdBoard.id !== board.id) {
              onSelectBoard(createdBoard);
            }
          }}
        />
      )}

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
        <div className="divide-y divide-border/50 border-t border-border/50">
          {data.items.map((post: BoardPost) => (
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
      )}
    </div>
  );
}

function PostDetail({
  crewId,
  board,
  postId,
  isMember,
  onBack,
}: {
  crewId: string;
  board: Board;
  postId: string;
  isMember: boolean;
  onBack: () => void;
}) {
  const { data: post, isLoading } = useBoardPost(crewId, board.id, postId);
  const { user } = useAuth();
  const toggleLike = useToggleLike();
  const createComment = useCreateComment();
  const [comment, setComment] = useState("");
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const nextPath =
    typeof window === "undefined"
      ? `/crews/${crewId}`
      : `${window.location.pathname}${window.location.search}${window.location.hash}`;

  const handleLike = () => {
    if (!post) return;
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    toggleLike.mutate({ crewId, boardId: board.id, postId, liked: !!post.liked });
  };

  const handleComment = () => {
    if (!comment.trim()) return;
    createComment.mutate(
      { crewId, boardId: board.id, postId, content: comment.trim() },
      {
        onSuccess: () => {
          setComment("");
          toast.success("댓글이 작성되었습니다.");
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!post) {
    return <p className="text-muted-foreground">글을 찾을 수 없습니다.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="size-4" />
        </Button>
        <h2 className="text-lg font-semibold">{board.name}</h2>
        {board.type === "ANNOUNCEMENT" && (
          <Badge variant="secondary" className="rounded-full px-2 py-0 text-[11px]">
            공지
          </Badge>
        )}
      </div>

      <article className="space-y-4 border-t border-border/50 pt-4">
        <div className="flex items-center gap-3">
          <UserAvatar user={post.author} size="sm" linkToProfile />
          <div>
            <p className="font-medium text-sm">{post.author.name}</p>
            <TimeAgo date={post.createdAt} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {board.type === "ANNOUNCEMENT" && (
            <Badge variant="secondary" className="rounded-full px-2 py-0 text-[11px]">
              공지
            </Badge>
          )}
          <h3 className="text-xl font-semibold">{post.title}</h3>
        </div>
        <div className="space-y-4">
          <p className="whitespace-pre-wrap">{post.content}</p>

          {post.images && post.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {post.images.map((img) => (
                <img key={img.id} src={img.url} alt="" className="rounded-lg object-cover w-full" />
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 border-t border-border/50 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={post.liked ? "text-red-500" : ""}
            >
              <Heart className={`size-4 mr-1 ${post.liked ? "fill-current" : ""}`} />
              {post._count.likes}
            </Button>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <MessageSquare className="size-4" />
              {post._count.comments}
            </span>
          </div>
        </div>
      </article>

      {/* Comments */}
      <section className="space-y-4 border-t border-border/50 pt-4">
        <h3 className="text-base font-semibold">댓글</h3>
        <div className="space-y-4">
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((c) => (
              <div key={c.id} className="border-b border-border/40 pb-4 last:border-0">
                <div className="flex items-start gap-2">
                  <UserAvatar user={c.author} size="sm" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{c.author.name}</span>
                      <TimeAgo date={c.createdAt} />
                    </div>
                    <p className="text-sm mt-0.5">{c.content}</p>
                  </div>
                </div>
                {c.replies && c.replies.length > 0 && (
                  <div className="ml-8 mt-2 space-y-2 border-l-2 pl-3">
                    {c.replies.map((r) => (
                      <div key={r.id} className="flex items-start gap-2">
                        <UserAvatar user={r.author} size="sm" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{r.author.name}</span>
                            <TimeAgo date={r.createdAt} />
                          </div>
                          <p className="text-sm mt-0.5">{r.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">아직 댓글이 없습니다.</p>
          )}

          {isMember && (
            <div className="flex items-center gap-2 border-t border-border/50 pt-2">
              <Input
                className="flex-1"
                placeholder="댓글 남기기"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleComment();
                  }
                }}
              />
              <Button size="icon" onClick={handleComment} disabled={!comment.trim()}>
                <Send className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </section>

      <AuthGateDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        nextPath={nextPath}
        title="반응 남기기"
      />
    </div>
  );
}
