import { CommentList } from "@/components/social/CommentList";

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-foreground">댓글</h2>
      <CommentList entityType="post" entityId={postId} />
    </div>
  );
}
