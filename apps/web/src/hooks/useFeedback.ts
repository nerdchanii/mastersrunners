import { useMutation } from "@tanstack/react-query";

import { api } from "@/lib/api-client";

interface CreateFeedbackInput {
  category: "BUG" | "IMPROVEMENT" | "QUESTION" | "OTHER";
  title: string;
  description: string;
  currentPath?: string;
}

interface FeedbackSubmission {
  id: string;
  category: string;
  title: string;
  description: string;
  currentPath?: string | null;
  status: string;
  createdAt: string;
}

export function useCreateFeedbackSubmission() {
  return useMutation({
    mutationFn: (input: CreateFeedbackInput) =>
      api.fetch<FeedbackSubmission>("/feedback", {
        method: "POST",
        body: JSON.stringify(input),
      }),
  });
}
