import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "@/lib/api-client";
import { formatPace } from "@/lib/format";

export interface ParsedWorkoutData {
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

type WorkoutVisibility = "PRIVATE" | "FOLLOWERS" | "PUBLIC";
type WorkoutEntryTab = "file" | "manual";

export function useWorkoutEntry() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<WorkoutEntryTab>("file");
  const [date, setDate] = useState("");
  const [distance, setDistance] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [memo, setMemo] = useState("");
  const [visibility, setVisibility] = useState<WorkoutVisibility>("FOLLOWERS");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedWorkoutData | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [workoutCreated, setWorkoutCreated] = useState(false);

  useEffect(() => {
    setDate(new Date().toISOString().split("T")[0]);
  }, []);

  const pace = (() => {
    const distanceNum = parseFloat(distance);
    const hoursNum = parseInt(hours) || 0;
    const minutesNum = parseInt(minutes) || 0;
    const secondsNum = parseInt(seconds) || 0;
    const totalSeconds = hoursNum * 3600 + minutesNum * 60 + secondsNum;
    if (distanceNum > 0 && totalSeconds > 0) {
      return formatPace(totalSeconds / distanceNum);
    }
    return null;
  })();

  const handleDrag = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === "dragenter" || event.type === "dragover") {
      setDragActive(true);
      return;
    }
    if (event.type === "dragleave") setDragActive(false);
  };

  const handleFileUpload = async (file: File) => {
    setError(null);
    setWorkoutCreated(false);

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !["fit", "gpx"].includes(extension)) {
      setError("FIT 또는 GPX 파일만 업로드 가능합니다.");
      return;
    }

    setUploadedFile(file);
    setIsUploading(true);

    try {
      const presignData = await api.fetch<{ uploadUrl: string; key: string }>("/uploads/presign", {
        method: "POST",
        body: JSON.stringify({
          filename: file.name,
          contentType: "application/octet-stream",
          folder: "workouts",
        }),
      });

      const uploadResponse = await fetch(presignData.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": "application/octet-stream" },
      });

      if (!uploadResponse.ok) {
        throw new Error("파일 업로드에 실패했습니다.");
      }

      setIsUploading(false);
      setIsParsing(true);

      const fileType = extension.toUpperCase() as "FIT" | "GPX";
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
      setDistance((workout.distance / 1000).toFixed(2));
      setHours(
        Math.floor(workout.duration / 3600) > 0
          ? Math.floor(workout.duration / 3600).toString()
          : "",
      );
      setMinutes(
        Math.floor((workout.duration % 3600) / 60) > 0
          ? Math.floor((workout.duration % 3600) / 60).toString()
          : "",
      );
      setSeconds(workout.duration % 60 > 0 ? (workout.duration % 60).toString() : "");
      setDate(new Date(workout.startedAt ?? workout.date).toISOString().split("T")[0]);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "파일 처리 중 오류가 발생했습니다.",
      );
      setIsUploading(false);
      setIsParsing(false);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      void handleFileUpload(event.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      void handleFileUpload(event.target.files[0]);
    }
  };

  const validateForm = () => {
    if (!date) return "날짜를 입력해주세요.";
    const distanceNum = parseFloat(distance);
    if (!distance || Number.isNaN(distanceNum) || distanceNum <= 0) {
      return "거리는 0보다 큰 숫자여야 합니다.";
    }
    const totalSeconds =
      (parseInt(hours) || 0) * 3600 + (parseInt(minutes) || 0) * 60 + (parseInt(seconds) || 0);
    if (totalSeconds <= 0) return "시간을 입력해주세요.";
    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

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
      const duration =
        (parseInt(hours) || 0) * 3600 + (parseInt(minutes) || 0) * 60 + (parseInt(seconds) || 0);
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
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "알 수 없는 오류가 발생했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => navigate(-1);

  return {
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
  };
}
