import { Test } from '@nestjs/testing';
import { CrewTagRepository } from './crew-tag.repository.js';
import { DatabaseService } from '../../database/database.service.js';

describe('CrewTagRepository', () => {
  let repository: CrewTagRepository;
  let databaseService: DatabaseService;

  const mockPrisma = {
    crewTag: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    crewMemberTag: {
      create: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CrewTagRepository,
        {
          provide: DatabaseService,
          useValue: { prisma: mockPrisma },
        },
      ],
    }).compile();

    repository = module.get<CrewTagRepository>(CrewTagRepository);
    databaseService = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a crew tag', async () => {
      const crewId = 'crew-1';
      const name = 'Active Members';
      const color = '#FF5733';

      const expected = {
        id: 'tag-1',
        crewId,
        name,
        color,
      };

      mockPrisma.crewTag.create.mockResolvedValue(expected);

      const result = await repository.create(crewId, name, color);

      expect(result).toEqual(expected);
      expect(mockPrisma.crewTag.create).toHaveBeenCalledWith({
        data: {
          crewId,
          name,
          color,
        },
      });
    });

    it('should use default color if not provided', async () => {
      const crewId = 'crew-1';
      const name = 'New Runners';

      const expected = {
        id: 'tag-2',
        crewId,
        name,
        color: '#3B82F6',
      };

      mockPrisma.crewTag.create.mockResolvedValue(expected);

      const result = await repository.create(crewId, name);

      expect(result).toEqual(expected);
      expect(mockPrisma.crewTag.create).toHaveBeenCalledWith({
        data: {
          crewId,
          name,
          color: '#3B82F6',
        },
      });
    });
  });

  describe('findByCrewId', () => {
    it('should find all tags for a crew', async () => {
      const crewId = 'crew-1';
      const expected = [
        { id: 'tag-1', crewId, name: 'Active', color: '#FF5733' },
        { id: 'tag-2', crewId, name: 'New', color: '#3B82F6' },
      ];

      mockPrisma.crewTag.findMany.mockResolvedValue(expected);

      const result = await repository.findByCrewId(crewId);

      expect(result).toEqual(expected);
      expect(mockPrisma.crewTag.findMany).toHaveBeenCalledWith({
        where: { crewId },
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('update', () => {
    it('should update a crew tag', async () => {
      const id = 'tag-1';
      const data = { name: 'Veterans', color: '#00FF00' };

      const expected = {
        id,
        crewId: 'crew-1',
        ...data,
      };

      mockPrisma.crewTag.update.mockResolvedValue(expected);

      const result = await repository.update(id, data);

      expect(result).toEqual(expected);
      expect(mockPrisma.crewTag.update).toHaveBeenCalledWith({
        where: { id },
        data,
      });
    });
  });

  describe('remove', () => {
    it('should delete a crew tag', async () => {
      const id = 'tag-1';
      const expected = {
        id,
        crewId: 'crew-1',
        name: 'Old Tag',
        color: '#FF0000',
      };

      mockPrisma.crewTag.delete.mockResolvedValue(expected);

      const result = await repository.remove(id);

      expect(result).toEqual(expected);
      expect(mockPrisma.crewTag.delete).toHaveBeenCalledWith({
        where: { id },
      });
    });
  });

  describe('assignToMember', () => {
    it('should assign a tag to a crew member', async () => {
      const crewMemberId = 'member-1';
      const crewTagId = 'tag-1';

      const expected = {
        crewMemberId,
        crewTagId,
      };

      mockPrisma.crewMemberTag.create.mockResolvedValue(expected);

      const result = await repository.assignToMember(crewMemberId, crewTagId);

      expect(result).toEqual(expected);
      expect(mockPrisma.crewMemberTag.create).toHaveBeenCalledWith({
        data: {
          crewMemberId,
          crewTagId,
        },
      });
    });
  });

  describe('removeFromMember', () => {
    it('should remove a tag from a crew member', async () => {
      const crewMemberId = 'member-1';
      const crewTagId = 'tag-1';

      const expected = {
        crewMemberId,
        crewTagId,
      };

      mockPrisma.crewMemberTag.delete.mockResolvedValue(expected);

      const result = await repository.removeFromMember(crewMemberId, crewTagId);

      expect(result).toEqual(expected);
      expect(mockPrisma.crewMemberTag.delete).toHaveBeenCalledWith({
        where: {
          crewMemberId_crewTagId: {
            crewMemberId,
            crewTagId,
          },
        },
      });
    });
  });

  describe('findMembersByTag', () => {
    it('should find all members with a specific tag', async () => {
      const crewTagId = 'tag-1';
      const expected = [
        {
          crewMemberId: 'member-1',
          crewTagId,
          crewMember: {
            id: 'member-1',
            userId: 'user-1',
            crewId: 'crew-1',
            role: 'MEMBER',
          },
        },
        {
          crewMemberId: 'member-2',
          crewTagId,
          crewMember: {
            id: 'member-2',
            userId: 'user-2',
            crewId: 'crew-1',
            role: 'MEMBER',
          },
        },
      ];

      mockPrisma.crewMemberTag.findMany.mockResolvedValue(expected);

      const result = await repository.findMembersByTag(crewTagId);

      expect(result).toEqual(expected);
      expect(mockPrisma.crewMemberTag.findMany).toHaveBeenCalledWith({
        where: { crewTagId },
        include: {
          crewMember: true,
        },
      });
    });
  });
});
