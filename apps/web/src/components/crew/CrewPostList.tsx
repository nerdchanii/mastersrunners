import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/common/UserAvatar";
import { TimeAgo } from "@/components/common/TimeAgo";
import { Plus, Heart, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useCrewPosts, useCreateCrewPost } from "@/hooks/useCrewPosts";

interface Props {
  crewId: string;
  isOwner: boolean;
}

export default function CrewPostList({ crewId, isOwner }: Props) {
  const { data, isLoading } = useCrewPosts(crewId);
  const createPost = useCreateCrewPost();
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (!content.trim()) return;
    createPost.mutate(
      { crewId, content: content.trim() },
      {
        onSuccess: () => {
          toast.success("게시물이 작성되었습니다.");
          setContent("");
          setShowForm(false);
        },
        onError: () => toast.error("게시물 작성에 실패했습니다."),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isOwner && (
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="size-4 mr-1" />
            크루 게시물 작성
          </Button>
        </div>
      )}

      {showForm && (
        <Card>
          <CardContent className="py-4 space-y-3">
            <textarea
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[100px]"
              placeholder="크루 소식을 공유하세요..."
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

      {!data?.items?.length ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            아직 크루 게시물이 없습니다.
          </CardContent>
        </Card>
      ) : (
        data.items.map((post) => (
          <Card key={post.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <UserAvatar user={post.user} size="sm" linkToProfile />
                <div>
                  <p className="text-sm font-medium">{post.user.name}</p>
                  <TimeAgo date={post.createdAt} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">{post.content}</p>
              {post.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {post.images.map((img) => (
                    <img key={img.id} src={img.imageUrl} alt="" className="rounded-lg object-cover w-full" />
                  ))}
                </div>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Heart className="size-4" /> {post._count.likes}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="size-4" /> {post._count.comments}
                </span>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
