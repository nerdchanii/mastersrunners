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
  activityType?: string;
  workoutTypeId?: string;
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

  async findByCrewId(crewId: string, opts?: { cursor?: string; limit?: number; type?: string; status?: string }) {
    const limit = opts?.limit ?? 20;
    return this.databaseService.prisma.crewActivity.findMany({
      where: {
        crewId,
        ...(opts?.type && { activityType: opts.type }),
        ...(opts?.status && { status: opts.status }),
      },
      orderBy: { activityDate: 'desc' },
      take: limit + 1,
      ...(opts?.cursor && { skip: 1, cursor: { id: opts.cursor } }),
      include: {
        attendances: {
          select: { userId: true, status: true, checkedAt: true, method: true, rsvpAt: true },
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
            id: true, userId: true, status: true, method: true, rsvpAt: true, checkedAt: true, checkedBy: true,
            user: { select: { id: true, name: true, profileImage: true } },
          },
          orderBy: { rsvpAt: 'asc' },
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

  async rsvp(activityId: string, userId: string) {
    return this.databaseService.prisma.crewAttendance.create({
      data: { activityId, userId, status: 'RSVP' },
    });
  }

  async cancelRsvp(activityId: string, userId: string) {
    return this.databaseService.prisma.crewAttendance.update({
      where: { activityId_userId: { activityId, userId } },
      data: { status: 'CANCELLED' },
    });
  }

  async checkIn(activityId: string, userId: string, method: string = 'MANUAL') {
    return this.databaseService.prisma.crewAttendance.update({
      where: { activityId_userId: { activityId, userId } },
      data: { status: 'CHECKED_IN', method, checkedAt: new Date() },
    });
  }

  async adminCheckIn(activityId: string, userId: string, checkedBy: string) {
    return this.databaseService.prisma.crewAttendance.update({
      where: { activityId_userId: { activityId, userId } },
      data: { status: 'CHECKED_IN', method: 'ADMIN_MANUAL', checkedAt: new Date(), checkedBy },
    });
  }

  async completeActivity(activityId: string) {
    const activity = await this.databaseService.prisma.crewActivity.update({
      where: { id: activityId },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
    await this.databaseService.prisma.crewAttendance.updateMany({
      where: { activityId, status: 'RSVP' },
      data: { status: 'NO_SHOW' },
    });
    return activity;
  }

  async cancelActivity(activityId: string) {
    return this.databaseService.prisma.crewActivity.update({
      where: { id: activityId },
      data: { status: 'CANCELLED' },
    });
  }

  async getAttendees(activityId: string, statusFilter?: string) {
    return this.databaseService.prisma.crewAttendance.findMany({
      where: {
        activityId,
        ...(statusFilter && { status: statusFilter }),
      },
      orderBy: { rsvpAt: 'asc' },
      include: { user: { select: { id: true, name: true, profileImage: true } } },
    });
  }
}
