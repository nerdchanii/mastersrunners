import { useNavigate } from "react-router-dom";
import { EmptyState } from "@/components/common/EmptyState";
import { FileQuestion } from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <EmptyState
      icon={FileQuestion}
      title="페이지를 찾을 수 없습니다"
      description="요청하신 페이지가 존재하지 않거나 이동되었습니다."
      actionLabel="홈으로 돌아가기"
      onAction={() => navigate("/feed")}
      className="min-h-[60vh]"
    />
  );
}
