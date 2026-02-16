import { useState, useEffect } from "react";
import FeedCard from "@/components/feed/FeedCard";
import PostFeedCard from "@/components/feed/PostFeedCard";
import { api } from "@/lib/api-client";

interface PostFeedItem {
  id: string;
  content: string;
  visibility: string;
  hashtags: string[];
  createdAt: string;
  user: {
    id: string;
    name: string;
    profileImage: string | null;
  };
  _count: {
    likes: number;
    comments: number;
  };
  workouts: Array<{
    workout: {
      id: string;
      distance: number;
      duration: number;
      pace: number;
      date: string;
    };
  }>;
}

interface WorkoutFeedItem {
  id: string;
  distance: number;
  duration: number;
  pace: number;
  date: string;
  visibility: string;
  memo: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    profileImage: string | null;
  };
  _count: {
    likes: number;
    comments: number;
  };
}

interface PostFeedResponse {
  items: PostFeedItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface WorkoutFeedResponse {
  items: WorkoutFeedItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

type FeedTab = "posts" | "workouts";

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<FeedTab>("posts");

  const [postItems, setPostItems] = useState<PostFeedItem[]>([]);
  const [postNextCursor, setPostNextCursor] = useState<string | null>(null);
  const [postHasMore, setPostHasMore] = useState(true);
  const [postLoading, setPostLoading] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  const [workoutItems, setWorkoutItems] = useState<WorkoutFeedItem[]>([]);
  const [workoutNextCursor, setWorkoutNextCursor] = useState<string | null>(null);
  const [workoutHasMore, setWorkoutHasMore] = useState(true);
  const [workoutLoading, setWorkoutLoading] = useState(false);
  const [workoutError, setWorkoutError] = useState<string | null>(null);

  const fetchPostFeed = async (cursor?: string | null) => {
    try {
      setPostLoading(true);
      setPostError(null);
      let path = "/feed/posts?limit=10";
      if (cursor) path += `&cursor=${encodeURIComponent(cursor)}`;
      const data = await api.fetch<PostFeedResponse>(path);
      if (cursor) {
        setPostItems((prev) => [...prev, ...data.items]);
      } else {
        setPostItems(data.items);
      }
      setPostNextCursor(data.nextCursor);
      setPostHasMore(data.hasMore);
    } catch (err) {
      setPostError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setPostLoading(false);
    }
  };

  const fetchWorkoutFeed = async (cursor?: string | null) => {
    try {
      setWorkoutLoading(true);
      setWorkoutError(null);
      let path = "/feed/workouts?limit=10&excludeLinkedToPost=true";
      if (cursor) path += `&cursor=${encodeURIComponent(cursor)}`;
      const data = await api.fetch<WorkoutFeedResponse>(path);
      if (cursor) {
        setWorkoutItems((prev) => [...prev, ...data.items]);
      } else {
        setWorkoutItems(data.items);
      }
      setWorkoutNextCursor(data.nextCursor);
      setWorkoutHasMore(data.hasMore);
    } catch (err) {
      setWorkoutError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setWorkoutLoading(false);
    }
  };

  useEffect(() => {
    fetchPostFeed();
    fetchWorkoutFeed();
  }, []);

  const handleTabChange = (tab: FeedTab) => {
    setActiveTab(tab);
  };

  const handleLoadMore = () => {
    if (activeTab === "posts") {
      if (postNextCursor && !postLoading) fetchPostFeed(postNextCursor);
    } else {
      if (workoutNextCursor && !workoutLoading) fetchWorkoutFeed(workoutNextCursor);
    }
  };

  const currentItems = activeTab === "posts" ? postItems : workoutItems;
  const currentLoading = activeTab === "posts" ? postLoading : workoutLoading;
  const currentError = activeTab === "posts" ? postError : workoutError;
  const currentHasMore = activeTab === "posts" ? postHasMore : workoutHasMore;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">커뮤니티 피드</h1>
        <p className="text-gray-600 mt-2">마스터즈 러너들의 훈련 기록을 확인하세요</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => handleTabChange("posts")}
          className={`px-4 py-2 font-semibold transition-colors ${activeTab === "posts" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-gray-900"}`}
        >
          게시글
        </button>
        <button
          onClick={() => handleTabChange("workouts")}
          className={`px-4 py-2 font-semibold transition-colors ${activeTab === "workouts" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-gray-900"}`}
        >
          워크아웃
        </button>
      </div>

      {currentError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{currentError}</p>
          <button
            onClick={() => { activeTab === "posts" ? fetchPostFeed() : fetchWorkoutFeed(); }}
            className="mt-2 text-red-600 hover:text-red-700 underline text-sm"
          >
            다시 시도
          </button>
        </div>
      )}

      <div className="space-y-4">
        {activeTab === "posts"
          ? postItems.map((item) => <PostFeedCard key={item.id} post={item} />)
          : workoutItems.map((item) => <FeedCard key={item.id} workout={item} />)}
      </div>

      {currentLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {!currentLoading && currentHasMore && currentItems.length > 0 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleLoadMore}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            더보기
          </button>
        </div>
      )}

      {!currentLoading && !currentHasMore && currentItems.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          더 이상 {activeTab === "posts" ? "게시글이" : "워크아웃이"} 없습니다
        </div>
      )}

      {!currentLoading && currentItems.length === 0 && !currentError && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            아직 공유된 {activeTab === "posts" ? "게시글이" : "워크아웃이"} 없습니다
          </p>
          <p className="text-gray-400 text-sm mt-2">첫 번째로 기록을 공유해보세요!</p>
        </div>
      )}
    </div>
  );
}
