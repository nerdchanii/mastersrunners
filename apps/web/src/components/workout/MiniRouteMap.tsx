import { useMemo } from "react";
import { decodePolyline, normalizePath } from "@/lib/polyline";

interface MiniRouteMapProps {
  encodedPolyline: string;
  size?: number;
  strokeColor?: string;
  strokeWidth?: number;
  className?: string;
}

export function MiniRouteMap({
  encodedPolyline,
  size = 80,
  strokeColor = "currentColor",
  strokeWidth = 1.5,
  className = "",
}: MiniRouteMapProps) {
  const polylinePoints = useMemo(() => {
    if (!encodedPolyline) return "";
    try {
      const coords = decodePolyline(encodedPolyline);
      if (coords.length < 2) return "";
      const normalized = normalizePath(coords, size, size, 4);
      return normalized.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
    } catch {
      return "";
    }
  }, [encodedPolyline, size]);

  if (!polylinePoints) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      aria-hidden="true"
    >
      <path
        d={polylinePoints}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
