import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Users, Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth-context";
import { useCrewExplore, useCrewRecommend, useRegions, useSubRegions } from "@/hooks/useCrewExplore";
import { api } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

// My crews query
function useMyCrews() {
  return useQuery({
    queryKey: ["crews", "my"],
    queryFn: () => api.fetch<any[]>("/crews/my"),
  });
}

// Korean regions data
const KOREA_REGIONS = [
  "서울특별시", "부산광역시", "대구광역시", "인천광역시", "광주광역시",
  "대전광역시", "울산광역시", "세종특별자치시", "경기도", "강원특별자치도",
  "충청북도", "충청남도", "전북특별자치도", "전라남도", "경상북도", "경상남도", "제주특별자치도"
];

export default function CrewsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("my");

  return (
    <div className="container max-w-4xl mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">크루</h1>
        {user && (
          <Button onClick={() => navigate("/crews/new")}>
            <Plus className="size-4 mr-2" />
            크루 만들기
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="my">내 크루</TabsTrigger>
          <TabsTrigger value="explore">크루 찾기</TabsTrigger>
        </TabsList>

        <TabsContent value="my" className="mt-6">
          <MyCrewsList />
        </TabsContent>

        <TabsContent value="explore" className="mt-6">
          <CrewExplore />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MyCrewsList() {
  const { data: crews, isLoading } = useMyCrews();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!crews?.length) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          가입한 크루가 없습니다. 크루를 찾아보세요!
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {crews.map((crew: any) => (
        <Link key={crew.id} to={`/crews/${crew.id}`}>
          <Card className="hover:bg-accent/50 transition-colors">
            <CardContent className="py-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                {crew.imageUrl ? (
                  <img src={crew.imageUrl} alt={crew.name} className="w-12 h-12 rounded-lg object-cover" />
                ) : (
                  <Users className="w-6 h-6 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{crew.name}</h3>
                <p className="text-sm text-muted-foreground">{crew._count?.members ?? 0}명</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function CrewExplore() {
  const [selectedRegion, setSelectedRegion] = useState<string | undefined>();
  const [selectedSubRegion, setSelectedSubRegion] = useState<string | undefined>();
  const [sort, setSort] = useState("activity");

  const { data: regions } = useRegions();
  const { data: subRegions } = useSubRegions(selectedRegion || "");
  const { data: crews, isLoading: crewsLoading } = useCrewExplore({
    region: selectedRegion,
    subRegion: selectedSubRegion,
    sort,
  });
  const { data: recommended } = useCrewRecommend();

  return (
    <div className="space-y-6">
      {/* Recommended section */}
      {recommended && recommended.length > 0 && !selectedRegion && (
        <div>
          <h2 className="text-lg font-semibold mb-3">추천 크루</h2>
          <div className="space-y-2">
            {recommended.slice(0, 3).map((crew) => (
              <CrewCard key={crew.id} crew={crew} />
            ))}
          </div>
        </div>
      )}

      {/* Region filter */}
      <div>
        <h2 className="text-lg font-semibold mb-3">지역별 탐색</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge
            variant={!selectedRegion ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => { setSelectedRegion(undefined); setSelectedSubRegion(undefined); }}
          >
            전체
          </Badge>
          {KOREA_REGIONS.map((r) => {
            const regionData = regions?.find((rd) => rd.region === r);
            return (
              <Badge
                key={r}
                variant={selectedRegion === r ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => { setSelectedRegion(r); setSelectedSubRegion(undefined); }}
              >
                {r.replace(/(특별시|광역시|특별자치시|특별자치도|도)$/, "")}{regionData ? ` (${regionData.crewCount})` : ""}
              </Badge>
            );
          })}
        </div>

        {/* Sub-region filter */}
        {selectedRegion && subRegions && subRegions.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge
              variant={!selectedSubRegion ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedSubRegion(undefined)}
            >
              전체
            </Badge>
            {subRegions.map((sr) => (
              <Badge
                key={sr.subRegion}
                variant={selectedSubRegion === sr.subRegion ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedSubRegion(sr.subRegion)}
              >
                {sr.subRegion} ({sr.crewCount})
              </Badge>
            ))}
          </div>
        )}

        {/* Sort options */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-muted-foreground">정렬:</span>
          {[
            { value: "activity", label: "활동순" },
            { value: "members", label: "멤버순" },
            { value: "created", label: "최신순" },
          ].map((s) => (
            <Badge
              key={s.value}
              variant={sort === s.value ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSort(s.value)}
            >
              {s.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Crew list */}
      {crewsLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : !crews?.items?.length ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {selectedRegion ? `${selectedRegion}에 등록된 크루가 없습니다.` : "등록된 크루가 없습니다."}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {crews.items.map((crew) => (
            <CrewCard key={crew.id} crew={crew} />
          ))}
        </div>
      )}
    </div>
  );
}

function CrewCard({ crew }: { crew: any }) {
  return (
    <Link to={`/crews/${crew.id}`}>
      <Card className="hover:bg-accent/50 transition-colors">
        <CardContent className="py-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            {crew.imageUrl ? (
              <img src={crew.imageUrl} alt={crew.name} className="w-12 h-12 rounded-lg object-cover" />
            ) : (
              <Users className="w-6 h-6 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{crew.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{crew._count?.members ?? 0}명</span>
              {(crew.region || crew.subRegion) && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-0.5">
                    <MapPin className="size-3" />
                    {crew.subRegion || crew.region}
                  </span>
                </>
              )}
              {crew._count?.activities > 0 && (
                <>
                  <span>·</span>
                  <span>활동 {crew._count.activities}회</span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
