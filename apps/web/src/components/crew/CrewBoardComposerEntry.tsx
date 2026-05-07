import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Board } from "@/hooks/useCrewBoards";
import { useCreatePost } from "@/hooks/useCrewBoards";

export function CrewBoardComposerEntry({
  crewId,
  board,
  announcementBoard,
  isAdmin,
  showForm,
  onCancel,
  onCreated,
}: {
  crewId: string;
  board: Board;
  announcementBoard: Board | null;
  isAdmin: boolean;
  showForm: boolean;
  onCancel: () => void;
  onCreated: (board: Board) => void;
}) {
  if (!showForm) {
    return null;
  }

  return (
    <BoardPostComposer
      crewId={crewId}
      board={board}
      announcementBoard={announcementBoard}
      isAdmin={isAdmin}
      onCancel={onCancel}
      onCreated={onCreated}
    />
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
