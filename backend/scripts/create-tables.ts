/**
 * create-tables.ts
 * Creates any missing tables that can't be added via prisma migrate dev.
 * Safe to re-run — all statements use IF NOT EXISTS.
 *
 * Run:
 *   npx ts-node --project tsconfig.scripts.json scripts/create-tables.ts
 */

import { prisma } from '../src/lib/prisma';

const statements = [
  // ── contact_messages ─────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS contact_messages (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(150) NOT NULL,
    subject    VARCHAR(200) NOT NULL,
    message    TEXT         NOT NULL,
    is_read    BOOLEAN      DEFAULT FALSE,
    ip_hash    VARCHAR(16),
    created_at TIMESTAMPTZ  DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS idx_contact_messages_is_read
     ON contact_messages(is_read)`,

  // ── users ─────────────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS users (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(150) NOT NULL UNIQUE,
    source     VARCHAR(50)  DEFAULT 'contact_form',
    is_active  BOOLEAN      DEFAULT TRUE,
    notes      TEXT,
    created_at TIMESTAMPTZ  DEFAULT NOW(),
    updated_at TIMESTAMPTZ  DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS idx_users_email  ON users(email)`,
  `CREATE INDEX IF NOT EXISTS idx_users_source ON users(source)`,
];

async function run() {
  for (const sql of statements) {
    const label = sql.trim().split('\n')[0].slice(0, 60);
    try {
      await prisma.$executeRawUnsafe(sql);
      console.log(`✓ ${label}`);
    } catch (err: any) {
      console.error(`✗ ${label}\n  ${err.message}`);
    }
  }
  console.log('\nDone.');
}

run()
  .catch(err => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
