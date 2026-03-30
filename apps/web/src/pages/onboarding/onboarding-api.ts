import { api } from "@/lib/api-client";

export async function updateOnboardingProfile(input: {
  name: string;
  bio?: string;
  isPrivate: boolean;
}) {
  await api.fetch("/profile", {
    method: "PATCH",
    body: JSON.stringify({
      name: input.name,
      bio: input.bio,
      isPrivate: input.isPrivate,
    }),
  });
}
