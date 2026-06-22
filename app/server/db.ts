// Prisma client singleton (server-only). Reused across hot reloads in dev.
// Inert until a real DATABASE_URL is set + `prisma migrate` has run.
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
