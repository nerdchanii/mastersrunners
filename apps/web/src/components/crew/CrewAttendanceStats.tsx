import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/common/UserAvatar";
import { BarChart3, TrendingUp, Trophy } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useCrewAttendanceStats } from "@/hooks/useAttendanceStats";

interface Props {
  crewId: string;
}

export default function CrewAttendanceStats({ crewId }: Props) {
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const { data, isLoading } = useCrewAttendanceStats(crewId, { type: typeFilter });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          출석 데이터가 없습니다.
        </CardContent>
      </Card>
    );
  }

  const chartData = data.activities
    .slice(0, 10)
    .reverse()
    .map((a) => ({
      name: a.title.length > 8 ? a.title.slice(0, 8) + "…" : a.title,
      출석률: a.rate,
      체크인: a.checkedIn,
      불참: a.noShow,
    }));

  return (
    <div className="space-y-6">
      {/* Type filter */}
      <div className="flex items-center gap-2">
        <Badge
          variant={!typeFilter ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setTypeFilter(undefined)}
        >
          전체
        </Badge>
        <Badge
          variant={typeFilter === "OFFICIAL" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setTypeFilter("OFFICIAL")}
        >
          공식
        </Badge>
        <Badge
          variant={typeFilter === "POP_UP" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setTypeFilter("POP_UP")}
        >
          번개
        </Badge>
      </div>

      {/* Overall rate card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="size-5" />
            전체 출석률
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{data.overallRate}%</span>
            <span className="text-muted-foreground text-sm">
              ({data.activities.length}개 활동 기준)
            </span>
          </div>
          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${data.overallRate}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Activity chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="size-5" />
              활동별 출석 현황
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    className="fill-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    className="fill-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="체크인" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="불참" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Member ranking */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="size-5" />
            멤버별 출석률
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.memberStats.length === 0 ? (
            <p className="text-sm text-muted-foreground">데이터가 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {data.memberStats.map((member, idx) => (
                <div key={member.userId} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground w-6 text-right">
                    {idx + 1}
                  </span>
                  <UserAvatar
                    user={{
                      id: member.user.id,
                      name: member.user.name,
                      profileImage: member.user.profileImage,
                    }}
                    size="sm"
                    linkToProfile
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{member.user.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{member.total}회 참여</span>
                      <span>·</span>
                      <span className="text-green-600">{member.checkedIn}회 출석</span>
                      {member.noShow > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-red-600">{member.noShow}회 불참</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold">{member.rate}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
