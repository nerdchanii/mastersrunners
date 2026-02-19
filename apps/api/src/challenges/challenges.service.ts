import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common";
import { ChallengeRepository } from "./repositories/challenge.repository.js";
import { ChallengeParticipantRepository } from "./repositories/challenge-participant.repository.js";
import { ChallengeTeamRepository } from "./repositories/challenge-team.repository.js";
import type { CreateChallengeDto } from "./dto/create-challenge.dto.js";
import type { UpdateChallengeDto } from "./dto/update-challenge.dto.js";

@Injectable()
export class ChallengesService {
  constructor(
    private readonly challengeRepo: ChallengeRepository,
    private readonly participantRepo: ChallengeParticipantRepository,
    private readonly teamRepo: ChallengeTeamRepository,
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

  async findOne(id: string, userId?: string) {
    const challenge = await this.challengeRepo.findById(id);
    if (!challenge) throw new NotFoundException("챌린지를 찾을 수 없습니다.");

    // Compute isJoined and myProgress for the current user
    let isJoined = false;
    let myProgress: number | null = null;

    if (userId) {
      const participant = challenge.participants.find((p) => p.userId === userId);
      if (participant) {
        isJoined = true;
        myProgress = participant.currentValue;
      }
    }

    return {
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      type: challenge.type,
      targetValue: challenge.targetValue,
      targetUnit: challenge.targetUnit,
      startDate: challenge.startDate.toISOString(),
      endDate: challenge.endDate.toISOString(),
      isPublic: challenge.isPublic,
      creatorId: challenge.creatorId,
      creator: challenge.creator,
      _count: challenge._count,
      isJoined,
      myProgress,
    };
  }

  async findAll(options: { isPublic?: boolean; crewId?: string; cursor?: string; limit?: number }) {
    const { data, nextCursor, hasMore } = await this.challengeRepo.findAll(options);

    const items = data.map((challenge) => ({
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      type: challenge.type,
      targetValue: challenge.targetValue,
      targetUnit: challenge.targetUnit,
      startDate: challenge.startDate.toISOString(),
      endDate: challenge.endDate.toISOString(),
      isPublic: challenge.isPublic,
      _count: challenge._count,
    }));

    return { items, nextCursor, hasMore };
  }

  async findMyChallenges(userId: string, options?: { cursor?: string; limit?: number }) {
    const { data, nextCursor, hasMore } = await this.challengeRepo.findByUser(userId, options);

    const items = data.map((challenge) => ({
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      type: challenge.type,
      targetValue: challenge.targetValue,
      targetUnit: challenge.targetUnit,
      startDate: challenge.startDate.toISOString(),
      endDate: challenge.endDate.toISOString(),
      isPublic: challenge.isPublic,
      _count: challenge._count,
      myProgress: challenge.participants[0]?.currentValue ?? null,
    }));

    return { items, nextCursor, hasMore };
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

    const participants = await this.participantRepo.findLeaderboard(challengeId, limit);

    // Map to frontend contract: add rank and map currentValue to progress
    return participants.map((p, index) => ({
      rank: index + 1,
      progress: p.currentValue,
      user: p.user,
    }));
  }

  async createTeam(challengeId: string, userId: string, teamName: string) {
    const challenge = await this.challengeRepo.findById(challengeId);
    if (!challenge) throw new NotFoundException("챌린지를 찾을 수 없습니다.");

    if (challenge.creatorId !== userId) {
      const participant = await this.participantRepo.findParticipant(challengeId, userId);
      if (!participant) throw new ForbiddenException("챌린지 참여자만 팀을 생성할 수 있습니다.");
    }

    return this.teamRepo.create(challengeId, teamName);
  }

  async joinTeam(challengeId: string, userId: string, teamId: string) {
    const challenge = await this.challengeRepo.findById(challengeId);
    if (!challenge) throw new NotFoundException("챌린지를 찾을 수 없습니다.");

    const participant = await this.participantRepo.findParticipant(challengeId, userId);
    if (!participant) throw new NotFoundException("참여하지 않은 챌린지입니다.");

    return this.participantRepo.updateTeamId(challengeId, userId, teamId);
  }

  async leaveTeam(challengeId: string, userId: string) {
    const challenge = await this.challengeRepo.findById(challengeId);
    if (!challenge) throw new NotFoundException("챌린지를 찾을 수 없습니다.");

    const participant = await this.participantRepo.findParticipant(challengeId, userId);
    if (!participant) throw new NotFoundException("참여하지 않은 챌린지입니다.");
    if (!participant.challengeTeamId) throw new BadRequestException("팀에 속해 있지 않습니다.");

    return this.participantRepo.updateTeamId(challengeId, userId, null);
  }

  async getTeams(challengeId: string) {
    const challenge = await this.challengeRepo.findById(challengeId);
    if (!challenge) throw new NotFoundException("챌린지를 찾을 수 없습니다.");

    return this.teamRepo.findByChallengeId(challengeId);
  }

  async removeTeam(teamId: string, userId: string) {
    const team = await this.teamRepo.findById(teamId);
    if (!team) throw new NotFoundException("팀을 찾을 수 없습니다.");

    const challenge = await this.challengeRepo.findById(team.challengeId);
    if (!challenge) throw new NotFoundException("챌린지를 찾을 수 없습니다.");
    if (challenge.creatorId !== userId) throw new ForbiddenException("챌린지 생성자만 팀을 삭제할 수 있습니다.");

    return this.teamRepo.remove(teamId);
  }

  async getTeamLeaderboard(challengeId: string): Promise<{ teamId: string; teamName: string; totalValue: number; memberCount: number }[]> {
    const challenge = await this.challengeRepo.findById(challengeId);
    if (!challenge) throw new NotFoundException("챌린지를 찾을 수 없습니다.");

    return this.teamRepo.getTeamLeaderboard(challengeId);
  }
}
