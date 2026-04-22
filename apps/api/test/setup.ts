// Set test DATABASE_URL BEFORE anything else loads (Prisma singleton reads it on first import)
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL || "postgresql://test:test@localhost:5433/masters_runners_test";
process.env.NODE_ENV = "test";
// Provide JWT_SECRET for auth module
process.env.JWT_SECRET = process.env.JWT_SECRET || "e2e-test-jwt-secret";
process.env.JWT_ACCESS_TTL = process.env.JWT_ACCESS_TTL || "900";
process.env.JWT_REFRESH_TTL = process.env.JWT_REFRESH_TTL || "604800";

import "reflect-metadata";

import type { INestApplication } from "@nestjs/common";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { Test } from "@nestjs/testing";

import { AppModule } from "../src/app.module.js";
import { configureApp } from "../src/bootstrap/configure-app.js";
import { DatabaseService } from "../src/database/database.service.js";

let app: INestApplication;
let dbService: DatabaseService;

/**
 * Bootstrap the NestJS application for E2E testing.
 * Uses real database (test DB), real modules, no mocking.
 */
export async function createTestApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleRef.createNestApplication<NestExpressApplication>({
    bodyParser: false,
    rawBody: true,
    bufferLogs: true,
  });
  configureApp(app);

  await app.init();

  dbService = moduleRef.get<DatabaseService>(DatabaseService);

  return app;
}

/**
 * Get the DatabaseService instance for direct DB operations in tests.
 */
export function getDbService(): DatabaseService {
  return dbService;
}

/**
 * Clean all test data from the database.
 * Deletes in reverse dependency order to avoid FK violations.
 */
export async function cleanDatabase(): Promise<void> {
  const prisma = dbService.prisma;
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "CrewAttendance",
      "CrewActivity",
      "CrewMemberTag",
      "CrewTag",
      "CrewBan",
      "CrewMember",
      "Notification",
      "SyncLog",
      "ConnectedPlatform",
      "EventParticipant",
      "Event",
      "ChallengeParticipant",
      "ChallengeTeam",
      "Challenge",
      "Crew",
      "WorkoutComment",
      "WorkoutLike",
      "PostComment",
      "PostLike",
      "PostWorkout",
      "PostImage",
      "Post",
      "WorkoutPhoto",
      "WorkoutFile",
      "Workout",
      "Shoe",
      "Block",
      "Follow",
      "Session",
      "VerificationToken",
      "Account",
      "User"
    RESTART IDENTITY CASCADE
  `);
}

/**
 * Shut down the test application and disconnect from the database.
 */
export async function closeTestApp(): Promise<void> {
  if (app) {
    await app.close();
  }
}
