import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import type { CreateFeedbackSubmissionDto } from "./dto/create-feedback-submission.dto.js";
import type { ListFeedbackOpsSubmissionsDto } from "./dto/list-feedback-ops-submissions.dto.js";
import type { UpdateFeedbackHandoffDto } from "./dto/update-feedback-handoff.dto.js";
import type { UpdateFeedbackTriageDto } from "./dto/update-feedback-triage.dto.js";
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

  listOpsSubmissions(query: ListFeedbackOpsSubmissionsDto) {
    return this.feedbackRepository.listOpsSubmissions({
      status: query.status?.trim() || undefined,
      category: query.category?.trim() || undefined,
      search: query.search?.trim() || undefined,
    });
  }

  async getOpsSubmission(submissionId: string) {
    const submission = await this.feedbackRepository.getOpsSubmission(submissionId);

    if (!submission) {
      throw new NotFoundException("피드백을 찾을 수 없습니다.");
    }

    return submission;
  }

  async updateTriage(submissionId: string, operatorEmail: string, dto: UpdateFeedbackTriageDto) {
    await this.assertSubmissionExists(submissionId);

    return this.feedbackRepository.updateTriage(submissionId, {
      operatorEmail,
      status: dto.status,
      triageNote: this.normalizeOptionalText(dto.triageNote),
    });
  }

  async replaceHandoff(submissionId: string, operatorEmail: string, dto: UpdateFeedbackHandoffDto) {
    const submission = await this.assertSubmissionExists(submissionId);

    if (submission.status === "NEW") {
      throw new BadRequestException("검토 전 상태에서는 handoff를 기록할 수 없습니다.");
    }

    const references = dto.references.map((reference, index) => ({
      kind: reference.kind,
      label: this.normalizeRequiredText(reference.label, `references[${index}].label`),
      target: this.normalizeRequiredText(reference.target, `references[${index}].target`),
    }));

    return this.feedbackRepository.replaceHandoff(submissionId, {
      operatorEmail,
      handoffNote: this.normalizeOptionalText(dto.handoffNote),
      references,
    });
  }

  private async assertSubmissionExists(submissionId: string) {
    const submission = await this.feedbackRepository.getOpsSubmission(submissionId);

    if (!submission) {
      throw new NotFoundException("피드백을 찾을 수 없습니다.");
    }

    return submission;
  }

  private normalizeOptionalText(value?: string) {
    return value?.trim() ? value.trim() : null;
  }

  private normalizeRequiredText(value: string, fieldName: string) {
    const normalized = value.trim();

    if (!normalized) {
      throw new BadRequestException(`${fieldName} 값이 비어 있습니다.`);
    }

    return normalized;
  }
}
