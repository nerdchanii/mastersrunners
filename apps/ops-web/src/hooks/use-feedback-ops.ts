import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import type {
  FeedbackHandoffReferenceDraft,
  FeedbackOpsSubmissionDetail,
  FeedbackOpsSubmissionListItem,
  FeedbackStatus,
} from "@/lib/feedback";

interface FeedbackOpsFilters {
  category?: string;
  search?: string;
  status?: string;
}

export function useFeedbackOpsSubmissions(filters: FeedbackOpsFilters) {
  const params = new URLSearchParams();

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.category) {
    params.set("category", filters.category);
  }

  if (filters.search) {
    params.set("search", filters.search);
  }

  const query = params.toString();

  return useQuery({
    queryKey: ["feedback-ops", "submissions", filters],
    queryFn: () =>
      api.get<FeedbackOpsSubmissionListItem[]>(
        `/feedback/ops/submissions${query ? `?${query}` : ""}`,
      ),
    placeholderData: keepPreviousData,
  });
}

export function useFeedbackOpsSubmission(submissionId?: string) {
  return useQuery({
    enabled: Boolean(submissionId),
    queryKey: ["feedback-ops", "submission", submissionId],
    queryFn: () =>
      api.get<FeedbackOpsSubmissionDetail>(`/feedback/ops/submissions/${submissionId}`),
  });
}

export function useUpdateFeedbackTriage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { submissionId: string; status: FeedbackStatus; triageNote: string }) =>
      api.patch(`/feedback/ops/submissions/${input.submissionId}/triage`, {
        status: input.status,
        triageNote: input.triageNote,
      }),
    onSuccess: async (_result, input) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["feedback-ops", "submissions"] }),
        queryClient.invalidateQueries({
          queryKey: ["feedback-ops", "submission", input.submissionId],
        }),
      ]);
    },
  });
}

export function useReplaceFeedbackHandoff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      handoffNote: string;
      references: FeedbackHandoffReferenceDraft[];
      submissionId: string;
    }) =>
      api.put(`/feedback/ops/submissions/${input.submissionId}/handoff`, {
        handoffNote: input.handoffNote,
        references: input.references,
      }),
    onSuccess: async (_result, input) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["feedback-ops", "submissions"] }),
        queryClient.invalidateQueries({
          queryKey: ["feedback-ops", "submission", input.submissionId],
        }),
      ]);
    },
  });
}
