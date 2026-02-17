import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { TimeAgo } from "@/components/common/TimeAgo";

interface Conversation {
  id: string;
  type: "DIRECT";
  updatedAt: string;
  participants: Array<{
    userId: string;
    lastReadAt: string | null;
    user: { id: string; name: string; profileImage: string | null };
  }>;
  messages: Array<{
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
  }>;
  unreadCount: number;
}

interface ConversationsResponse {
  data: Conversation[];
  nextCursor: string | null;
}

export default function MessagesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = async (cursor?: string | null) => {
    try {
      setLoading(true);
      setError(null);
      let path = "/conversations?limit=20";
      if (cursor) path += `&cursor=${encodeURIComponent(cursor)}`;
      const data = await api.fetch<ConversationsResponse>(path);
      if (cursor) {
        setConversations((prev) => [...prev, ...(data?.data ?? [])]);
      } else {
        setConversations(data?.data ?? []);
      }
      setNextCursor(data?.nextCursor ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const getOtherUser = (conversation: Conversation) =>
    conversation.participants.find((p) => p.userId !== user?.id)?.user;

  const getLastMessage = (conversation: Conversation) => conversation.messages[0];

  const truncate = (text: string, max: number) =>
    text.length <= max ? text : text.substring(0, max) + "...";

  if (initialLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <PageHeader title="메시지" description="러너들과 대화하세요" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <PageHeader title="메시지" description="러너들과 대화하세요" />
        <Card className="p-6 border-destructive/30">
          <p className="text-destructive">{error}</p>
          <Button onClick={() => fetchConversations()} variant="outline" className="mt-3" size="sm">
            다시 시도
          </Button>
        </Card>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <PageHeader title="메시지" description="러너들과 대화하세요" />
        <EmptyState
          icon={MessageCircle}
          title="아직 대화가 없습니다"
          description="다른 러너의 프로필에서 메시지를 보내보세요"
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader title="메시지" description="러너들과 대화하세요" />

      <div className="space-y-2">
        {conversations.map((conversation) => {
          const otherUser = getOtherUser(conversation);
          const lastMessage = getLastMessage(conversation);
          if (!otherUser) return null;

          return (
            <Card
              key={conversation.id}
              className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => navigate(`/messages/${conversation.id}`)}
            >
              <div className="flex items-start gap-3">
                <Avatar className="size-12">
                  {otherUser.profileImage && (
                    <AvatarImage src={otherUser.profileImage} alt={otherUser.name} />
                  )}
                  <AvatarFallback>{otherUser.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold truncate">{otherUser.name}</h3>
                    {lastMessage && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        <TimeAgo date={lastMessage.createdAt} />
                      </span>
                    )}
                  </div>
                  {lastMessage && (
                    <p className={`text-sm mt-0.5 ${conversation.unreadCount > 0 ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                      {truncate(lastMessage.content, 50)}
                    </p>
                  )}
                </div>
                {conversation.unreadCount > 0 && (
                  <Badge className="min-w-[20px] h-5 px-1.5 text-[10px] flex items-center justify-center rounded-full">
                    {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                  </Badge>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {loading && (
        <div className="flex justify-center py-4">
          <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && nextCursor && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => fetchConversations(nextCursor)}>
            더보기
          </Button>
        </div>
      )}
    </div>
  );
}
