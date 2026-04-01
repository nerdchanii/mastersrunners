import { BadRequestException, Injectable } from "@nestjs/common";

import type { CreateFeedbackSubmissionDto } from "./dto/create-feedback-submission.dto.js";
import { FeedbackRepository } from "./repositories/feedback.repository.js";

@Injectable()
export class FeedbackService {
  constructor(private readonly feedbackRepository: FeedbackRepository) {}

  create(userId: string, dto: CreateFeedbackSubmissionDto, userAgent?: string) {
    const title = dto.title.trim();
    const description = dto.description.trim();

    if (!title) {
      throw new BadRequestException("제목을 입력해주세요.");
    }

    if (!description) {
      throw new BadRequestException("내용을 입력해주세요.");
    }

    return this.feedbackRepository.create({
      userId,
      category: dto.category,
      title,
      description,
      currentPath: dto.currentPath?.trim() || undefined,
      userAgent: userAgent?.trim() || undefined,
    });
  }
}
