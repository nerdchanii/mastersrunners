// Jest mock for @masters/database
// Prevents real Prisma client from loading (ESM + DB connection)
// All tests mock DatabaseService, so this is never called directly
export const prisma = {};
export const PrismaClient = class {};
