import { Download, Share2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDistance, formatDuration, formatPace } from "@/lib/format";

type ColorPreset = "dark" | "blue" | "green" | "orange";

const PRESETS: Record<ColorPreset, { bg: string; accent: string; label: string }> = {
  dark: { bg: "#1a1a2e", accent: "#e94560", label: "다크" },
  blue: { bg: "#0f3460", accent: "#16213e", label: "블루" },
  green: { bg: "#1b4332", accent: "#40916c", label: "그린" },
  orange: { bg: "#7f1d1d", accent: "#f97316", label: "오렌지" },
};

interface ShareCardData {
  distance: number;
  duration: number;
  pace: number;
  date: string;
  userName: string;
}

interface ShareCardGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ShareCardData;
}

const CARD_W = 600;
const CARD_H = 340;

function drawCard(canvas: HTMLCanvasElement, data: ShareCardData, preset: ColorPreset) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const p = PRESETS[preset];

  // Background
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // Accent bar (top)
  ctx.fillStyle = p.accent;
  ctx.fillRect(0, 0, CARD_W, 6);

  // Date string
  const dateStr = new Date(data.date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "14px -apple-system, sans-serif";
  ctx.fillText(dateStr, 32, 42);

  // User name
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = "bold 16px -apple-system, sans-serif";
  ctx.fillText(`@${data.userName}`, 32, 66);

  // Stats area
  const stats = [
    { value: `${formatDistance(data.distance)}`, unit: "km", label: "거리" },
    { value: formatDuration(data.duration), unit: "", label: "시간" },
    { value: formatPace(data.pace), unit: "/km", label: "페이스" },
  ];

  const statX = 32;
  const statY = 110;
  const colW = 160;

  stats.forEach((stat, i) => {
    const x = statX + i * colW;

    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.font = "12px -apple-system, sans-serif";
    ctx.fillText(stat.label, x, statY);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 38px -apple-system, sans-serif";
    ctx.fillText(stat.value, x, statY + 46);

    if (stat.unit) {
      const valueW = ctx.measureText(stat.value).width;
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.font = "14px -apple-system, sans-serif";
      ctx.fillText(stat.unit, x + valueW + 4, statY + 46);
    }
  });

  // Divider
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(32, 185);
  ctx.lineTo(CARD_W - 32, 185);
  ctx.stroke();

  // Branding
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.font = "12px -apple-system, sans-serif";
  ctx.fillText("Masters Runners", 32, CARD_H - 28);
}

export function ShareCardGenerator({ open, onOpenChange, data }: ShareCardGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [preset, setPreset] = useState<ColorPreset>("dark");

  const redraw = useCallback(() => {
    if (!canvasRef.current) return;
    drawCard(canvasRef.current, data, preset);
  }, [data, preset]);

  useEffect(() => {
    if (open) redraw();
  }, [open, redraw]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `workout-${new Date(data.date).toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("카드가 저장되었습니다.");
  };

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], "workout-card.png", { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: "나의 러닝 기록" });
        } else {
          handleDownload();
        }
      }, "image/png");
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        toast.error("공유에 실패했습니다.");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>활동 공유 카드</DialogTitle>
        </DialogHeader>

        {/* Canvas Preview */}
        <div className="rounded-lg overflow-hidden border bg-muted/30 flex items-center justify-center p-2">
          <canvas
            ref={canvasRef}
            width={CARD_W}
            height={CARD_H}
            className="w-full h-auto rounded"
          />
        </div>

        {/* Preset selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground shrink-0">스타일</span>
          <div className="flex gap-2">
            {(Object.entries(PRESETS) as [ColorPreset, (typeof PRESETS)[ColorPreset]][]).map(
              ([key, val]) => (
                <button
                  key={key}
                  onClick={() => setPreset(key)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    preset === key ? "border-foreground scale-110" : "border-transparent"
                  }`}
                  style={{ background: val.bg }}
                  title={val.label}
                />
              ),
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            <X className="size-4" />
            닫기
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="size-4" />
            저장
          </Button>
          <Button size="sm" onClick={handleShare}>
            <Share2 className="size-4" />
            공유
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
