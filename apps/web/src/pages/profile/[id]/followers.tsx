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

interface FollowersResponse {
  items: FollowUser[];
  total: number;
}

export default function FollowersPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const userId = params.id as string;

  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!userId) return;

    const fetchFollowers = async () => {
      try {
        const data = await api.fetch<FollowersResponse | FollowUser[]>(
          `/follow/followers/${userId}`
        );
        const items = Array.isArray(data) ? data : (data as FollowersResponse).items ?? [];
        setFollowers(items);
        const states: Record<string, boolean> = {};
        items.forEach((u) => {
          if (u.isFollowing !== undefined) states[u.id] = u.isFollowing;
        });
        setFollowingStates(states);
      } catch (err) {
        console.error("Failed to fetch followers:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFollowers();
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
        <h1 className="text-lg font-semibold">팔로워</h1>
        <span className="text-sm text-muted-foreground ml-auto">{followers.length}명</span>
      </div>

      {followers.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>아직 팔로워가 없습니다.</p>
        </div>
      ) : (
        <ul className="space-y-1">
          {followers.map((follower) => (
            <li
              key={follower.id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors"
            >
              <Link to={`/profile/${follower.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                <UserAvatar user={follower} size="default" />
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{follower.name}</p>
                  {follower.bio && (
                    <p className="text-xs text-muted-foreground truncate">{follower.bio}</p>
                  )}
                </div>
              </Link>

              {currentUser && currentUser.id !== follower.id && (
                <Button
                  size="sm"
                  variant={followingStates[follower.id] ? "outline" : "default"}
                  onClick={() => handleFollowToggle(follower.id)}
                  className="flex-shrink-0"
                >
                  {followingStates[follower.id] ? "팔로잉" : "팔로우"}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
