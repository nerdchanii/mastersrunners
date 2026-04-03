import type { LatLngBoundsExpression, LatLngTuple } from "leaflet";
import { CircleMarker, MapContainer, Polyline, TileLayer } from "react-leaflet";

import { cn } from "@/lib/utils";
import type { WorkoutTrackPoint } from "@/lib/workout-analysis";

interface WorkoutAnalysisMapProps {
  track: WorkoutTrackPoint[];
  activePointIndex?: number | null;
  highlightedLapRange?: { startIndex: number; endIndex: number } | null;
  className?: string;
}

const BASE_ROUTE_COLOR = "#94a3b8";
const ACTIVE_ROUTE_COLOR = "#2563eb";
const LAP_ROUTE_COLOR = "#f97316";

export function WorkoutAnalysisMap({
  track,
  activePointIndex = null,
  highlightedLapRange = null,
  className,
}: WorkoutAnalysisMapProps) {
  const positions: LatLngTuple[] = track.map((point) => [point.lat, point.lon]);

  if (positions.length < 2) {
    return null;
  }

  const bounds: LatLngBoundsExpression = [
    [
      Math.min(...positions.map((point) => point[0])),
      Math.min(...positions.map((point) => point[1])),
    ],
    [
      Math.max(...positions.map((point) => point[0])),
      Math.max(...positions.map((point) => point[1])),
    ],
  ];

  const activePositions =
    activePointIndex != null ? positions.slice(0, Math.max(2, activePointIndex + 1)) : [];
  const highlightedLapPositions =
    highlightedLapRange != null
      ? positions.slice(highlightedLapRange.startIndex, highlightedLapRange.endIndex + 1)
      : [];
  const activePoint =
    activePointIndex != null && track[activePointIndex] ? track[activePointIndex] : null;

  return (
    <div className={cn("h-full min-h-[360px] overflow-hidden", className)}>
      <MapContainer
        bounds={bounds}
        boundsOptions={{ padding: [40, 40] }}
        className="h-full w-full"
        preferCanvas
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Polyline
          positions={positions}
          pathOptions={{
            color: BASE_ROUTE_COLOR,
            weight: 7,
            opacity: 0.35,
            lineCap: "round",
            lineJoin: "round",
          }}
        />

        {highlightedLapPositions.length >= 2 && (
          <Polyline
            positions={highlightedLapPositions}
            pathOptions={{
              color: LAP_ROUTE_COLOR,
              weight: 8,
              opacity: 0.95,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        )}

        {activePositions.length >= 2 && (
          <Polyline
            positions={activePositions}
            pathOptions={{
              color: ACTIVE_ROUTE_COLOR,
              weight: 8,
              opacity: 0.95,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        )}

        <CircleMarker
          center={positions[0]}
          radius={7}
          pathOptions={{ color: "#ffffff", fillColor: "#16a34a", fillOpacity: 1, weight: 2 }}
        />
        <CircleMarker
          center={positions[positions.length - 1]}
          radius={7}
          pathOptions={{ color: "#ffffff", fillColor: "#ef4444", fillOpacity: 1, weight: 2 }}
        />

        {activePoint && (
          <CircleMarker
            center={[activePoint.lat, activePoint.lon]}
            radius={9}
            pathOptions={{
              color: "#ffffff",
              fillColor: ACTIVE_ROUTE_COLOR,
              fillOpacity: 1,
              weight: 3,
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
