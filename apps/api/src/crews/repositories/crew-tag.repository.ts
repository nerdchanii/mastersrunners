import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';

@Injectable()
export class CrewTagRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(crewId: string, name: string, color: string = '#3B82F6') {
    return this.databaseService.prisma.crewTag.create({
      data: {
        crewId,
        name,
        color,
      },
    });
  }

  async findByCrewId(crewId: string) {
    return this.databaseService.prisma.crewTag.findMany({
      where: { crewId },
      orderBy: { name: 'asc' },
    });
  }

  async update(id: string, data: { name?: string; color?: string }) {
    return this.databaseService.prisma.crewTag.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.databaseService.prisma.crewTag.delete({
      where: { id },
    });
  }

  async assignToMember(crewMemberId: string, crewTagId: string) {
    return this.databaseService.prisma.crewMemberTag.create({
      data: {
        crewMemberId,
        crewTagId,
      },
    });
  }

  async removeFromMember(crewMemberId: string, crewTagId: string) {
    return this.databaseService.prisma.crewMemberTag.delete({
      where: {
        crewMemberId_crewTagId: {
          crewMemberId,
          crewTagId,
        },
      },
    });
  }

  async findMembersByTag(crewTagId: string) {
    return this.databaseService.prisma.crewMemberTag.findMany({
      where: { crewTagId },
      include: {
        crewMember: true,
      },
    });
  }
}
