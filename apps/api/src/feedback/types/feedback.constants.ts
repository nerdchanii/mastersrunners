export const FEEDBACK_CATEGORIES = ["BUG", "IMPROVEMENT", "QUESTION", "OTHER"] as const;

export const FEEDBACK_TRIAGE_STATUSES = [
  "NEW",
  "IN_REVIEW",
  "PLANNED",
  "RESOLVED",
  "DISMISSED",
] as const;

export const FEEDBACK_HANDOFF_REFERENCE_KINDS = ["TASK", "INITIATIVE", "ISSUE", "LINK"] as const;

export type FeedbackTriageStatus = (typeof FEEDBACK_TRIAGE_STATUSES)[number];
export type FeedbackHandoffReferenceKind = (typeof FEEDBACK_HANDOFF_REFERENCE_KINDS)[number];
