import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';

interface CreateActivityData {
  crewId: string;
  title: string;
  description?: string;
  activityDate: Date;
  location?: string;
  latitude?: number;
  longitude?: number;
  createdBy: string;
  qrCode?: string;
}

interface UpdateActivityData {
  title?: string;
  description?: string;
  activityDate?: Date;
  location?: string;
  latitude?: number;
  longitude?: number;
}

@Injectable()
export class CrewActivityRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(data: CreateActivityData) {
    return this.databaseService.prisma.crewActivity.create({
      data,
    });
  }

  async findByCrewId(crewId: string, cursor?: string, limit: number = 20) {
    return this.databaseService.prisma.crewActivity.findMany({
      where: { crewId },
      orderBy: { activityDate: 'desc' },
      take: limit + 1,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
      include: {
        attendances: {
          select: {
            userId: true,
            checkedAt: true,
            method: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return this.databaseService.prisma.crewActivity.findUnique({
      where: { id },
      include: {
        attendances: {
          select: {
            id: true,
            userId: true,
            checkedAt: true,
            method: true,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateActivityData) {
    return this.databaseService.prisma.crewActivity.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.databaseService.prisma.crewActivity.delete({
      where: { id },
    });
  }

  async checkIn(activityId: string, userId: string, method: string = 'QR') {
    return this.databaseService.prisma.crewAttendance.create({
      data: {
        activityId,
        userId,
        method,
      },
    });
  }

  async findAttendance(activityId: string, userId: string) {
    return this.databaseService.prisma.crewAttendance.findUnique({
      where: {
        activityId_userId: {
          activityId,
          userId,
        },
      },
    });
  }

  async getAttendees(activityId: string) {
    return this.databaseService.prisma.crewAttendance.findMany({
      where: { activityId },
      orderBy: { checkedAt: 'asc' },
    });
  }
}
