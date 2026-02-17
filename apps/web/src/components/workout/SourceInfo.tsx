import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

export interface WorkoutFile {
  id: string;
  originalFileName: string;
  fileType: string; // "FIT" | "GPX"
  createdAt: string;
}

interface SourceInfoProps {
  file: WorkoutFile;
  className?: string;
}

export function SourceInfo({ file, className }: SourceInfoProps) {
  const uploadDate = new Date(file.createdAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className ?? ""}`}>
      <FileText className="size-3.5" />
      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
        {file.fileType}
      </Badge>
      <span className="truncate max-w-[180px]">{file.originalFileName}</span>
      <span className="text-xs">{uploadDate}</span>
    </div>
  );
}
