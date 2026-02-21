import { Test } from '@nestjs/testing';
import { CrewActivityRepository } from './crew-activity.repository.js';
import { DatabaseService } from '../../database/database.service.js';

describe('CrewActivityRepository', () => {
  let repository: CrewActivityRepository;
  let databaseService: DatabaseService;

  const mockPrisma = {
    crewActivity: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    crewAttendance: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CrewActivityRepository,
        {
          provide: DatabaseService,
          useValue: { prisma: mockPrisma },
        },
      ],
    }).compile();

    repository = module.get<CrewActivityRepository>(CrewActivityRepository);
    databaseService = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a crew activity', async () => {
      const data = {
        crewId: 'crew-1',
        title: 'Morning Run',
        description: '5K easy run',
        activityDate: new Date('2026-02-20'),
        location: 'Han River Park',
        latitude: 37.5326,
        longitude: 127.024612,
        createdBy: 'user-1',
        qrCode: 'qr-unique-code',
      };

      const expected = {
        id: 'activity-1',
        ...data,
        createdAt: new Date(),
      };

      mockPrisma.crewActivity.create.mockResolvedValue(expected);

      const result = await repository.create(data);

      expect(result).toEqual(expected);
      expect(mockPrisma.crewActivity.create).toHaveBeenCalledWith({
        data,
      });
    });
  });

  describe('findByCrewId', () => {
    it('should find activities with cursor pagination', async () => {
      const crewId = 'crew-1';
      const cursor = 'activity-2';
      const limit = 10;

      const expected = [
        {
          id: 'activity-1',
          crewId,
          title: 'Morning Run',
          activityDate: new Date('2026-02-20'),
        },
      ];

      mockPrisma.crewActivity.findMany.mockResolvedValue(expected);

      const result = await repository.findByCrewId(crewId, { cursor, limit });

      expect(result).toEqual(expected);
      expect(mockPrisma.crewActivity.findMany).toHaveBeenCalledWith({
        where: { crewId },
        orderBy: { activityDate: 'desc' },
        take: limit + 1,
        skip: 1,
        cursor: { id: cursor },
        include: {
          attendances: {
            select: {
              userId: true,
              status: true,
              checkedAt: true,
              method: true,
              rsvpAt: true,
            },
          },
        },
      });
    });

    it('should find activities without cursor', async () => {
      const crewId = 'crew-1';
      const limit = 20;

      const expected = [
        {
          id: 'activity-1',
          crewId,
          title: 'Evening Run',
          activityDate: new Date('2026-02-21'),
        },
      ];

      mockPrisma.crewActivity.findMany.mockResolvedValue(expected);

      const result = await repository.findByCrewId(crewId, { limit });

      expect(result).toEqual(expected);
      expect(mockPrisma.crewActivity.findMany).toHaveBeenCalledWith({
        where: { crewId },
        orderBy: { activityDate: 'desc' },
        take: limit + 1,
        include: {
          attendances: {
            select: {
              userId: true,
              status: true,
              checkedAt: true,
              method: true,
              rsvpAt: true,
            },
          },
        },
      });
    });
  });

  describe('findById', () => {
    it('should find an activity by id with attendances', async () => {
      const id = 'activity-1';
      const expected = {
        id,
        crewId: 'crew-1',
        title: 'Morning Run',
        activityDate: new Date('2026-02-20'),
        attendances: [
          { userId: 'user-1', checkedAt: new Date(), method: 'QR' },
          { userId: 'user-2', checkedAt: new Date(), method: 'MANUAL' },
        ],
      };

      mockPrisma.crewActivity.findUnique.mockResolvedValue(expected);

      const result = await repository.findById(id);

      expect(result).toEqual(expected);
      expect(mockPrisma.crewActivity.findUnique).toHaveBeenCalledWith({
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
            orderBy: { rsvpAt: 'asc' },
          },
        },
      });
    });
  });

  describe('update', () => {
    it('should update a crew activity', async () => {
      const id = 'activity-1';
      const data = {
        title: 'Updated Run',
        description: '10K tempo run',
      };

      const expected = {
        id,
        crewId: 'crew-1',
        ...data,
        activityDate: new Date('2026-02-20'),
        createdBy: 'user-1',
        createdAt: new Date(),
      };

      mockPrisma.crewActivity.update.mockResolvedValue(expected);

      const result = await repository.update(id, data);

      expect(result).toEqual(expected);
      expect(mockPrisma.crewActivity.update).toHaveBeenCalledWith({
        where: { id },
        data,
      });
    });
  });

  describe('remove', () => {
    it('should delete a crew activity', async () => {
      const id = 'activity-1';
      const expected = {
        id,
        crewId: 'crew-1',
        title: 'Old Activity',
        activityDate: new Date('2026-01-01'),
      };

      mockPrisma.crewActivity.delete.mockResolvedValue(expected);

      const result = await repository.remove(id);

      expect(result).toEqual(expected);
      expect(mockPrisma.crewActivity.delete).toHaveBeenCalledWith({
        where: { id },
      });
    });
  });

  describe('checkIn', () => {
    it('should update attendance to CHECKED_IN for an activity', async () => {
      const activityId = 'activity-1';
      const userId = 'user-1';
      const method = 'QR';

      const expected = {
        id: 'attendance-1',
        activityId,
        userId,
        method,
        status: 'CHECKED_IN',
        checkedAt: expect.any(Date),
      };

      mockPrisma.crewAttendance.update = jest.fn().mockResolvedValue(expected);

      const result = await repository.checkIn(activityId, userId, method);

      expect(result).toEqual(expected);
      expect(mockPrisma.crewAttendance.update).toHaveBeenCalledWith({
        where: { activityId_userId: { activityId, userId } },
        data: { status: 'CHECKED_IN', method, checkedAt: expect.any(Date) },
      });
    });

    it('should use default method MANUAL if not provided', async () => {
      const activityId = 'activity-1';
      const userId = 'user-1';

      const expected = {
        id: 'attendance-2',
        activityId,
        userId,
        method: 'MANUAL',
        status: 'CHECKED_IN',
        checkedAt: expect.any(Date),
      };

      mockPrisma.crewAttendance.update = jest.fn().mockResolvedValue(expected);

      const result = await repository.checkIn(activityId, userId);

      expect(result).toEqual(expected);
      expect(mockPrisma.crewAttendance.update).toHaveBeenCalledWith({
        where: { activityId_userId: { activityId, userId } },
        data: { status: 'CHECKED_IN', method: 'MANUAL', checkedAt: expect.any(Date) },
      });
    });
  });

  describe('findAttendance', () => {
    it('should find attendance record for a user and activity', async () => {
      const activityId = 'activity-1';
      const userId = 'user-1';

      const expected = {
        id: 'attendance-1',
        activityId,
        userId,
        method: 'QR',
        checkedAt: new Date(),
      };

      mockPrisma.crewAttendance.findUnique.mockResolvedValue(expected);

      const result = await repository.findAttendance(activityId, userId);

      expect(result).toEqual(expected);
      expect(mockPrisma.crewAttendance.findUnique).toHaveBeenCalledWith({
        where: {
          activityId_userId: {
            activityId,
            userId,
          },
        },
      });
    });

    it('should return null if attendance not found', async () => {
      const activityId = 'activity-1';
      const userId = 'user-2';

      mockPrisma.crewAttendance.findUnique.mockResolvedValue(null);

      const result = await repository.findAttendance(activityId, userId);

      expect(result).toBeNull();
    });
  });

  describe('getAttendees', () => {
    it('should get all attendees for an activity', async () => {
      const activityId = 'activity-1';

      const expected = [
        {
          id: 'attendance-1',
          userId: 'user-1',
          method: 'QR',
          checkedAt: new Date(),
        },
        {
          id: 'attendance-2',
          userId: 'user-2',
          method: 'MANUAL',
          checkedAt: new Date(),
        },
      ];

      mockPrisma.crewAttendance.findMany.mockResolvedValue(expected);

      const result = await repository.getAttendees(activityId);

      expect(result).toEqual(expected);
      expect(mockPrisma.crewAttendance.findMany).toHaveBeenCalledWith({
        where: { activityId },
        orderBy: { rsvpAt: 'asc' },
        include: { user: { select: { id: true, name: true, profileImage: true } } },
      });
    });
  });
});
