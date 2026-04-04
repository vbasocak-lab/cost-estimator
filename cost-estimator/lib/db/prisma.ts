import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";

// Note: Pool uses WebSocket connections to Neon.
// Cloudflare Workers isolates are short-lived, so connection accumulation
// is bounded. Upgrade to Prisma 6 + neon() HTTP adapter for full stateless support.
function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL ?? "";
  const isNeon =
    connectionString.includes("neon.tech") ||
    connectionString.includes("neon.database") ||
    connectionString.includes("pooler.neon");

  if (isNeon) {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool);
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }

  // Local/standard PostgreSQL should use Prisma's native engine adapter.
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
