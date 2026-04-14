import type { ReactNode } from "react";

export const crewActivityIconOptions = ["🏃", "🏁", "☕", "🍻", "🎯", "🧭"] as const;

export type CrewActivityIcon = (typeof crewActivityIconOptions)[number];

export function isCrewActivityIcon(value: string | null | undefined): value is CrewActivityIcon {
  return !!value && (crewActivityIconOptions as readonly string[]).includes(value);
}

export function getCrewActivityIcon(
  activityType?: string | null,
  activityIcon?: string | null,
): { node: ReactNode } {
  if (activityType === "POP_UP") {
    return { node: <span className="text-base leading-none">⚡</span> };
  }

  const icon = isCrewActivityIcon(activityIcon) ? activityIcon : "🏃";
  return { node: <span className="text-base leading-none">{icon}</span> };
}
