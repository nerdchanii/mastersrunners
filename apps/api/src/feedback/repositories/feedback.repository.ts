import type { TransactionClient } from "@masters/database";
import { Injectable } from "@nestjs/common";

import { DatabaseService } from "../../database/database.service.js";
import type {
  FeedbackHandoffReferenceKind,
  FeedbackTriageStatus,
} from "../types/feedback.constants.js";

interface CreateFeedbackSubmissionData {
  userId: string;
  category: string;
  title: string;
  description: string;
  currentPath?: string;
  userAgent?: string;
}

interface ListFeedbackOpsSubmissionFilters {
  category?: string;
  search?: string;
  status?: string;
}

interface UpdateFeedbackTriageData {
  operatorEmail: string;
  status: FeedbackTriageStatus;
  triageNote: string | null;
}

interface ReplaceFeedbackHandoffData {
  handoffNote: string | null;
  operatorEmail: string;
  references: Array<{
    kind: FeedbackHandoffReferenceKind;
    label: string;
    target: string;
  }>;
}

@Injectable()
export class FeedbackRepository {
  constructor(private readonly db: DatabaseService) {}

  create(data: CreateFeedbackSubmissionData) {
    return this.db.prisma.feedbackSubmission.create({
      data,
      select: {
        id: true,
        category: true,
        title: true,
        description: true,
        currentPath: true,
        status: true,
        createdAt: true,
      },
    });
  }

  findActiveOperatorIdentity(email: string) {
    return this.db.prisma.platformOperatorIdentity.findFirst({
      where: {
        email,
        revokedAt: null,
      },
      select: {
        email: true,
        note: true,
      },
    });
  }

  listOpsSubmissions(filters: ListFeedbackOpsSubmissionFilters) {
    return this.db.prisma.feedbackSubmission.findMany({
      where: {
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.category ? { category: filters.category } : {}),
        ...(filters.search
          ? {
              OR: [
                {
                  title: {
                    contains: filters.search,
                    mode: "insensitive",
                  },
                },
                {
                  description: {
                    contains: filters.search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
      select: {
        id: true,
        category: true,
        title: true,
        currentPath: true,
        status: true,
        triageNote: true,
        createdAt: true,
        updatedAt: true,
        reviewedAt: true,
        reviewedByOperatorEmail: true,
        handoffUpdatedAt: true,
        handoffUpdatedByOperatorEmail: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  }

  getOpsSubmission(submissionId: string) {
    return this.db.prisma.feedbackSubmission.findUnique({
      where: { id: submissionId },
      select: {
        id: true,
        category: true,
        title: true,
        description: true,
        currentPath: true,
        userAgent: true,
        status: true,
        triageNote: true,
        reviewedAt: true,
        reviewedByOperatorEmail: true,
        handoffNote: true,
        handoffUpdatedAt: true,
        handoffUpdatedByOperatorEmail: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        followUpReferences: {
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            kind: true,
            label: true,
            target: true,
            createdAt: true,
            createdByOperatorEmail: true,
          },
        },
      },
    });
  }

  updateTriage(submissionId: string, data: UpdateFeedbackTriageData) {
    return this.db.prisma.feedbackSubmission.update({
      where: { id: submissionId },
      data: {
        status: data.status,
        triageNote: data.triageNote,
        reviewedAt: new Date(),
        reviewedByOperatorEmail: data.operatorEmail,
      },
      select: {
        id: true,
        status: true,
        triageNote: true,
        reviewedAt: true,
        reviewedByOperatorEmail: true,
        updatedAt: true,
      },
    });
  }

  async replaceHandoff(submissionId: string, data: ReplaceFeedbackHandoffData) {
    return this.db.prisma.$transaction(async (tx: TransactionClient) => {
      await tx.feedbackFollowUpReference.deleteMany({
        where: {
          submissionId,
        },
      });

      if (data.references.length) {
        await tx.feedbackFollowUpReference.createMany({
          data: data.references.map((reference) => ({
            submissionId,
            kind: reference.kind,
            label: reference.label,
            target: reference.target,
            createdByOperatorEmail: data.operatorEmail,
          })),
        });
      }

      await tx.feedbackSubmission.update({
        where: { id: submissionId },
        data: {
          handoffNote: data.handoffNote,
          handoffUpdatedAt: new Date(),
          handoffUpdatedByOperatorEmail: data.operatorEmail,
        },
      });

      return tx.feedbackSubmission.findUnique({
        where: { id: submissionId },
        select: {
          id: true,
          status: true,
          handoffNote: true,
          handoffUpdatedAt: true,
          handoffUpdatedByOperatorEmail: true,
          followUpReferences: {
            orderBy: {
              createdAt: "desc",
            },
            select: {
              id: true,
              kind: true,
              label: true,
              target: true,
              createdAt: true,
              createdByOperatorEmail: true,
            },
          },
        },
      });
    });
  }
}
