import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api-client";
import { UserAvatar } from "@/components/common/UserAvatar";
import { LoadingPage } from "@/components/common/LoadingPage";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

interface FollowUser {
  id: string;
  name: string;
  profileImage: string | null;
  bio: string | null;
  isFollowing?: boolean;
}

interface FollowingResponse {
  items: FollowUser[];
  total: number;
}

export default function FollowingPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const userId = params.id as string;

  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!userId) return;

    const fetchFollowing = async () => {
      try {
        const data = await api.fetch<FollowingResponse | FollowUser[]>(
          `/follow/following/${userId}`
        );
        const items = Array.isArray(data) ? data : (data as FollowingResponse).items ?? [];
        setFollowing(items);
        const states: Record<string, boolean> = {};
        items.forEach((u) => {
          if (u.isFollowing !== undefined) states[u.id] = u.isFollowing;
        });
        setFollowingStates(states);
      } catch (err) {
        console.error("Failed to fetch following:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFollowing();
  }, [userId]);

  const handleFollowToggle = async (targetId: string) => {
    const isCurrentlyFollowing = followingStates[targetId];
    setFollowingStates((prev) => ({ ...prev, [targetId]: !isCurrentlyFollowing }));

    try {
      if (isCurrentlyFollowing) {
        await api.fetch(`/follow/${targetId}`, { method: "DELETE" });
      } else {
        await api.fetch(`/follow/${targetId}`, { method: "POST" });
      }
    } catch (err) {
      console.error("Failed to toggle follow:", err);
      setFollowingStates((prev) => ({ ...prev, [targetId]: isCurrentlyFollowing }));
    }
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 py-4 border-b mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-accent transition-colors"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="text-lg font-semibold">팔로잉</h1>
        <span className="text-sm text-muted-foreground ml-auto">{following.length}명</span>
      </div>

      {following.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>아직 팔로잉하는 유저가 없습니다.</p>
        </div>
      ) : (
        <ul className="space-y-1">
          {following.map((user) => (
            <li
              key={user.id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors"
            >
              <Link to={`/profile/${user.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                <UserAvatar user={user} size="default" />
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{user.name}</p>
                  {user.bio && (
                    <p className="text-xs text-muted-foreground truncate">{user.bio}</p>
                  )}
                </div>
              </Link>

              {currentUser && currentUser.id !== user.id && (
                <Button
                  size="sm"
                  variant={followingStates[user.id] ? "outline" : "default"}
                  onClick={() => handleFollowToggle(user.id)}
                  className="flex-shrink-0"
                >
                  {followingStates[user.id] ? "팔로잉" : "팔로우"}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
