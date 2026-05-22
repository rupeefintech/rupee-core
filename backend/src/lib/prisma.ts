import { config } from 'dotenv'
import { resolve } from 'path'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Load env before anything accesses process.env
config({ path: resolve(__dirname, '../../.env') })

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is not set in backend/.env')

  const pool    = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

/**
 * Wait for Neon serverless DB to wake up (cold start can take 1-3s).
 */
export async function ensureDbReady(retries = 5): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$queryRaw`SELECT 1`
      return
    } catch (err) {
      if (i < retries - 1) {
        const delay = (i + 1) * 1000
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
