import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../database/database.service.js";

@Injectable()
export class CrewMemberRepository {
  constructor(private readonly db: DatabaseService) {}

  async addMember(
    crewId: string,
    userId: string,
    role: string = "MEMBER",
    status: string = "ACTIVE"
  ) {
    return this.db.prisma.crewMember.create({
      data: { crewId, userId, role, status },
    });
  }

  async removeMember(crewId: string, userId: string) {
    return this.db.prisma.crewMember.delete({
      where: { crewId_userId: { crewId, userId } },
    });
  }

  async updateRole(crewId: string, userId: string, role: string) {
    return this.db.prisma.crewMember.update({
      where: { crewId_userId: { crewId, userId } },
      data: { role },
    });
  }

  async findMembers(crewId: string, status?: string) {
    const where: { crewId: string; status?: string } = { crewId };
    if (status) {
      where.status = status;
    }

    return this.db.prisma.crewMember.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
      orderBy: { joinedAt: "asc" },
    });
  }

  async findMember(crewId: string, userId: string) {
    return this.db.prisma.crewMember.findUnique({
      where: { crewId_userId: { crewId, userId } },
    });
  }

  async countMembers(crewId: string) {
    return this.db.prisma.crewMember.count({
      where: { crewId, status: "ACTIVE" },
    });
  }

  async updateStatus(crewId: string, userId: string, status: string) {
    return this.db.prisma.crewMember.update({
      where: { crewId_userId: { crewId, userId } },
      data: { status },
    });
  }

  async findPendingMembers(crewId: string) {
    return this.db.prisma.crewMember.findMany({
      where: { crewId, status: "PENDING" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
      orderBy: { joinedAt: "asc" },
    });
  }
}
