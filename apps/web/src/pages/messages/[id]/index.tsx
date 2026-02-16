import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  deletedAt: string | null;
  createdAt: string;
  sender: { id: string; name: string; profileImage: string | null };
}

interface Conversation {
  id: string;
  type: "DIRECT";
  updatedAt: string;
  participants: Array<{
    userId: string;
    lastReadAt: string | null;
    user: { id: string; name: string; profileImage: string | null };
  }>;
}

interface ConversationDetailResponse {
  conversation: Conversation;
  messages: Message[];
  nextCursor: string | null;
}

export default function MessageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState("");

  const fetchConversation = async (cursor?: string | null) => {
    try {
      if (cursor) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);
      let path = `/conversations/${id}?limit=50`;
      if (cursor) path += `&cursor=${encodeURIComponent(cursor)}`;
      const data = await api.fetch<ConversationDetailResponse>(path);

      setConversation(data.conversation);
      if (cursor) {
        // Prepend older messages
        setMessages((prev) => [...data.messages, ...prev]);
      } else {
        setMessages(data.messages);
      }
      setNextCursor(data.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const markAsRead = async () => {
    try {
      await api.fetch(`/conversations/${id}/read`, { method: "PATCH" });
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchConversation();
      markAsRead();
    }
  }, [id]);

  useEffect(() => {
    // Scroll to bottom when messages change (but not when loading more)
    if (!loadingMore && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loadingMore]);

  const handleSend = async () => {
    if (!content.trim() || sending) return;

    const trimmedContent = content.trim();
    setContent("");
    setSending(true);

    try {
      const newMessage = await api.fetch<Message>(
        `/conversations/${id}/messages`,
        {
          method: "POST",
          body: JSON.stringify({ content: trimmedContent }),
        }
      );
      setMessages((prev) => [...prev, newMessage]);
      markAsRead();
    } catch (err) {
      setError(err instanceof Error ? err.message : "메시지 전송에 실패했습니다.");
      setContent(trimmedContent);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLoadMore = () => {
    if (nextCursor && !loadingMore) {
      fetchConversation(nextCursor);
    }
  };

  const getOtherUser = () => {
    if (!conversation) return null;
    return conversation.participants.find((p) => p.userId !== user?.id)?.user;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const shouldShowDateDivider = (currentMessage: Message, index: number) => {
    if (index === 0) return true;
    const prevMessage = messages[index - 1];
    const currentDate = new Date(currentMessage.createdAt).toDateString();
    const prevDate = new Date(prevMessage.createdAt).toDateString();
    return currentDate !== prevDate;
  };

  if (loading) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <div className="border-b border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
            >
              <Skeleton className="h-16 w-64 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => fetchConversation()}
            className="mt-2 text-red-600 hover:text-red-700 underline text-sm"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const otherUser = getOtherUser();

  if (!conversation || !otherUser) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
        <p className="text-gray-500">대화를 찾을 수 없습니다</p>
        <Button onClick={() => navigate("/messages")} className="mt-4">
          메시지 목록으로
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/messages")}
            className="shrink-0"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Button>
          <Avatar className="h-10 w-10">
            {otherUser.profileImage && (
              <AvatarImage src={otherUser.profileImage} alt={otherUser.name} />
            )}
            <AvatarFallback>{otherUser.name[0]}</AvatarFallback>
          </Avatar>
          <h2 className="font-semibold text-lg text-gray-900">
            {otherUser.name}
          </h2>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {nextCursor && (
          <div className="flex justify-center mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? "불러오는 중..." : "이전 메시지 보기"}
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((message, index) => {
            const isOwn = message.senderId === user?.id;
            const showDate = shouldShowDateDivider(message, index);

            return (
              <div key={message.id}>
                {showDate && (
                  <div className="flex justify-center my-4">
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {formatDate(message.createdAt)}
                    </span>
                  </div>
                )}

                <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`flex gap-2 max-w-[70%] ${
                      isOwn ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {!isOwn && (
                      <Avatar className="h-8 w-8 shrink-0">
                        {message.sender.profileImage && (
                          <AvatarImage
                            src={message.sender.profileImage}
                            alt={message.sender.name}
                          />
                        )}
                        <AvatarFallback>{message.sender.name[0]}</AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          message.deletedAt
                            ? "bg-gray-100 text-gray-500 italic"
                            : isOwn
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-900"
                        }`}
                      >
                        {message.deletedAt ? (
                          <p className="text-sm">삭제된 메시지입니다</p>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 mt-1">
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex gap-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="메시지를 입력하세요 (Shift+Enter로 줄바꿈)"
            className="min-h-[60px] max-h-[120px] resize-none"
            disabled={sending}
          />
          <Button
            onClick={handleSend}
            disabled={!content.trim() || sending}
            className="shrink-0 h-[60px] px-6"
          >
            {sending ? "전송 중..." : "전송"}
          </Button>
        </div>
      </div>
    </div>
  );
}
