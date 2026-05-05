import { Test } from "@nestjs/testing";

import type { CreateFeedbackSubmissionDto } from "./dto/create-feedback-submission.dto";
import { FeedbackRepository } from "./repositories/feedback.repository";
import { FeedbackService } from "./feedback.service";

const mockFeedbackRepository = {
  create: jest.fn(),
  getOpsSubmission: jest.fn(),
  listOpsSubmissions: jest.fn(),
  replaceHandoff: jest.fn(),
  updateTriage: jest.fn(),
};

describe("FeedbackService", () => {
  let service: FeedbackService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        FeedbackService,
        { provide: FeedbackRepository, useValue: mockFeedbackRepository },
      ],
    }).compile();

    service = module.get(FeedbackService);
  });

  it("stores trimmed feedback submissions", async () => {
    const dto: CreateFeedbackSubmissionDto = {
      category: "BUG",
      title: "  이미지가 보이지 않아요  ",
      description: "  상세 페이지에서 이미지가 사라집니다.  ",
      currentPath: "  /posts/post-1  ",
    };

    mockFeedbackRepository.create.mockResolvedValue({ id: "feedback-1" });

    const result = await service.create("user-1", dto, "  Mozilla/5.0  ");

    expect(mockFeedbackRepository.create).toHaveBeenCalledWith({
      userId: "user-1",
      category: "BUG",
      title: "이미지가 보이지 않아요",
      description: "상세 페이지에서 이미지가 사라집니다.",
      currentPath: "/posts/post-1",
      userAgent: "Mozilla/5.0",
    });
    expect(result).toEqual({ id: "feedback-1" });
  });

  it("drops empty optional values", async () => {
    const dto: CreateFeedbackSubmissionDto = {
      category: "OTHER",
      title: "질문",
      description: "문의합니다.",
      currentPath: "   ",
    };

    mockFeedbackRepository.create.mockResolvedValue({ id: "feedback-2" });

    await service.create("user-1", dto, "   ");

    expect(mockFeedbackRepository.create).toHaveBeenCalledWith({
      userId: "user-1",
      category: "OTHER",
      title: "질문",
      description: "문의합니다.",
      currentPath: undefined,
      userAgent: undefined,
    });
  });

  it("rejects blank titles after trimming", async () => {
    const dto: CreateFeedbackSubmissionDto = {
      category: "BUG",
      title: "   ",
      description: "내용은 있어요.",
    };

    expect(() => service.create("user-1", dto)).toThrow("제목을 입력해주세요.");
    expect(mockFeedbackRepository.create).not.toHaveBeenCalled();
  });

  it("rejects blank descriptions after trimming", async () => {
    const dto: CreateFeedbackSubmissionDto = {
      category: "BUG",
      title: "제목은 있어요.",
      description: "   ",
    };

    expect(() => service.create("user-1", dto)).toThrow("내용을 입력해주세요.");
    expect(mockFeedbackRepository.create).not.toHaveBeenCalled();
  });

  it("lists ops submissions with trimmed filters", async () => {
    mockFeedbackRepository.listOpsSubmissions.mockResolvedValue([{ id: "feedback-ops-1" }]);

    const result = await service.listOpsSubmissions({
      status: " IN_REVIEW ",
      category: " BUG ",
      search: " 이미지 ",
    });

    expect(mockFeedbackRepository.listOpsSubmissions).toHaveBeenCalledWith({
      status: "IN_REVIEW",
      category: "BUG",
      search: "이미지",
    });
    expect(result).toEqual([{ id: "feedback-ops-1" }]);
  });

  it("throws when the ops submission does not exist", async () => {
    mockFeedbackRepository.getOpsSubmission.mockResolvedValue(null);

    await expect(service.getOpsSubmission("missing")).rejects.toThrow("피드백을 찾을 수 없습니다.");
  });

  it("updates triage with a normalized note", async () => {
    mockFeedbackRepository.getOpsSubmission.mockResolvedValue({ id: "feedback-1", status: "NEW" });
    mockFeedbackRepository.updateTriage.mockResolvedValue({
      id: "feedback-1",
      status: "IN_REVIEW",
    });

    const result = await service.updateTriage("feedback-1", "ops@example.com", {
      status: "IN_REVIEW",
      triageNote: "  재현 완료  ",
    });

    expect(mockFeedbackRepository.updateTriage).toHaveBeenCalledWith("feedback-1", {
      operatorEmail: "ops@example.com",
      status: "IN_REVIEW",
      triageNote: "재현 완료",
    });
    expect(result).toEqual({ id: "feedback-1", status: "IN_REVIEW" });
  });

  it("rejects handoff on new submissions", async () => {
    mockFeedbackRepository.getOpsSubmission.mockResolvedValue({ id: "feedback-1", status: "NEW" });

    await expect(
      service.replaceHandoff("feedback-1", "ops@example.com", {
        handoffNote: "  연결 예정  ",
        references: [],
      }),
    ).rejects.toThrow("검토 전 상태에서는 handoff를 기록할 수 없습니다.");
  });

  it("replaces handoff references with normalized values", async () => {
    mockFeedbackRepository.getOpsSubmission.mockResolvedValue({
      id: "feedback-1",
      status: "IN_REVIEW",
    });
    mockFeedbackRepository.replaceHandoff.mockResolvedValue({ id: "feedback-1" });

    const result = await service.replaceHandoff("feedback-1", "ops@example.com", {
      handoffNote: "  UI triage 후 task 연결  ",
      references: [
        {
          kind: "TASK",
          label: "  I-0014-260  ",
          target: "  tasks/archive/I-0014-260-web-feedback-ops-inbox-and-triage.md  ",
        },
      ],
    });

    expect(mockFeedbackRepository.replaceHandoff).toHaveBeenCalledWith("feedback-1", {
      operatorEmail: "ops@example.com",
      handoffNote: "UI triage 후 task 연결",
      references: [
        {
          kind: "TASK",
          label: "I-0014-260",
          target: "tasks/archive/I-0014-260-web-feedback-ops-inbox-and-triage.md",
        },
      ],
    });
    expect(result).toEqual({ id: "feedback-1" });
  });
});
