import { ForbiddenException, NotFoundException } from "@nestjs/common";

import { ConversationsRepository } from "../../conversations/repositories/conversations.repository.js";
import { DatabaseService } from "../../database/database.service.js";
import { CrewRepository } from "../repositories/crew.repository.js";
import { CrewMemberRepository } from "../repositories/crew-member.repository.js";

export class CrewReadService {
  constructor(
    private readonly crewRepo: CrewRepository,
    private readonly crewMemberRepo: CrewMemberRepository,
    private readonly conversationsRepo: ConversationsRepository,
    private readonly db: DatabaseService,
  ) {}

  async explore(options: { region?: string; subRegion?: string; sort?: string; cursor?: string }) {
    return this.crewRepo.explore(options);
  }

  async recommend(userId: string) {
    const user = await this.db.prisma.user.findUnique({
      where: { id: userId },
      select: { region: true, subRegion: true },
    });
    return this.crewRepo.recommend(user?.region, user?.subRegion);
  }

  async getRegions() {
    return this.crewRepo.getRegions();
  }

  async getSubRegions(region: string) {
    return this.crewRepo.getSubRegions(region);
  }

  async getCrewChat(crewId: string, userId: string, cursor?: string) {
    const crew = await this.getCrewOrThrow(crewId);
    const member = await this.crewMemberRepo.findMember(crewId, userId);
    if (!member) {
      throw new ForbiddenException("크루 멤버만 채팅에 참여할 수 있습니다.");
    }

    if (!crew.chatConversationId) {
      return { conversation: null, messages: [], nextCursor: null };
    }

    const conversation = await this.conversationsRepo.findById(crew.chatConversationId);
    const messages = await this.conversationsRepo.getMessages(crew.chatConversationId, cursor, 30);
    const hasMore = messages.length > 30;
    const items = hasMore ? messages.slice(0, 30) : messages;

    await this.conversationsRepo.updateLastRead(crew.chatConversationId, userId).catch(() => {});

    return {
      conversation,
      messages: items,
      nextCursor: hasMore ? items[items.length - 1].id : null,
    };
  }

  async createCrewPost(
    crewId: string,
    userId: string,
    data: { content: string; visibility?: string },
  ) {
    const crew = await this.getCrewOrThrow(crewId);
    const member = crew.members.find(
      (candidate: (typeof crew.members)[number]) => candidate.userId === userId,
    );
    if (!member || member.role !== "OWNER") {
      throw new ForbiddenException("크루장만 크루 게시물을 작성할 수 있습니다.");
    }

    return this.crewRepo.createCrewPost({
      userId,
      crewId,
      content: data.content,
      visibility: data.visibility,
    });
  }

  async getCrewPosts(crewId: string, cursor?: string, currentUserId?: string) {
    await this.requireReadableCrew(crewId, currentUserId);
    return this.crewRepo.findCrewPosts(crewId, cursor);
  }

  async getCrewProfile(crewId: string, currentUserId?: string) {
    await this.requireReadableCrew(crewId, currentUserId);
    const result = await this.crewRepo.getCrewProfile(crewId);
    if (!result) {
      throw new NotFoundException("크루를 찾을 수 없습니다.");
    }
    return result;
  }

  private async getCrewOrThrow(crewId: string) {
    const crew = await this.crewRepo.findById(crewId);
    if (!crew) {
      throw new NotFoundException("크루를 찾을 수 없습니다.");
    }
    return crew;
  }

  private async requireReadableCrew(crewId: string, currentUserId?: string) {
    const crew = await this.getCrewOrThrow(crewId);
    if (crew.isPublic !== false) {
      return crew;
    }

    const member = currentUserId
      ? await this.crewMemberRepo.findMember(crewId, currentUserId)
      : null;
    if (!member || member.status !== "ACTIVE") {
      throw new NotFoundException("크루를 찾을 수 없습니다.");
    }

    return crew;
  }
}
