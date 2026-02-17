import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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

  const handleLoadMore = () => {
    if (nextCursor && !loading) {
      fetchConversations(nextCursor);
    }
  };

  const getOtherUser = (conversation: Conversation) => {
    return conversation.participants.find((p) => p.userId !== user?.id)?.user;
  };

  const getLastMessage = (conversation: Conversation) => {
    return conversation.messages[0];
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return "방금";
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    if (diffInDays < 7) return `${diffInDays}일 전`;
    return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (initialLoading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">메시지</h1>
          <p className="text-gray-600 mt-2">러너들과 대화하세요</p>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-full" />
                </div>
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">메시지</h1>
          <p className="text-gray-600 mt-2">러너들과 대화하세요</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => fetchConversations()}
            className="mt-2 text-red-600 hover:text-red-700 underline text-sm"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!initialLoading && conversations.length === 0) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">메시지</h1>
          <p className="text-gray-600 mt-2">러너들과 대화하세요</p>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">아직 대화가 없습니다</p>
          <p className="text-gray-400 text-sm mt-2">
            다른 러너의 프로필에서 메시지를 보내보세요
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">메시지</h1>
        <p className="text-gray-600 mt-2">러너들과 대화하세요</p>
      </div>

      <div className="space-y-3">
        {conversations.map((conversation) => {
          const otherUser = getOtherUser(conversation);
          const lastMessage = getLastMessage(conversation);

          if (!otherUser) return null;

          return (
            <Card
              key={conversation.id}
              className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => navigate(`/messages/${conversation.id}`)}
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  {otherUser.profileImage && (
                    <AvatarImage src={otherUser.profileImage} alt={otherUser.name} />
                  )}
                  <AvatarFallback>{otherUser.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {otherUser.name}
                    </h3>
                    {lastMessage && (
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatRelativeTime(lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  {lastMessage && (
                    <p
                      className={`text-sm mt-1 ${
                        conversation.unreadCount > 0
                          ? "text-gray-900 font-medium"
                          : "text-gray-600"
                      }`}
                    >
                      {truncateText(lastMessage.content, 50)}
                    </p>
                  )}
                </div>
                {conversation.unreadCount > 0 && (
                  <Badge
                    variant="default"
                    className="bg-blue-600 text-white h-5 min-w-[20px] px-1.5 flex items-center justify-center"
                  >
                    {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                  </Badge>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {!loading && nextCursor && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleLoadMore}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            더보기
          </button>
        </div>
      )}

      {!loading && !nextCursor && conversations.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          더 이상 대화가 없습니다
        </div>
      )}
    </div>
  );
}
