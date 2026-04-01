import {
  Activity,
  Clock,
  Eye,
  FileText,
  Flame,
  Footprints,
  Heart,
  MapPin,
  Mountain,
  Route,
  Upload,
} from "lucide-react";
import { Link } from "react-router-dom";

import { PageHeader } from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { formatDistance, formatDuration, formatPace } from "@/lib/format";
import { cn } from "@/lib/utils";

import { useWorkoutEntry } from "./use-workout-entry";

export default function NewWorkoutPage() {
  const {
    activeTab,
    date,
    distance,
    dragActive,
    error,
    fileInputRef,
    handleCancel,
    handleDrag,
    handleDrop,
    handleFileChange,
    handleSubmit,
    hours,
    isParsing,
    isSubmitting,
    isUploading,
    memo,
    minutes,
    pace,
    parsedData,
    seconds,
    setActiveTab,
    setDate,
    setDistance,
    setHours,
    setMemo,
    setMinutes,
    setSeconds,
    setVisibility,
    uploadedFile,
    visibility,
    workoutCreated,
  } = useWorkoutEntry();

  return (
    <div className="container max-w-3xl py-6 pb-32">
      <PageHeader
        title="새 기록 추가"
        description="훈련 파일을 업로드하거나 직접 기록을 입력하세요."
      />

      <div className="mt-4 inline-flex rounded-full bg-muted p-1">
        <Link
          to="/posts/new"
          className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          게시글
        </Link>
        <Link
          to="/workouts/new"
          className={cn(
            "rounded-full bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm",
          )}
        >
          운동 기록
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {error && (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "file" | "manual")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file">
              <Upload className="mr-2" />
              파일로 기록하기
            </TabsTrigger>
            <TabsTrigger value="manual">
              <FileText className="mr-2" />
              직접 입력하기
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="space-y-6 mt-6">
            <Card>
              <CardContent className="pt-6">
                <div
                  className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                    dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".fit,.gpx"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isUploading || isParsing}
                  />
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading || isParsing}
                    >
                      파일 선택
                    </Button>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    또는 FIT/GPX 파일을 드래그 앤 드롭하세요
                  </p>
                  {uploadedFile && (
                    <Badge variant="outline" className="mt-4">
                      {uploadedFile.name}
                    </Badge>
                  )}
                  {isUploading && (
                    <p className="mt-4 text-sm text-muted-foreground">업로드 중...</p>
                  )}
                  {isParsing && (
                    <p className="mt-4 text-sm text-muted-foreground">파일 분석 중...</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {parsedData && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold">분석 결과</h3>
                    <div className="flex items-center gap-2">
                      {parsedData.hasGps && (
                        <Badge variant="secondary" className="gap-1">
                          <MapPin className="size-3" />
                          GPS
                        </Badge>
                      )}
                      {workoutCreated && (
                        <Badge variant="default" className="gap-1">
                          저장됨
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Primary metrics */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center rounded-lg bg-muted/50 p-3">
                      <Route className="mx-auto size-4 text-muted-foreground mb-1" />
                      <p className="text-xs text-muted-foreground">거리</p>
                      <p className="text-sm font-bold tabular-nums">
                        {formatDistance(parsedData.distance)} km
                      </p>
                    </div>
                    <div className="text-center rounded-lg bg-muted/50 p-3">
                      <Clock className="mx-auto size-4 text-muted-foreground mb-1" />
                      <p className="text-xs text-muted-foreground">시간</p>
                      <p className="text-sm font-bold tabular-nums">
                        {formatDuration(parsedData.duration)}
                      </p>
                    </div>
                    <div className="text-center rounded-lg bg-muted/50 p-3">
                      <Activity className="mx-auto size-4 text-muted-foreground mb-1" />
                      <p className="text-xs text-muted-foreground">페이스</p>
                      <p className="text-sm font-bold tabular-nums">
                        {parsedData.pace
                          ? formatPace(parsedData.pace)
                          : formatPace(parsedData.duration / (parsedData.distance / 1000))}
                        /km
                      </p>
                    </div>
                  </div>

                  {/* Secondary metrics */}
                  {(parsedData.avgHeartRate ||
                    parsedData.calories ||
                    parsedData.elevationGain ||
                    parsedData.avgCadence) && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {parsedData.avgHeartRate != null && (
                        <div className="flex items-center gap-2 rounded-lg border p-2.5">
                          <Heart className="size-4 text-red-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-muted-foreground leading-none">심박수</p>
                            <p className="text-sm font-semibold tabular-nums">
                              {Math.round(parsedData.avgHeartRate)}
                              {parsedData.maxHeartRate != null && (
                                <span className="text-xs font-normal text-muted-foreground">
                                  /{Math.round(parsedData.maxHeartRate)}
                                </span>
                              )}
                              <span className="text-xs font-normal text-muted-foreground ml-0.5">
                                bpm
                              </span>
                            </p>
                          </div>
                        </div>
                      )}

                      {parsedData.calories != null && parsedData.calories > 0 && (
                        <div className="flex items-center gap-2 rounded-lg border p-2.5">
                          <Flame className="size-4 text-orange-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-muted-foreground leading-none">칼로리</p>
                            <p className="text-sm font-semibold tabular-nums">
                              {Math.round(parsedData.calories)}
                              <span className="text-xs font-normal text-muted-foreground ml-0.5">
                                kcal
                              </span>
                            </p>
                          </div>
                        </div>
                      )}

                      {parsedData.elevationGain != null && parsedData.elevationGain > 0 && (
                        <div className="flex items-center gap-2 rounded-lg border p-2.5">
                          <Mountain className="size-4 text-green-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-muted-foreground leading-none">
                              고도 상승
                            </p>
                            <p className="text-sm font-semibold tabular-nums">
                              {Math.round(parsedData.elevationGain)}
                              <span className="text-xs font-normal text-muted-foreground ml-0.5">
                                m
                              </span>
                            </p>
                          </div>
                        </div>
                      )}

                      {parsedData.avgCadence != null && (
                        <div className="flex items-center gap-2 rounded-lg border p-2.5">
                          <Footprints className="size-4 text-blue-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-muted-foreground leading-none">
                              케이던스
                            </p>
                            <p className="text-sm font-semibold tabular-nums">
                              {Math.round(parsedData.avgCadence)}
                              <span className="text-xs font-normal text-muted-foreground ml-0.5">
                                spm
                              </span>
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <p className="mt-4 text-xs text-muted-foreground">
                    {workoutCreated
                      ? "워크아웃이 자동으로 저장되었습니다. 아래에서 메모와 공개 설정을 추가할 수 있습니다."
                      : "아래에서 값을 수정할 수 있습니다."}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="manual" className="mt-6 space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="date-manual">
                    날짜 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="date"
                    id="date-manual"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="distance-manual">
                    거리 (km) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="number"
                    id="distance-manual"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    step="0.01"
                    min="0.01"
                    placeholder="5.0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    시간 <span className="text-destructive">*</span>
                  </Label>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="hours-m" className="text-xs text-muted-foreground">
                        시간
                      </Label>
                      <Input
                        type="number"
                        id="hours-m"
                        value={hours}
                        onChange={(e) => setHours(e.target.value)}
                        min="0"
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="minutes-m" className="text-xs text-muted-foreground">
                        분
                      </Label>
                      <Input
                        type="number"
                        id="minutes-m"
                        value={minutes}
                        onChange={(e) => setMinutes(e.target.value)}
                        min="0"
                        max="59"
                        placeholder="30"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="seconds-m" className="text-xs text-muted-foreground">
                        초
                      </Label>
                      <Input
                        type="number"
                        id="seconds-m"
                        value={seconds}
                        onChange={(e) => setSeconds(e.target.value)}
                        min="0"
                        max="59"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {pace && (
                  <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 px-4 py-3">
                    <Activity className="size-4 text-primary" />
                    <span className="text-sm font-medium">예상 페이스: {pace} /km</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="memo-manual">메모 (선택)</Label>
                  <Textarea
                    id="memo-manual"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    rows={3}
                    placeholder="오늘의 훈련에 대한 메모를 남겨보세요..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    <Eye className="inline size-4 mr-1" />
                    공개 설정
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["FOLLOWERS", "PUBLIC", "PRIVATE"] as const).map((v) => {
                      const labels = {
                        FOLLOWERS: "팔로워",
                        PUBLIC: "전체 공개",
                        PRIVATE: "비공개",
                      };
                      return (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setVisibility(v)}
                          className={`rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all ${visibility === v ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}
                        >
                          {labels[v]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* File tab: show date/memo/visibility only after file parsed */}
        {activeTab === "file" && workoutCreated && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">저장 후 설정</h3>
              <div className="space-y-2">
                <Label htmlFor="memo">메모 (선택)</Label>
                <Textarea
                  id="memo"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  rows={3}
                  placeholder="오늘의 훈련에 대한 메모를 남겨보세요..."
                />
              </div>
              <div className="space-y-2">
                <Label>공개 설정</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["FOLLOWERS", "PUBLIC", "PRIVATE"] as const).map((v) => {
                    const labels = { FOLLOWERS: "팔로워", PUBLIC: "전체 공개", PRIVATE: "비공개" };
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setVisibility(v)}
                        className={`rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all ${visibility === v ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}
                      >
                        {labels[v]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="sticky bottom-[calc(env(safe-area-inset-bottom)+5rem)] z-20 rounded-3xl border border-border/60 bg-background/95 p-3 shadow-lg backdrop-blur md:bottom-4">
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              취소
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting || (activeTab === "file" && !workoutCreated && !parsedData)}
            >
              {isSubmitting ? "저장 중..." : workoutCreated ? "완료" : "저장"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
