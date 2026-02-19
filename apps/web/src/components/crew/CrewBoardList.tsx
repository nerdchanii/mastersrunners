import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/common/UserAvatar";
import { TimeAgo } from "@/components/common/TimeAgo";
import {
  MessageSquare,
  Heart,
  Pin,
  Plus,
  ArrowLeft,
  Send,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  useBoards,
  useBoardPosts,
  useBoardPost,
  useCreatePost,
  useToggleLike,
  useCreateComment,
  type Board,
  type BoardPost,
} from "@/hooks/useCrewBoards";

interface Props {
  crewId: string;
  isMember: boolean;
  isAdmin: boolean;
}

export default function CrewBoardList({ crewId, isMember, isAdmin }: Props) {
  const { data: boards, isLoading } = useBoards(crewId);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
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
        onBack={() => setSelectedBoard(null)}
        onSelectPost={setSelectedPost}
      />
    );
  }

  return (
    <div className="space-y-3">
      {(!boards || boards.length === 0) ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            아직 게시판이 없습니다.
          </CardContent>
        </Card>
      ) : (
        boards.map((board) => (
          <Card
            key={board.id}
            className="cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => setSelectedBoard(board)}
          >
            <CardContent className="py-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{board.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {board.type === "ANNOUNCEMENT" ? "공지" : board.type === "FREE" ? "자유" : "일반"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{board._count.posts}개 글</p>
              </div>
              <ChevronRight className="size-5 text-muted-foreground" />
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

function BoardPosts({
  crewId,
  board,
  isMember,
  isAdmin,
  onBack,
  onSelectPost,
}: {
  crewId: string;
  board: Board;
  isMember: boolean;
  isAdmin: boolean;
  onBack: () => void;
  onSelectPost: (postId: string) => void;
}) {
  const { data, isLoading } = useBoardPosts(crewId, board.id);
  const createPost = useCreatePost();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const canWrite =
    board.writePermission === "ALL_MEMBERS" ? isMember : isAdmin;

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;
    createPost.mutate(
      { crewId, boardId: board.id, data: { title: title.trim(), content: content.trim() } },
      {
        onSuccess: () => {
          toast.success("글이 작성되었습니다.");
          setTitle("");
          setContent("");
          setShowForm(false);
        },
        onError: () => toast.error("글 작성에 실패했습니다."),
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="size-4" />
          </Button>
          <h2 className="text-lg font-semibold">{board.name}</h2>
        </div>
        {canWrite && (
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="size-4 mr-1" />
            글쓰기
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardContent className="py-4 space-y-3">
            <input
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              placeholder="제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[100px]"
              placeholder="내용을 입력하세요..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>
                취소
              </Button>
              <Button size="sm" onClick={handleSubmit} disabled={createPost.isPending}>
                작성
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : !data?.items?.length ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            아직 글이 없습니다.
          </CardContent>
        </Card>
      ) : (
        data.items.map((post: BoardPost) => (
          <Card
            key={post.id}
            className="cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => onSelectPost(post.id)}
          >
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <UserAvatar
                  user={post.author}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {post.isPinned && <Pin className="size-3 text-primary" />}
                    <h3 className="font-medium text-sm truncate">{post.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {post.content}
                  </p>
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
            </CardContent>
          </Card>
        ))
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
  const toggleLike = useToggleLike();
  const createComment = useCreateComment();
  const [comment, setComment] = useState("");

  const handleLike = () => {
    if (!post) return;
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
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-3">
            <UserAvatar user={post.author} size="sm" linkToProfile />
            <div>
              <p className="font-medium text-sm">{post.author.name}</p>
              <TimeAgo date={post.createdAt} />
            </div>
          </div>
          <CardTitle>{post.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="whitespace-pre-wrap">{post.content}</p>

          {post.images && post.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {post.images.map((img) => (
                <img key={img.id} src={img.url} alt="" className="rounded-lg object-cover w-full" />
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 pt-2 border-t">
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
        </CardContent>
      </Card>

      {/* Comments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">댓글</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((c) => (
              <div key={c.id}>
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
            <div className="flex items-center gap-2 pt-2 border-t">
              <input
                className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                placeholder="댓글을 입력하세요..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleComment(); } }}
              />
              <Button size="icon" onClick={handleComment} disabled={!comment.trim()}>
                <Send className="size-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
