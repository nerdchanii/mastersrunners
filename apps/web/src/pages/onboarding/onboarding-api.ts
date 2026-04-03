import { api } from "@/lib/api-client";

export async function updateOnboardingProfile(input: {
  name: string;
  bio?: string;
  region?: string;
  subRegion?: string;
  isPrivate: boolean;
  pb5kSeconds?: number;
  pb10kSeconds?: number;
  pbHalfMarathonSeconds?: number;
  pbMarathonSeconds?: number;
}) {
  await api.fetch("/profile", {
    method: "PATCH",
    body: JSON.stringify({
      name: input.name,
      bio: input.bio,
      region: input.region,
      subRegion: input.subRegion,
      isPrivate: input.isPrivate,
      pb5kSeconds: input.pb5kSeconds,
      pb10kSeconds: input.pb10kSeconds,
      pbHalfMarathonSeconds: input.pbHalfMarathonSeconds,
      pbMarathonSeconds: input.pbMarathonSeconds,
    }),
  });
}
