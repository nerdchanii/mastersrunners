import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient as _PrismaClient } from "../generated/prisma/client.js";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Absolute path to SQLite database regardless of runtime cwd
const dbPath = path.resolve(__dirname, "..", "dev.db");

function createPrismaClient() {
  const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
  return new _PrismaClient({ adapter });
}

export const PrismaClient = _PrismaClient;

type PrismaClientInstance = InstanceType<typeof _PrismaClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientInstance | undefined;
};

export const prisma: PrismaClientInstance =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
