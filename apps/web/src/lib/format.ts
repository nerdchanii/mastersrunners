/** meters → km string (e.g. "10.25") */
export function formatDistance(meters: number): string {
  return (meters / 1000).toFixed(2);
}

/** seconds → human-readable duration */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** seconds → compact duration (e.g. "1시간 23분") */
export function formatDurationKorean(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);

  if (h > 0) return `${h}시간 ${m}분`;
  return `${m}분`;
}

/** sec/km → pace string (e.g. "5'30\"") */
export function formatPace(secPerKm: number): string {
  const min = Math.floor(secPerKm / 60);
  const sec = Math.round(secPerKm % 60);
  return `${min}'${sec.toString().padStart(2, "0")}"`;
}
