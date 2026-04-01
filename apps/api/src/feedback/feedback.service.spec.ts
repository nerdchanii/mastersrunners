import { Test } from "@nestjs/testing";

import type { CreateFeedbackSubmissionDto } from "./dto/create-feedback-submission.dto";
import { FeedbackRepository } from "./repositories/feedback.repository";
import { FeedbackService } from "./feedback.service";

const mockFeedbackRepository = {
  create: jest.fn(),
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
});
