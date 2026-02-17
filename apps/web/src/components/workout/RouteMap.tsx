import { useMemo } from "react";
import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import type { LatLngBoundsExpression, LatLngTuple } from "leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export interface GpsPoint {
  lat: number;
  lon: number;
  elevation?: number;
  heartRate?: number;
  cadence?: number;
  timestamp?: string;
}

interface RouteMapProps {
  routeData: GpsPoint[];
  className?: string;
}

export function RouteMap({ routeData, className }: RouteMapProps) {
  const positions = useMemo<LatLngTuple[]>(
    () => routeData.map((p) => [p.lat, p.lon]),
    [routeData],
  );

  const bounds = useMemo<LatLngBoundsExpression | undefined>(() => {
    if (positions.length === 0) return undefined;
    const lats = positions.map((p) => p[0]);
    const lngs = positions.map((p) => p[1]);
    return [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)],
    ];
  }, [positions]);

  if (positions.length === 0) return null;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPin className="size-4" />
          경로
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full overflow-hidden rounded-lg">
          <MapContainer
            bounds={bounds}
            boundsOptions={{ padding: [30, 30] }}
            scrollWheelZoom={false}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Polyline
              positions={positions}
              pathOptions={{
                color: "hsl(220, 90%, 56%)",
                weight: 4,
                opacity: 0.85,
              }}
            />
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}
