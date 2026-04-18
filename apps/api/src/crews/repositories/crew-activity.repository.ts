import { Injectable } from "@nestjs/common";

import { DatabaseService } from "../../database/database.service.js";

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
  activityIcon?: string | null;
  workoutTypeId?: string;
}

interface UpdateActivityData {
  title?: string;
  description?: string;
  activityDate?: Date;
  location?: string;
  latitude?: number;
  longitude?: number;
  activityIcon?: string | null;
}

type AttendanceDashboardOptions = {
  range?: string;
  type?: string;
  sort?: string;
  order?: string;
  q?: string;
  checkInLte?: number;
  noShowGte?: number;
  limit?: number;
};

@Injectable()
export class CrewActivityRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private resolveRangeStart(range?: string) {
    const normalized = range?.toLowerCase();
    if (!normalized || normalized === "all") {
      return undefined;
    }

    const now = new Date();
    const start = new Date(now);
    if (normalized === "30d") start.setDate(now.getDate() - 30);
    else if (normalized === "monthly") start.setDate(1);
    else if (normalized === "10w") start.setDate(now.getDate() - 70);
    else if (normalized === "12w") start.setDate(now.getDate() - 84);
    else if (normalized === "90d") start.setDate(now.getDate() - 90);
    else if (normalized === "180d") start.setDate(now.getDate() - 180);
    else if (normalized === "365d") start.setDate(now.getDate() - 365);
    else return undefined;

