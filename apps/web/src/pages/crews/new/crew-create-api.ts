import { api } from "@/lib/api-client";

interface CreatedCrew {
  id: string;
}

export async function createCrew(data: {
  name: string;
  description?: string;
  isPublic: boolean;
  maxMembers?: number;
  location?: string;
  region?: string;
  subRegion?: string;
}) {
  return api.fetch<CreatedCrew>("/crews", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
