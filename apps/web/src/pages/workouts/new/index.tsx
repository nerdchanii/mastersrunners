import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  FileText,
  Activity,
  Clock,
  Route,
  Eye,
  Heart,
  Flame,
  Mountain,
  MapPin,
  Footprints,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/common/PageHeader";
import { formatDistance, formatDuration, formatPace } from "@/lib/format";

interface ParsedWorkoutData {
  distance: number;
  duration: number;
  date: string;
  startedAt: string | null;
  pace?: number;
  avgHeartRate?: number | null;
  maxHeartRate?: number | null;
  calories?: number | null;
  elevationGain?: number | null;
  avgCadence?: number | null;
  maxCadence?: number | null;
  hasGps?: boolean;
}

interface ParseResult {
  workout: ParsedWorkoutData | null;
  workoutFile: unknown;
  error?: string;
}

export default function NewWorkoutPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"file" | "manual">("file");
  const [date, setDate] = useState("");
  const [distance, setDistance] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [memo, setMemo] = useState("");
  const [visibility, setVisibility] = useState<"PRIVATE" | "FOLLOWERS" | "PUBLIC">("FOLLOWERS");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedWorkoutData | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [workoutCreated, setWorkoutCreated] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
  }, []);

  const pace = (() => {
    const distanceNum = parseFloat(distance);
    const hoursNum = parseInt(hours) || 0;
    const minutesNum = parseInt(minutes) || 0;
    const secondsNum = parseInt(seconds) || 0;
    const totalSeconds = hoursNum * 3600 + minutesNum * 60 + secondsNum;
    if (distanceNum > 0 && totalSeconds > 0) {
      const secPerKm = totalSeconds / distanceNum;
      return formatPace(secPerKm);
    }
    return null;
  })();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    setError(null);
    setWorkoutCreated(false);
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["fit", "gpx"].includes(ext)) {
      setError("FIT 또는 GPX 파일만 업로드 가능합니다.");
      return;
    }

    setUploadedFile(file);
    setIsUploading(true);

    try {
      // Step 1: Get presigned URL (FIT/GPX는 application/octet-stream으로 통일)
      const presignData = await api.fetch<{ uploadUrl: string; key: string }>("/uploads/presign", {
        method: "POST",
        body: JSON.stringify({
          filename: file.name,
          contentType: "application/octet-stream",
          folder: "workouts",
        }),
      });

      // Step 2: Upload to R2
      const uploadRes = await fetch(presignData.uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": "application/octet-stream",
        },
      });

      if (!uploadRes.ok) {
        throw new Error("파일 업로드에 실패했습니다.");
      }

      setIsUploading(false);
      setIsParsing(true);

      // Step 3: Parse the file and create workout
      const fileType = ext.toUpperCase() as "FIT" | "GPX";
      const result = await api.fetch<ParseResult>("/uploads/parse", {
        method: "POST",
        body: JSON.stringify({
          fileKey: presignData.key,
          fileType,
          originalFileName: file.name,
        }),
      });

      if (result.error || !result.workout) {
        throw new Error(result.error || "파일 분석에 실패했습니다.");
      }

      const workout = result.workout;
      setParsedData(workout);
      setWorkoutCreated(true);
      setIsParsing(false);

      // Auto-fill form fields from parsed data
      setDistance((workout.distance / 1000).toFixed(2));
      const h = Math.floor(workout.duration / 3600);
      const m = Math.floor((workout.duration % 3600) / 60);
      const s = workout.duration % 60;
      setHours(h > 0 ? h.toString() : "");
      setMinutes(m > 0 ? m.toString() : "");
      setSeconds(s > 0 ? s.toString() : "");
      setDate(new Date(workout.startedAt ?? workout.date).toISOString().split("T")[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "파일 처리 중 오류가 발생했습니다.");
      setIsUploading(false);
      setIsParsing(false);
    }
  };

  const validateForm = (): string | null => {
    if (!date) return "날짜를 입력해주세요.";
    const distanceNum = parseFloat(distance);
    if (!distance || isNaN(distanceNum) || distanceNum <= 0) return "거리는 0보다 큰 숫자여야 합니다.";
    const hoursNum = parseInt(hours) || 0;
    const minutesNum = parseInt(minutes) || 0;
    const secondsNum = parseInt(seconds) || 0;
    const totalSeconds = hoursNum * 3600 + minutesNum * 60 + secondsNum;
    if (totalSeconds <= 0) return "시간을 입력해주세요.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // If workout was already created via file parse, go to workouts list
    if (workoutCreated) {
      navigate("/workouts");
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsSubmitting(true);
    try {
      const hoursNum = parseInt(hours) || 0;
      const minutesNum = parseInt(minutes) || 0;
      const secondsNum = parseInt(seconds) || 0;
      const duration = hoursNum * 3600 + minutesNum * 60 + secondsNum;
      await api.fetch("/workouts", {
        method: "POST",
        body: JSON.stringify({
          distance: parseFloat(distance),
          duration,
          date,
          memo: memo.trim() || undefined,
          visibility,
        }),
      });
      navigate("/workouts");
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="container max-w-3xl py-6">
      <PageHeader title="새 기록 추가" description="훈련 파일을 업로드하거나 직접 기록을 입력하세요." />

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
                  {(parsedData.avgHeartRate || parsedData.calories || parsedData.elevationGain || parsedData.avgCadence) && (
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
                              <span className="text-xs font-normal text-muted-foreground ml-0.5">bpm</span>
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
                              <span className="text-xs font-normal text-muted-foreground ml-0.5">kcal</span>
                            </p>
                          </div>
                        </div>
                      )}

                      {parsedData.elevationGain != null && parsedData.elevationGain > 0 && (
                        <div className="flex items-center gap-2 rounded-lg border p-2.5">
                          <Mountain className="size-4 text-green-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-muted-foreground leading-none">고도 상승</p>
                            <p className="text-sm font-semibold tabular-nums">
                              {Math.round(parsedData.elevationGain)}
                              <span className="text-xs font-normal text-muted-foreground ml-0.5">m</span>
                            </p>
                          </div>
                        </div>
                      )}

                      {parsedData.avgCadence != null && (
                        <div className="flex items-center gap-2 rounded-lg border p-2.5">
                          <Footprints className="size-4 text-blue-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-muted-foreground leading-none">케이던스</p>
                            <p className="text-sm font-semibold tabular-nums">
                              {Math.round(parsedData.avgCadence)}
                              <span className="text-xs font-normal text-muted-foreground ml-0.5">spm</span>
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

          <TabsContent value="manual" className="mt-6">
            <p className="text-sm text-muted-foreground mb-6">
              수동으로 훈련 기록을 입력하세요.
            </p>
          </TabsContent>
        </Tabs>

        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="date">
                날짜 <span className="text-destructive">*</span>
              </Label>
              <Input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                disabled={workoutCreated}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="distance">
                거리 (km) <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                id="distance"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                step="0.01"
                min="0.01"
                placeholder="5.0"
                required
                disabled={workoutCreated}
              />
            </div>

            <div className="space-y-2">
              <Label>
                시간 <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="hours" className="text-xs text-muted-foreground">
                    시간
                  </Label>
                  <Input
                    type="number"
                    id="hours"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    min="0"
                    placeholder="0"
                    disabled={workoutCreated}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minutes" className="text-xs text-muted-foreground">
                    분
                  </Label>
                  <Input
                    type="number"
                    id="minutes"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    min="0"
                    max="59"
                    placeholder="30"
                    disabled={workoutCreated}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seconds" className="text-xs text-muted-foreground">
                    초
                  </Label>
                  <Input
                    type="number"
                    id="seconds"
                    value={seconds}
                    onChange={(e) => setSeconds(e.target.value)}
                    min="0"
                    max="59"
                    placeholder="0"
                    disabled={workoutCreated}
                  />
                </div>
              </div>
            </div>

            {pace && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">예상 페이스: {pace} /km</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              <Label htmlFor="memo">메모 (선택)</Label>
              <Textarea
                id="memo"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                rows={4}
                placeholder="오늘의 훈련에 대한 메모를 남겨보세요..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibility">
                <Eye className="inline h-4 w-4 mr-1" />
                공개 설정
              </Label>
              <select
                id="visibility"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as "PRIVATE" | "FOLLOWERS" | "PUBLIC")}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              >
                <option value="PRIVATE">비공개</option>
                <option value="FOLLOWERS">팔로워 공개</option>
                <option value="PUBLIC">전체 공개</option>
              </select>
              <p className="text-xs text-muted-foreground">누가 이 기록을 볼 수 있는지 설정합니다.</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "저장 중..." : workoutCreated ? "완료" : "저장"}
          </Button>
        </div>
      </form>
    </div>
  );
}
