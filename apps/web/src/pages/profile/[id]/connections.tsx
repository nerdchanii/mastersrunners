import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";

import { LoadingPage } from "@/components/common/LoadingPage";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

interface FollowUser {
  id: string;
  name: string;
  profileImage: string | null;
  bio?: string | null;
  isFollowing?: boolean;
}

interface FollowRecord {
  follower?: FollowUser;
  following?: FollowUser;
}

type OwnTab = "followers" | "following" | "requests";

export default function ProfileConnectionsPage() {
  const params = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user: currentUser } = useAuth();
  const userId = params.id as string;
  const isOwnProfile = currentUser?.id === userId;
  const requestedTab = (searchParams.get("tab") as OwnTab | null) ?? "followers";
  const activeTab = isOwnProfile
    ? requestedTab
    : requestedTab === "following"
      ? "following"
      : "followers";

  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [requests, setRequests] = useState<FollowUser[]>([]);
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId || !currentUser) {
      return;
    }

    if (currentUser.id !== userId) {
      navigate(`/profile/${userId}`, { replace: true });
    }
  }, [currentUser, navigate, userId]);

  useEffect(() => {
    if (!userId || !currentUser || currentUser.id !== userId) return;

    const fetchConnections = async () => {
      setIsLoading(true);
      try {
        const [followersData, followingData, requestData] = await Promise.all([
          api.fetch<Array<FollowUser | FollowRecord>>(`/follow/${userId}/followers`),
          api.fetch<Array<FollowUser | FollowRecord>>(`/follow/${userId}/following`),
          api.fetch<Array<FollowUser | FollowRecord>>("/follow/requests"),
        ]);

        const followerItems = followersData.map((item) =>
          "follower" in item && item.follower ? item.follower : (item as FollowUser),
        );
        const followingItems = followingData.map((item) =>
          "following" in item && item.following ? item.following : (item as FollowUser),
        );
        const requestItems = requestData.map((item) =>
          "follower" in item && item.follower ? item.follower : (item as FollowUser),
        );

        setFollowers(followerItems);
        setFollowing(followingItems);
        setRequests(requestItems);

        const states: Record<string, boolean> = {};
        [...followerItems, ...followingItems].forEach((user) => {
          if (user.isFollowing !== undefined) {
            states[user.id] = user.isFollowing;
          }
        });
        followingItems.forEach((user) => {
          states[user.id] = true;
        });
        setFollowingStates(states);
      } catch (err) {
        console.error("Failed to fetch connections:", err);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchConnections();
  }, [currentUser, userId]);

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

  const handleRequest = async (targetId: string, action: "accept" | "reject") => {
    try {
      await api.fetch(`/follow/${targetId}/${action}`, { method: "POST" });
      setRequests((prev) => prev.filter((user) => user.id !== targetId));
      if (action === "accept") {
        setFollowers((prev) =>
          [requests.find((user) => user.id === targetId)!, ...prev].filter(Boolean),
        );
      }
    } catch (err) {
      console.error(`Failed to ${action} request:`, err);
    }
  };

  if (isLoading || !currentUser || currentUser.id !== userId) {
    return <LoadingPage />;
  }

  const currentItems =
    activeTab === "followers" ? followers : activeTab === "following" ? following : requests;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center gap-3 border-b py-4">
        <button
          onClick={() => navigate(-1)}
          className="rounded-full p-2 transition-colors hover:bg-accent"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="text-lg font-semibold">연결</h1>
      </div>

      <Tabs value={activeTab} onValueChange={(tab) => setSearchParams({ tab })} className="w-full">
        <TabsList variant="line" className="w-full justify-around border-b border-border/60 px-0">
          <TabsTrigger value="followers" className="flex-1 py-3">
            팔로워
          </TabsTrigger>
          <TabsTrigger value="following" className="flex-1 py-3">
            팔로잉
          </TabsTrigger>
          {isOwnProfile ? (
            <TabsTrigger value="requests" className="flex-1 py-3">
              요청
            </TabsTrigger>
          ) : null}
        </TabsList>
      </Tabs>

      <div className="py-4">
        {currentItems.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <p>
              {activeTab === "followers"
                ? "아직 팔로워가 없습니다."
                : activeTab === "following"
                  ? "아직 팔로잉하는 유저가 없습니다."
                  : "대기 중인 요청이 없습니다."}
            </p>
          </div>
        ) : (
          <ul className="space-y-1">
            {currentItems.map((user) => (
              <li
                key={user.id}
                className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-accent/50"
              >
                <Link to={`/profile/${user.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                  <UserAvatar user={user} size="default" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{user.name}</p>
                    {user.bio ? (
                      <p className="truncate text-xs text-muted-foreground">{user.bio}</p>
                    ) : null}
                  </div>
                </Link>

                {activeTab === "requests" ? (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRequest(user.id, "reject")}
                    >
                      거절
                    </Button>
                    <Button size="sm" onClick={() => handleRequest(user.id, "accept")}>
                      승인
                    </Button>
                  </div>
                ) : currentUser.id !== user.id ? (
                  <Button
                    size="sm"
                    variant={followingStates[user.id] ? "outline" : "default"}
                    onClick={() => handleFollowToggle(user.id)}
                    className="shrink-0"
                  >
                    {followingStates[user.id] ? "팔로잉" : "팔로우"}
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
