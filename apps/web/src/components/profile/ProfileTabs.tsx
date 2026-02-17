import { Grid3x3, Activity, Users } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/common/EmptyState";
import { formatDistance, formatDuration, formatPace } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface User {
  id: string;
  name: string;
  profileImage: string | null;
}

interface Post {
  id: string;
  content: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  user: User;
}

interface Workout {
  id: string;
  distance: number;
  duration: number;
  pace: number;
  date: string;
  memo: string | null;
  workoutType?: {
    id: string;
    name: string;
  };
}

interface Crew {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  _count: {
    members: number;
  };
}

interface ProfileTabsProps {
  posts: Post[];
  workouts: Workout[];
  crews: Crew[];
  isLoading: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function ProfileTabs({
  posts,
  workouts,
  crews,
  isLoading,
  activeTab,
  onTabChange,
}: ProfileTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList variant="line" className="w-full justify-around border-b">
        <TabsTrigger value="posts" className="flex-1 gap-2">
          <Grid3x3 className="size-4" />
          <span className="hidden sm:inline">게시글</span>
        </TabsTrigger>
        <TabsTrigger value="workouts" className="flex-1 gap-2">
          <Activity className="size-4" />
          <span className="hidden sm:inline">워크아웃</span>
        </TabsTrigger>
        <TabsTrigger value="crews" className="flex-1 gap-2">
          <Users className="size-4" />
          <span className="hidden sm:inline">크루</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="posts" className="mt-6">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            로딩 중...
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            icon={Grid3x3}
            title="게시글이 없습니다"
            description="아직 작성한 게시글이 없습니다."
          />
        ) : (
          <div className="grid grid-cols-3 gap-1 sm:gap-2">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/posts/${post.id}`}
                className="aspect-square bg-muted rounded-sm overflow-hidden hover:opacity-80 transition-opacity group relative"
              >
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <p className="text-xs text-center line-clamp-4 text-foreground/80">
                    {post.content}
                  </p>
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs text-white">
                    {post.likesCount} 좋아요 · {post.commentsCount} 댓글
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="workouts" className="mt-6">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            로딩 중...
          </div>
        ) : workouts.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="워크아웃이 없습니다"
            description="아직 기록한 러닝 활동이 없습니다."
          />
        ) : (
          <div className="space-y-3">
            {workouts.map((workout) => (
              <Link
                key={workout.id}
                to={`/workouts/detail?id=${workout.id}`}
                className={cn(
                  "block rounded-lg border bg-card p-4",
                  "hover:bg-accent hover:border-accent-foreground/20 transition-colors"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">
                        {workout.workoutType?.name || "러닝"}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {new Date(workout.date).toLocaleDateString("ko-KR", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">거리</p>
                        <p className="font-semibold tabular-nums">
                          {formatDistance(workout.distance)} km
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">시간</p>
                        <p className="font-semibold tabular-nums">
                          {formatDuration(workout.duration)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">페이스</p>
                        <p className="font-semibold tabular-nums">
                          {formatPace(workout.pace)}/km
                        </p>
                      </div>
                    </div>

                    {workout.memo && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {workout.memo}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="crews" className="mt-6">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            로딩 중...
          </div>
        ) : crews.length === 0 ? (
          <EmptyState
            icon={Users}
            title="소속 크루가 없습니다"
            description="크루에 가입하여 함께 러닝을 즐겨보세요."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {crews.map((crew) => (
              <Link
                key={crew.id}
                to={`/crews/${crew.id}`}
                className={cn(
                  "block rounded-lg border bg-card p-4",
                  "hover:bg-accent hover:border-accent-foreground/20 transition-colors"
                )}
              >
                <div className="flex items-start gap-3">
                  {crew.imageUrl ? (
                    <img
                      src={crew.imageUrl}
                      alt={crew.name}
                      className="size-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="size-12 rounded-lg bg-muted flex items-center justify-center">
                      <Users className="size-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {crew.name}
                    </h3>
                    {crew.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {crew.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      멤버 {crew._count.members}명
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
