import { useState, useEffect } from "react";
import { Plus, X, Tag } from "lucide-react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { UserAvatar } from "@/components/common/UserAvatar";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

interface CrewTag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

interface TagWithMembers extends CrewTag {
  members: {
    id: string;
    user: {
      id: string;
      name: string;
      profileImage: string | null;
    };
  }[];
}

interface Member {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    profileImage: string | null;
  };
}

interface CrewTagManagerProps {
  crewId: string;
  isAdmin: boolean;
  members: Member[];
}

const TAG_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#84cc16", // lime
  "#10b981", // emerald
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
];

export default function CrewTagManager({ crewId, isAdmin, members }: CrewTagManagerProps) {
  const [tags, setTags] = useState<TagWithMembers[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CrewTag | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const fetchTags = async () => {
    setIsLoading(true);
    try {
      const data = await api.fetch<TagWithMembers[]>(`/crews/${crewId}/tags`);
      setTags(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load tags:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, [crewId]);

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    setIsSubmitting(true);
    try {
      await api.fetch(`/crews/${crewId}/tags`, {
        method: "POST",
        body: JSON.stringify({
          name: newTagName.trim(),
          color: newTagColor,
        }),
      });
      setNewTagName("");
      setNewTagColor(TAG_COLORS[0]);
      setShowCreateForm(false);
      fetchTags();
    } catch (err) {
      alert(err instanceof Error ? err.message : "태그 생성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTag = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      await api.fetch(`/crews/${crewId}/tags/${deleteTarget.id}`, {
        method: "DELETE",
      });
      setDeleteTarget(null);
      fetchTags();
    } catch (err) {
      alert(err instanceof Error ? err.message : "태그 삭제에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignTag = async (tagId: string, memberId: string) => {
    setIsSubmitting(true);
    try {
      await api.fetch(`/crews/${crewId}/tags/${tagId}/members/${memberId}`, {
        method: "POST",
      });
      fetchTags();
    } catch (err) {
      alert(err instanceof Error ? err.message : "태그 할당에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnassignTag = async (tagId: string, memberId: string) => {
    setIsSubmitting(true);
    try {
      await api.fetch(`/crews/${crewId}/tags/${tagId}/members/${memberId}`, {
        method: "DELETE",
      });
      fetchTags();
    } catch (err) {
      alert(err instanceof Error ? err.message : "태그 제거에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isAdmin && (
        <div className="flex justify-end">
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="size-4 mr-2" />
            태그 만들기
          </Button>
        </div>
      )}

      {showCreateForm && isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>새 태그 만들기</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTag} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="tagName" className="text-sm font-medium">
                  태그 이름
                </label>
                <Input
                  id="tagName"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="예: 리더, 초보, 베테랑"
                  maxLength={20}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">색상</label>
                <div className="flex gap-2">
                  {TAG_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewTagColor(color)}
                      className="w-8 h-8 rounded-full border-2 transition-all"
                      style={{
                        backgroundColor: color,
                        borderColor: newTagColor === color ? "#000" : "transparent",
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  취소
                </Button>
                <Button type="submit" disabled={isSubmitting || !newTagName.trim()}>
                  {isSubmitting ? "생성 중..." : "생성"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {tags.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="태그가 없습니다"
          description={isAdmin ? "태그를 만들어 멤버를 분류해보세요!" : "아직 생성된 태그가 없습니다."}
          actionLabel={isAdmin ? "태그 만들기" : undefined}
          onAction={isAdmin ? () => setShowCreateForm(true) : undefined}
        />
      ) : (
        <div className="space-y-4">
          {tags.map((tag) => (
            <Card key={tag.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge style={{ backgroundColor: tag.color, color: "#fff" }}>
                      {tag.name}
                    </Badge>
                    <CardDescription>
                      {tag.members.length}명
                    </CardDescription>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedTag(selectedTag === tag.id ? null : tag.id)}
                      >
                        {selectedTag === tag.id ? "닫기" : "멤버 추가"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteTarget(tag)}
                        disabled={isSubmitting}
                      >
                        <X className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                {selectedTag === tag.id && isAdmin && (
                  <div className="mb-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">멤버 선택</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {members
                        .filter((m) => !tag.members.some((tm) => tm.user.id === m.userId))
                        .map((member) => (
                          <button
                            key={member.userId}
                            onClick={() => handleAssignTag(tag.id, member.id)}
                            disabled={isSubmitting}
                            className="w-full flex items-center gap-2 p-2 hover:bg-background rounded-lg transition-colors text-left"
                          >
                            <UserAvatar user={member.user} size="sm" linkToProfile={false} />
                            <span className="text-sm">{member.user.name}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {tag.members.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    태그가 할당된 멤버가 없습니다
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {tag.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full"
                      >
                        <UserAvatar user={member.user} size="sm" linkToProfile={false} />
                        <span className="text-sm">{member.user.name}</span>
                        {isAdmin && (
                          <button
                            onClick={() => handleUnassignTag(tag.id, member.id)}
                            disabled={isSubmitting}
                            className="ml-1 hover:text-destructive transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDeleteTag}
        title="태그 삭제"
        description={`"${deleteTarget?.name}" 태그를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmLabel="삭제"
        variant="destructive"
        loading={isSubmitting}
      />
    </div>
  );
}
