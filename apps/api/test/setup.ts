// Set test DATABASE_URL BEFORE anything else loads (Prisma singleton reads it on first import)
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  "postgresql://test:test@localhost:5433/masters_runners_test";
process.env.NODE_ENV = "test";
// Provide JWT_SECRET for auth module
process.env.JWT_SECRET = process.env.JWT_SECRET || "e2e-test-jwt-secret";
process.env.JWT_ACCESS_TTL = process.env.JWT_ACCESS_TTL || "900";
process.env.JWT_REFRESH_TTL = process.env.JWT_REFRESH_TTL || "604800";

import "reflect-metadata";
import { Test } from "@nestjs/testing";
import { ValidationPipe, type INestApplication } from "@nestjs/common";
import { AppModule } from "../src/app.module";
import { DatabaseService } from "../src/database/database.service";
import { AllExceptionsFilter } from "../src/common/filters/http-exception.filter";

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

  app = moduleRef.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.setGlobalPrefix("api/v1", {
    exclude: ["health"],
  });

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

  // Delete in reverse dependency order
  await prisma.crewAttendance.deleteMany();
  await prisma.crewActivity.deleteMany();
  await prisma.crewMemberTag.deleteMany();
  await prisma.crewTag.deleteMany();
  await prisma.crewBan.deleteMany();
  await prisma.crewMember.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.syncLog.deleteMany();
  await prisma.connectedPlatform.deleteMany();
  await prisma.eventParticipant.deleteMany();
  await prisma.event.deleteMany();
  await prisma.challengeParticipant.deleteMany();
  await prisma.challengeTeam.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.crew.deleteMany();
  await prisma.workoutComment.deleteMany();
  await prisma.workoutLike.deleteMany();
  await prisma.postComment.deleteMany();
  await prisma.postLike.deleteMany();
  await prisma.postWorkout.deleteMany();
  await prisma.postImage.deleteMany();
  await prisma.post.deleteMany();
  await prisma.workoutPhoto.deleteMany();
  await prisma.workoutLap.deleteMany();
  await prisma.workoutRoute.deleteMany();
  await prisma.workoutFile.deleteMany();
  await prisma.workout.deleteMany();
  await prisma.shoe.deleteMany();
  await prisma.block.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
}

/**
 * Shut down the test application and disconnect from the database.
 */
export async function closeTestApp(): Promise<void> {
  if (app) {
    await app.close();
  }
}
