import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common";
import { ChallengeRepository } from "./repositories/challenge.repository.js";
import { ChallengeParticipantRepository } from "./repositories/challenge-participant.repository.js";
import type { CreateChallengeDto } from "./dto/create-challenge.dto.js";
import type { UpdateChallengeDto } from "./dto/update-challenge.dto.js";

@Injectable()
export class ChallengesService {
  constructor(
    private readonly challengeRepo: ChallengeRepository,
    private readonly participantRepo: ChallengeParticipantRepository,
  ) {}

  async create(userId: string, dto: CreateChallengeDto) {
    const challenge = await this.challengeRepo.create({
      title: dto.title,
      description: dto.description,
      type: dto.type,
      targetValue: dto.targetValue,
      targetUnit: dto.targetUnit,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      creatorId: userId,
      crewId: dto.crewId,
      isPublic: dto.isPublic ?? true,
      imageUrl: dto.imageUrl,
    });

    // Auto-join creator
    await this.participantRepo.join(challenge.id, userId);

    return challenge;
  }

  async findOne(id: string) {
    const challenge = await this.challengeRepo.findById(id);
    if (!challenge) throw new NotFoundException("챌린지를 찾을 수 없습니다.");
    return challenge;
  }

  async findAll(options: { isPublic?: boolean; crewId?: string; cursor?: string; limit?: number }) {
    return this.challengeRepo.findAll(options);
  }

  async findMyChallenges(userId: string) {
    return this.challengeRepo.findByUser(userId);
  }

  async update(id: string, userId: string, dto: UpdateChallengeDto) {
    const challenge = await this.challengeRepo.findById(id);
    if (!challenge) throw new NotFoundException("챌린지를 찾을 수 없습니다.");
    if (challenge.creatorId !== userId) throw new ForbiddenException("챌린지 생성자만 수정할 수 있습니다.");

    const { startDate, endDate, ...rest } = dto;
    const updateData: Record<string, unknown> = { ...rest };

    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);

    return this.challengeRepo.update(id, updateData);
  }

  async remove(id: string, userId: string) {
    const challenge = await this.challengeRepo.findById(id);
    if (!challenge) throw new NotFoundException("챌린지를 찾을 수 없습니다.");
    if (challenge.creatorId !== userId) throw new ForbiddenException("챌린지 생성자만 삭제할 수 있습니다.");

    return this.challengeRepo.remove(id);
  }

  async join(challengeId: string, userId: string) {
    const challenge = await this.challengeRepo.findById(challengeId);
    if (!challenge) throw new NotFoundException("챌린지를 찾을 수 없습니다.");

    const existing = await this.participantRepo.findParticipant(challengeId, userId);
    if (existing) throw new BadRequestException("이미 참여 중인 챌린지입니다.");

    const now = new Date();
    if (challenge.endDate < now) {
      throw new BadRequestException("종료된 챌린지에는 참여할 수 없습니다.");
    }

    return this.participantRepo.join(challengeId, userId);
  }

  async leave(challengeId: string, userId: string) {
    const participant = await this.participantRepo.findParticipant(challengeId, userId);
    if (!participant) throw new NotFoundException("참여하지 않은 챌린지입니다.");

    return this.participantRepo.leave(challengeId, userId);
  }

  async updateProgress(challengeId: string, userId: string, currentValue: number) {
    const challenge = await this.challengeRepo.findById(challengeId);
    if (!challenge) throw new NotFoundException("챌린지를 찾을 수 없습니다.");

    const participant = await this.participantRepo.findParticipant(challengeId, userId);
    if (!participant) throw new NotFoundException("참여하지 않은 챌린지입니다.");

    const completed = currentValue >= challenge.targetValue;

    return this.participantRepo.updateProgress(challengeId, userId, currentValue, completed);
  }

  async getLeaderboard(challengeId: string, limit?: number) {
    const challenge = await this.challengeRepo.findById(challengeId);
    if (!challenge) throw new NotFoundException("챌린지를 찾을 수 없습니다.");

    return this.participantRepo.findLeaderboard(challengeId, limit);
  }
}
