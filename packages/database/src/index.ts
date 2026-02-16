export { prisma, PrismaClient } from "./client.js";
export { Prisma } from "../generated/prisma/client.js";
export type * from "../generated/prisma/client.js";

// Convenience re-export for $transaction callback typing
export type { TransactionClient } from "../generated/prisma/internal/prismaNamespace.js";
