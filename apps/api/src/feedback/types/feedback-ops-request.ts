import type { Request } from "express";

export interface FeedbackOpsRequest extends Request {
  operator: {
    email: string;
    note?: string | null;
  };
}