    return start;
  }

  private buildActivityWhere(crewId: string, opts?: { range?: string; type?: string }) {
    const activityDateGte = this.resolveRangeStart(opts?.range);
    const activityType = opts?.type && opts.type !== "ALL" ? opts.type.toUpperCase() : undefined;

    return {
      crewId,
      status: "COMPLETED",
      ...(activityType ? { activityType } : {}),
      ...(activityDateGte ? { activityDate: { gte: activityDateGte } } : {}),
    };
  }

  private sortMemberRows<
    T extends {
      checkedIn: number;
      noShow: number;
      rate: number;
      lastActivityAt: string | null;
      user: { name: string };
    },
  >(rows: T[], opts?: { sort?: string; order?: string }) {
    const direction = opts?.order === "asc" ? 1 : -1;
    const sort = opts?.sort ?? "checkedIn";

    return rows.sort((a, b) => {
      const lastActivityA = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0;
      const lastActivityB = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0;

      if (sort === "name") {
        return direction * a.user.name.localeCompare(b.user.name, "ko");
      }
      if (sort === "noShow") {
        if (a.noShow !== b.noShow) return direction * (a.noShow - b.noShow);
      } else if (sort === "rate") {
        if (a.rate !== b.rate) return direction * (a.rate - b.rate);
      } else if (sort === "lastActivity") {
        if (lastActivityA !== lastActivityB) return direction * (lastActivityA - lastActivityB);
      } else {
        if (a.checkedIn !== b.checkedIn) return direction * (a.checkedIn - b.checkedIn);
      }

      if (a.checkedIn !== b.checkedIn) return b.checkedIn - a.checkedIn;
      if (a.noShow !== b.noShow) return a.noShow - b.noShow;
      if (lastActivityA !== lastActivityB) return lastActivityB - lastActivityA;
      return a.user.name.localeCompare(b.user.name, "ko");
    });
  }

  async create(data: CreateActivityData) {
    return this.databaseService.prisma.crewActivity.create({
      data,
    });
  }

  async findByCrewId(
    crewId: string,
    opts?: { cursor?: string; limit?: number; type?: string; status?: string },
  ) {
    const limit = opts?.limit ?? 20;
    return this.databaseService.prisma.crewActivity.findMany({
      where: {
        crewId,
        ...(opts?.type && { activityType: opts.type }),
        ...(opts?.status && { status: opts.status }),
      },
      orderBy: { activityDate: "desc" },
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
            id: true,
            userId: true,
            status: true,
            method: true,
            rsvpAt: true,
            checkedAt: true,
            checkedBy: true,
            user: { select: { id: true, name: true, profileImage: true } },
          },
          orderBy: { rsvpAt: "asc" },
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
      data: { activityId, userId, status: "RSVP" },
    });
  }

  async restoreRsvp(activityId: string, userId: string) {
    return this.databaseService.prisma.crewAttendance.update({
      where: { activityId_userId: { activityId, userId } },
      data: {
        status: "RSVP",
        rsvpAt: new Date(),
        method: null,
        checkedAt: null,
        checkedBy: null,
      },
    });
  }

  async cancelRsvp(activityId: string, userId: string) {
    return this.databaseService.prisma.crewAttendance.update({
      where: { activityId_userId: { activityId, userId } },
      data: { status: "CANCELLED" },
    });
  }

  async checkIn(activityId: string, userId: string, method: string = "MANUAL") {
    return this.databaseService.prisma.crewAttendance.update({
      where: { activityId_userId: { activityId, userId } },
      data: { status: "CHECKED_IN", method, checkedAt: new Date() },
    });
  }

  async adminCheckIn(activityId: string, userId: string, checkedBy: string) {
    return this.databaseService.prisma.crewAttendance.update({
      where: { activityId_userId: { activityId, userId } },
      data: { status: "CHECKED_IN", method: "ADMIN_MANUAL", checkedAt: new Date(), checkedBy },
    });
  }

  async completeActivity(activityId: string) {
    const activity = await this.databaseService.prisma.crewActivity.update({
      where: { id: activityId },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
    await this.databaseService.prisma.crewAttendance.updateMany({
      where: { activityId, status: "RSVP" },
      data: { status: "NO_SHOW" },
    });
    return activity;
  }

  async cancelActivity(activityId: string) {
    return this.databaseService.prisma.crewActivity.update({
      where: { id: activityId },
      data: { status: "CANCELLED" },
    });
  }

  async updateChatConversationId(activityId: string, conversationId: string) {
    return this.databaseService.prisma.crewActivity.update({
      where: { id: activityId },
      data: { chatConversationId: conversationId },
    });
  }

  async getAttendees(activityId: string, statusFilter?: string) {
    return this.databaseService.prisma.crewAttendance.findMany({
      where: {
        activityId,
        ...(statusFilter && { status: statusFilter }),
      },
      orderBy: { rsvpAt: "asc" },
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
      if (a.activity.status !== "COMPLETED" && a.activity.status !== "CANCELLED") continue;
      const bucket = a.activity.activityType === "OFFICIAL" ? official : popUp;
      bucket.total++;
      if (a.status === "CHECKED_IN") bucket.checkedIn++;
      else if (a.status === "NO_SHOW") bucket.noShow++;
      else if (a.status === "RSVP") bucket.rsvp++;
    }

    official.rate =
      official.total > 0 ? Math.round((official.checkedIn / official.total) * 100) : 0;
    popUp.rate = popUp.total > 0 ? Math.round((popUp.checkedIn / popUp.total) * 100) : 0;

    // Monthly stats (last 6 months)
    const monthly: { month: string; officialRate: number; popUpRate: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);

      let offTotal = 0,
        offChecked = 0,
        popTotal = 0,
        popChecked = 0;
      for (const a of attendances) {
        const actDate = new Date(a.activity.activityDate);
        if (actDate < d || actDate > monthEnd) continue;
        if (a.activity.status !== "COMPLETED") continue;
        if (a.activity.activityType === "OFFICIAL") {
          offTotal++;
          if (a.status === "CHECKED_IN") offChecked++;
        } else {
          popTotal++;
          if (a.status === "CHECKED_IN") popChecked++;
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

  async getMemberAttendanceHistory(
    crewId: string,
    userId: string,
    opts?: { range?: string; type?: string },
  ) {
    const activityWhere = this.buildActivityWhere(crewId, opts);

    const attendanceHistory = await this.databaseService.prisma.crewAttendance.findMany({
      where: {
        userId,
        status: { in: ["RSVP", "CHECKED_IN", "NO_SHOW"] },
        activity: activityWhere,
      },
      orderBy: { activity: { activityDate: "desc" } },
      include: {
        user: { select: { id: true, name: true, profileImage: true } },
        activity: {
          select: {
            id: true,
            title: true,
            activityDate: true,
            activityType: true,
            activityIcon: true,
            location: true,
          },
        },
      },
    });

    const checkedIn = attendanceHistory.filter(
      (item: (typeof attendanceHistory)[number]) => item.status === "CHECKED_IN",
    ).length;
    const noShow = attendanceHistory.filter(
      (item: (typeof attendanceHistory)[number]) => item.status === "NO_SHOW",
    ).length;
    const totalEligible = attendanceHistory.length;
    const lastActivityAt = attendanceHistory[0]?.activity.activityDate ?? null;
    const lastCheckedInAt =
      attendanceHistory.find(
        (item: (typeof attendanceHistory)[number]) => item.status === "CHECKED_IN",
      )?.checkedAt ?? null;

    return {
      member: {
        userId,
        user: attendanceHistory[0]?.user ?? { id: userId, name: "알 수 없음", profileImage: null },
        totalEligible,
        checkedIn,
        noShow,
        rate: totalEligible > 0 ? Math.round((checkedIn / totalEligible) * 100) : 0,
        lastActivityAt,
        lastCheckedInAt,
      },
      history: attendanceHistory.map((item: (typeof attendanceHistory)[number]) => ({
        id: item.id,
        activityId: item.activity.id,
        title: item.activity.title,
        activityDate: item.activity.activityDate,
        activityType: item.activity.activityType,
        activityIcon: item.activity.activityIcon,
        location: item.activity.location,
        status: item.status,
        checkedAt: item.checkedAt,
        rsvpAt: item.rsvpAt,
      })),
    };
  }

  async getCrewAttendanceStats(crewId: string, opts?: AttendanceDashboardOptions) {
    const activityWhere = this.buildActivityWhere(crewId, opts);
    const activityLimit = opts?.limit ?? 20;

    const [allActivities, visibleActivities, crewMembers] = await Promise.all([
      this.databaseService.prisma.crewActivity.findMany({
        where: activityWhere,
        orderBy: { activityDate: "desc" },
        include: {
          attendances: {
            select: { userId: true, status: true },
          },
        },
      }),
      this.databaseService.prisma.crewActivity.findMany({
        where: activityWhere,
        orderBy: { activityDate: "desc" },
        take: activityLimit,
        include: {
          attendances: {
            select: { userId: true, status: true },
          },
        },
      }),
      this.databaseService.prisma.crewMember.findMany({
        where: {
          crewId,
          status: "ACTIVE",
          ...(opts?.q
            ? {
                user: {
                  name: {
                    contains: opts.q,
                    mode: "insensitive",
                  },
                },
              }
            : {}),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profileImage: true,
              crewAttendances: {
                where: {
                  status: { in: ["RSVP", "CHECKED_IN", "NO_SHOW"] },
                  activity: activityWhere,
                },
                select: {
                  status: true,
                  checkedAt: true,
                  activity: {
                    select: {
                      activityDate: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    let totalEligible = 0;
    let totalCheckedIn = 0;
    let totalNoShow = 0;

    for (const activity of allActivities) {
      const eligible = activity.attendances.filter(
        (attendance: (typeof activity.attendances)[number]) => attendance.status !== "CANCELLED",
      );
      totalEligible += eligible.length;
      totalCheckedIn += eligible.filter(
        (attendance: (typeof eligible)[number]) => attendance.status === "CHECKED_IN",
      ).length;
      totalNoShow += eligible.filter(
        (attendance: (typeof eligible)[number]) => attendance.status === "NO_SHOW",
      ).length;
    }

    const activities = visibleActivities.map((activity: (typeof visibleActivities)[number]) => {
      const eligible = activity.attendances.filter(
        (attendance: (typeof activity.attendances)[number]) => attendance.status !== "CANCELLED",
      );
      const checkedIn = eligible.filter(
        (attendance: (typeof eligible)[number]) => attendance.status === "CHECKED_IN",
      ).length;
      const noShow = eligible.filter(
        (attendance: (typeof eligible)[number]) => attendance.status === "NO_SHOW",
      ).length;
      const total = eligible.length;

      return {
        id: activity.id,
        title: activity.title,
        activityDate: activity.activityDate,
        activityType: activity.activityType,
        activityIcon: activity.activityIcon,
        location: activity.location,
        total,
        checkedIn,
        noShow,
        rate: total > 0 ? Math.round((checkedIn / total) * 100) : 0,
      };
    });

    const memberRows = crewMembers.map((member: (typeof crewMembers)[number]) => {
      const attendances = member.user.crewAttendances;
      const checkedIn = attendances.filter(
        (attendance: (typeof attendances)[number]) => attendance.status === "CHECKED_IN",
      ).length;
      const noShow = attendances.filter(
        (attendance: (typeof attendances)[number]) => attendance.status === "NO_SHOW",
      ).length;
      const totalEligibleForMember = attendances.length;
      const sortedDates = attendances
        .map((attendance: (typeof attendances)[number]) => attendance.activity.activityDate)
        .sort((a: Date, b: Date) => new Date(b).getTime() - new Date(a).getTime());
      const checkedInDates = attendances
        .filter(
          (attendance: (typeof attendances)[number]) =>
            attendance.status === "CHECKED_IN" && attendance.checkedAt,
        )
        .map((attendance: (typeof attendances)[number]) => attendance.checkedAt as Date)
        .sort((a: Date, b: Date) => b.getTime() - a.getTime());

      return {
        userId: member.userId,
        user: {
          id: member.user.id,
          name: member.user.name,
          profileImage: member.user.profileImage,
        },
        totalEligible: totalEligibleForMember,
        checkedIn,
        noShow,
        rate:
          totalEligibleForMember > 0 ? Math.round((checkedIn / totalEligibleForMember) * 100) : 0,
        lastActivityAt: sortedDates[0] ?? null,
        lastCheckedInAt: checkedInDates[0] ?? null,
      };
    });

    const members = memberRows
      .filter((member: (typeof memberRows)[number]) =>
        opts?.checkInLte !== undefined ? member.checkedIn <= opts.checkInLte : true,
      )
      .filter((member: (typeof memberRows)[number]) =>
        opts?.noShowGte !== undefined ? member.noShow >= opts.noShowGte : true,
      );

    const sortedMembers = this.sortMemberRows(members, {
      sort: opts?.sort,
      order: opts?.order,
    });

    return {
      summary: {
        overallRate: totalEligible > 0 ? Math.round((totalCheckedIn / totalEligible) * 100) : 0,
        activityCount: allActivities.length,
        totalEligible,
        totalCheckedIn,
        totalNoShow,
      },
      activities,
      members: sortedMembers,
    };
  }
}
