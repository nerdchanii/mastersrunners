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

  async getMemberAttendanceStats(crewId: string, userId: string) {
    const attendances = await this.databaseService.prisma.crewAttendance.findMany({
      where: {
        userId,
        activity: { crewId },
      },
      include: {
        activity: { select: { activityType: true, status: true, activityDate: true } },
      },
    });

    const official = { total: 0, rsvp: 0, checkedIn: 0, noShow: 0, rate: 0 };
    const popUp = { total: 0, rsvp: 0, checkedIn: 0, noShow: 0, rate: 0 };

    for (const a of attendances) {
      if (a.activity.status !== 'COMPLETED' && a.activity.status !== 'CANCELLED') continue;
      const bucket = a.activity.activityType === 'OFFICIAL' ? official : popUp;
      bucket.total++;
      if (a.status === 'CHECKED_IN') bucket.checkedIn++;
      else if (a.status === 'NO_SHOW') bucket.noShow++;
      else if (a.status === 'RSVP') bucket.rsvp++;
    }

    official.rate = official.total > 0 ? Math.round((official.checkedIn / official.total) * 100) : 0;
    popUp.rate = popUp.total > 0 ? Math.round((popUp.checkedIn / popUp.total) * 100) : 0;

    // Monthly stats (last 6 months)
    const monthly: { month: string; officialRate: number; popUpRate: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);

      let offTotal = 0, offChecked = 0, popTotal = 0, popChecked = 0;
      for (const a of attendances) {
        const actDate = new Date(a.activity.activityDate);
        if (actDate < d || actDate > monthEnd) continue;
        if (a.activity.status !== 'COMPLETED') continue;
        if (a.activity.activityType === 'OFFICIAL') {
          offTotal++;
          if (a.status === 'CHECKED_IN') offChecked++;
        } else {
          popTotal++;
          if (a.status === 'CHECKED_IN') popChecked++;
        }
      }
      monthly.push({
        month: monthStr,
        officialRate: offTotal > 0 ? Math.round((offChecked / offTotal) * 100) : 0,
        popUpRate: popTotal > 0 ? Math.round((popChecked / popTotal) * 100) : 0,
      });
    }

    return { official, popUp, monthly };
  }

  async getCrewAttendanceStats(crewId: string, opts?: { month?: string; type?: string }) {
    const whereActivity: Record<string, unknown> = { crewId, status: 'COMPLETED' };
    if (opts?.type) whereActivity.activityType = opts.type;

    if (opts?.month) {
      const [year, mon] = opts.month.split('-').map(Number);
      whereActivity.activityDate = {
        gte: new Date(year, mon - 1, 1),
        lt: new Date(year, mon, 1),
      };
    }

    const activities = await this.databaseService.prisma.crewActivity.findMany({
      where: whereActivity,
      orderBy: { activityDate: 'desc' },
      include: {
        attendances: {
          select: { userId: true, status: true },
        },
      },
    });

    // Overall crew rate
    let totalAttendances = 0;
    let totalCheckedIn = 0;

    const activityStats = activities.map((act) => {
      const checkedIn = act.attendances.filter((a) => a.status === 'CHECKED_IN').length;
      const noShow = act.attendances.filter((a) => a.status === 'NO_SHOW').length;
      const total = act.attendances.filter((a) => a.status !== 'CANCELLED').length;
      totalAttendances += total;
      totalCheckedIn += checkedIn;
      return {
        id: act.id,
        title: act.title,
        activityDate: act.activityDate,
        activityType: act.activityType,
        total,
        checkedIn,
        noShow,
        rate: total > 0 ? Math.round((checkedIn / total) * 100) : 0,
      };
    });

    // Member stats across all these activities
    const memberMap = new Map<string, { total: number; checkedIn: number; noShow: number }>();
    for (const act of activities) {
      for (const att of act.attendances) {
        if (att.status === 'CANCELLED') continue;
        if (!memberMap.has(att.userId)) memberMap.set(att.userId, { total: 0, checkedIn: 0, noShow: 0 });
        const m = memberMap.get(att.userId)!;
        m.total++;
        if (att.status === 'CHECKED_IN') m.checkedIn++;
        else if (att.status === 'NO_SHOW') m.noShow++;
      }
    }

    // Fetch user info for member stats
    const userIds = [...memberMap.keys()];
    const users = userIds.length > 0
      ? await this.databaseService.prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, profileImage: true },
        })
      : [];

    const userMap = new Map(users.map((u) => [u.id, u]));
    const memberStats = [...memberMap.entries()]
      .map(([userId, stats]) => ({
        userId,
        user: userMap.get(userId) ?? { id: userId, name: '알 수 없음', profileImage: null },
        total: stats.total,
        checkedIn: stats.checkedIn,
        noShow: stats.noShow,
        rate: stats.total > 0 ? Math.round((stats.checkedIn / stats.total) * 100) : 0,
      }))
      .sort((a, b) => b.rate - a.rate || b.checkedIn - a.checkedIn);

    return {
      activities: activityStats,
      memberStats,
      overallRate: totalAttendances > 0 ? Math.round((totalCheckedIn / totalAttendances) * 100) : 0,
    };
  }
}
