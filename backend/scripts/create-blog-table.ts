/**
 * Creates the "blogs" table via raw SQL.
 * Run: cd backend && npx ts-node scripts/create-blog-table.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating blogs table...');

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "blogs" (
      "id"           SERIAL PRIMARY KEY,
      "slug"         VARCHAR(200) NOT NULL UNIQUE,
      "title"        VARCHAR(300) NOT NULL,
      "description"  TEXT NOT NULL,
      "category"     VARCHAR(50) NOT NULL,
      "tags"         TEXT[] DEFAULT '{}',
      "cover_image"  TEXT,
      "content"      TEXT NOT NULL,
      "read_time"    VARCHAR(20),
      "is_published" BOOLEAN NOT NULL DEFAULT TRUE,
      "is_featured"  BOOLEAN NOT NULL DEFAULT FALSE,
      "published_at" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
      "created_at"   TIMESTAMP(3) NOT NULL DEFAULT NOW(),
      "updated_at"   TIMESTAMP(3) NOT NULL DEFAULT NOW()
    );
  `);

  // Indexes
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "blogs_category_idx" ON "blogs" ("category");
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "blogs_published_idx" ON "blogs" ("is_published", "published_at");
  `);

  console.log('blogs table created successfully.');
}

main()
  .catch((e) => {
    console.error('Error creating blogs table:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
