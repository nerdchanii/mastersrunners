import { Injectable } from "@nestjs/common";

import { DatabaseService } from "../../database/database.service.js";

interface CreateFeedbackSubmissionData {
  userId: string;
  category: string;
  title: string;
  description: string;
  currentPath?: string;
  userAgent?: string;
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
}
