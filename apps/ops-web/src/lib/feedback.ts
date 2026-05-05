export const FEEDBACK_STATUS_OPTIONS = [
  "NEW",
  "IN_REVIEW",
  "PLANNED",
  "RESOLVED",
  "DISMISSED",
] as const;

export const FEEDBACK_CATEGORY_OPTIONS = ["BUG", "IMPROVEMENT", "QUESTION", "OTHER"] as const;
export const FEEDBACK_REFERENCE_KIND_OPTIONS = ["TASK", "INITIATIVE", "ISSUE", "LINK"] as const;

export type FeedbackStatus = (typeof FEEDBACK_STATUS_OPTIONS)[number];
export type FeedbackCategory = (typeof FEEDBACK_CATEGORY_OPTIONS)[number];
export type FeedbackReferenceKind = (typeof FEEDBACK_REFERENCE_KIND_OPTIONS)[number];

export interface FeedbackOpsSubmissionListItem {
  id: string;
  category: FeedbackCategory;
  title: string;
  currentPath: string | null;
  status: FeedbackStatus;
  triageNote: string | null;
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
  reviewedByOperatorEmail: string | null;
  handoffUpdatedAt: string | null;
  handoffUpdatedByOperatorEmail: string | null;
  user: {
    name: string;
    email: string;
  };
}

export interface FeedbackFollowUpReference {
  id: string;
  kind: FeedbackReferenceKind;
  label: string;
  target: string;
  createdAt: string;
  createdByOperatorEmail: string;
}

export interface FeedbackOpsSubmissionDetail {
  id: string;
  category: FeedbackCategory;
  title: string;
  description: string;
  currentPath: string | null;
  userAgent: string | null;
  status: FeedbackStatus;
  triageNote: string | null;
  reviewedAt: string | null;
  reviewedByOperatorEmail: string | null;
  handoffNote: string | null;
  handoffUpdatedAt: string | null;
  handoffUpdatedByOperatorEmail: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    email: string;
  };
  followUpReferences: FeedbackFollowUpReference[];
}

export interface FeedbackHandoffReferenceDraft {
  kind: FeedbackReferenceKind;
  label: string;
  target: string;
}

export function formatFeedbackDate(value?: string | null) {
  if (!value) {
    return "미기록";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function getFeedbackStatusLabel(status: FeedbackStatus) {
  switch (status) {
    case "NEW":
      return "신규";
    case "IN_REVIEW":
      return "검토 중";
    case "PLANNED":
      return "계획됨";
    case "RESOLVED":
      return "해결됨";
    case "DISMISSED":
      return "보류";
  }
}

export function getFeedbackCategoryLabel(category: FeedbackCategory) {
  switch (category) {
    case "BUG":
      return "버그";
    case "IMPROVEMENT":
      return "개선";
    case "QUESTION":
      return "문의";
    case "OTHER":
      return "기타";
  }
}

export function getFeedbackReferenceKindLabel(kind: FeedbackReferenceKind) {
  switch (kind) {
    case "TASK":
      return "Task";
    case "INITIATIVE":
      return "Initiative";
    case "ISSUE":
      return "Issue";
    case "LINK":
      return "Link";
  }
}
