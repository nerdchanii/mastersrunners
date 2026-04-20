import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import {
  useAdminCheckIn,
  useCancelActivity,
  useCancelRsvp,
  useCheckIn,
  useCompleteActivity,
  useCrewActivity,
  useDeleteActivity,
  useRsvp,
} from "@/hooks/useCrewActivities";
import { useCrew } from "@/hooks/useCrews";
import { useAuth } from "@/lib/auth-context";

export function useCrewActivityDetailViewModel() {
  const { id: crewId, activityId } = useParams<{ id: string; activityId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const {
    data: activity,
    isLoading: isActivityLoading,
    error,
  } = useCrewActivity(crewId!, activityId!);
  const { data: crew } = useCrew(crewId!);

  const deleteActivity = useDeleteActivity();
  const checkIn = useCheckIn();
  const rsvp = useRsvp();
  const cancelRsvp = useCancelRsvp();
  const completeActivity = useCompleteActivity();
  const cancelActivityMut = useCancelActivity();
  const adminCheckInMut = useAdminCheckIn();

  const currentMember = crew?.members?.find((member) => member.user.id === user?.id);
  const isAdmin = currentMember?.role === "OWNER" || currentMember?.role === "ADMIN";
  const creator = activity
    ? crew?.members?.find((member) => member.user.id === activity.createdBy)
    : undefined;
  const scheduledDate = activity ? new Date(activity.activityDate) : null;
  const myAttendance = activity?.attendances.find((attendance) => attendance.userId === user?.id);
  const myStatus = myAttendance?.status;
  const isActivityActive = activity?.status === "SCHEDULED" || activity?.status === "ACTIVE";
  const isHost = activity?.createdBy === user?.id;
  const canManage = Boolean(isAdmin || (activity?.activityType === "POP_UP" && isHost));

  const rsvpCount =
    activity?.attendances.filter((attendance) => attendance.status === "RSVP").length ?? 0;
  const checkedInCount =
    activity?.attendances.filter((attendance) => attendance.status === "CHECKED_IN").length ?? 0;
  const noShowCount =
    activity?.attendances.filter((attendance) => attendance.status === "NO_SHOW").length ?? 0;
  const activeAttendances =
    activity?.attendances.filter((attendance) => attendance.status !== "CANCELLED") ?? [];
  const totalActive = activeAttendances.length;
  const visibleAttendances =
    activity?.attendances.filter((attendance) => attendance.status !== "CANCELLED") ?? [];
  const checkedInAttendances = visibleAttendances.filter(
    (attendance) => attendance.status === "CHECKED_IN",
  );
  const pendingAttendances = visibleAttendances.filter(
    (attendance) => attendance.status === "RSVP",
  );
  const crewName = crew?.name ?? "크루";
  const activityDateLabel = scheduledDate
    ? new Intl.DateTimeFormat("ko-KR", {
        month: "long",
        day: "numeric",
        weekday: "short",
      }).format(scheduledDate)
    : "";
  const canViewPendingRoster = Boolean(
    canManage || myStatus === "RSVP" || myStatus === "CHECKED_IN",
  );
  const activityShareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/crews/${crewId}/activities/${activityId}`
      : `/crews/${crewId}/activities/${activityId}`;

  const goBackToCrew = () => navigate(`/crews/${crewId}`);
  const goToEdit = () => navigate(`/crews/${crewId}/activities/${activityId}/edit`);
  const goToChat = () => navigate(`/crews/${crewId}/activities/${activityId}/chat`);
  const goToQrCheckIn = () => navigate(`/crews/${crewId}/activities/${activityId}/qr-check-in`);

  const handleDelete = () => {
    deleteActivity.mutate(
      { crewId: crewId!, activityId: activityId! },
      {
        onSuccess: () => {
          toast.success("활동이 삭제되었습니다.");
          goBackToCrew();
        },
        onError: () => toast.error("활동 삭제에 실패했습니다."),
      },
    );
  };

  const handleCheckIn = () => {
    checkIn.mutate(
      { crewId: crewId!, activityId: activityId!, method: "MANUAL" },
      {
        onSuccess: () => toast.success("체크인 완료!"),
        onError: () => toast.error("체크인에 실패했습니다."),
      },
    );
  };

  const handleRsvp = () => {
    rsvp.mutate(
      { crewId: crewId!, activityId: activityId! },
      {
        onSuccess: () => toast.success("참석 신청 완료!"),
        onError: (error) =>
          toast.error(error instanceof Error ? error.message : "참석 신청에 실패했습니다."),
      },
    );
  };

  const handleRsvpAndEnterChat = () => {
    rsvp.mutate(
      { crewId: crewId!, activityId: activityId! },
      {
        onSuccess: () => {
          toast.success("참석 신청 완료!");
          goToChat();
        },
        onError: (error) =>
          toast.error(error instanceof Error ? error.message : "참석 신청에 실패했습니다."),
      },
    );
  };

  const handleCancelRsvp = () => {
    cancelRsvp.mutate(
      { crewId: crewId!, activityId: activityId! },
      {
        onSuccess: () => toast.success("참석이 취소되었습니다."),
        onError: () => toast.error("참석 취소에 실패했습니다."),
      },
    );
  };

  const handleAdminCheckIn = (userId: string, userName?: string | null) => {
    adminCheckInMut.mutate(
      { crewId: crewId!, activityId: activityId!, userId },
      {
        onSuccess: () => toast.success(`${userName ?? "멤버"}님을 체크인했습니다.`),
        onError: () => toast.error("대리 체크인에 실패했습니다."),
      },
    );
  };

  const handleCompleteActivity = () => {
    completeActivity.mutate(
      { crewId: crewId!, activityId: activityId! },
      {
        onSuccess: () => {
          toast.success("활동이 종료되었습니다.");
          setShowCompleteDialog(false);
        },
        onError: () => toast.error("활동 종료에 실패했습니다."),
      },
    );
  };

  const handleCancelActivity = () => {
    cancelActivityMut.mutate(
      { crewId: crewId!, activityId: activityId! },
      {
        onSuccess: () => {
          toast.success("활동이 취소되었습니다.");
          setShowCancelDialog(false);
        },
        onError: () => toast.error("활동 취소에 실패했습니다."),
      },
    );
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById("activity-qr-code");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const image = new Image();
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      context?.drawImage(image, 0, 0);
      const link = document.createElement("a");
      link.download = `activity-${activityId}-qr.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    image.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  };

  return {
    activity,
    activityId,
    adminCheckInMut,
    canManage,
    cancelActivityMut,
    cancelRsvp,
    checkedInCount,
    checkedInAttendances,
    checkIn,
    completeActivity,
    creator,
    crewName,
    crewId,
    deleteActivity,
    error,
    goBackToCrew,
    goToChat,
    goToEdit,
    goToQrCheckIn,
    handleAdminCheckIn,
    handleCancelActivity,
    handleCancelRsvp,
    handleCheckIn,
    handleCompleteActivity,
    handleDelete,
    handleDownloadQR,
    handleRsvp,
    handleRsvpAndEnterChat,
    isActivityActive,
    isActivityLoading,
    isAdmin,
    activityDateLabel,
    activityShareUrl,
    myAttendance,
    myStatus,
    noShowCount,
    pendingAttendances,
    rsvp,
    rsvpCount,
    scheduledDate,
    setShowCancelDialog,
    setShowCompleteDialog,
    setShowDeleteDialog,
    showCancelDialog,
    showCompleteDialog,
    showDeleteDialog,
    totalActive,
    canViewPendingRoster,
    visibleAttendances,
  };
}
