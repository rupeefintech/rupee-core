import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

/**
 * Neon serverless with pgbouncer needs special pool settings:
 *  - connection_limit=1: pgbouncer manages the pool, not Prisma
 *  - pool_timeout=0: don't queue — fail fast and let pgbouncer handle it
 *  - idle timeout short: don't hold stale connections the pooler will kill
 */
function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

/**
 * Wait for Neon serverless DB to wake up (cold start can take 1-3s).
 * Retries up to 5 times with increasing delay.
 */
export async function ensureDbReady(retries = 5): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$queryRaw`SELECT 1`
      return
    } catch (err) {
      if (i < retries - 1) {
        const delay = (i + 1) * 1000 // 1s, 2s, 3s...
        console.warn(`  ⚠ DB not ready (attempt ${i + 1}/${retries}), retrying in ${delay}ms...`)
        await new Promise(r => setTimeout(r, delay))
      } else {
        console.error('  ❌ DB connection failed after retries:', (err as Error).message)
        throw err
      }
    }
  }
}

export default prisma
