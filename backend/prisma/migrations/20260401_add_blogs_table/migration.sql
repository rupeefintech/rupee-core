-- CreateTable: blogs
CREATE TABLE IF NOT EXISTS "blogs" (
    "id"           SERIAL PRIMARY KEY,
    "slug"         VARCHAR(200) NOT NULL,
    "title"        VARCHAR(300) NOT NULL,
    "description"  TEXT         NOT NULL,
    "category"     VARCHAR(50)  NOT NULL,
    "tags"         TEXT[]       NOT NULL DEFAULT ARRAY[]::TEXT[],
    "cover_image"  TEXT,
    "content"      TEXT         NOT NULL,
    "read_time"    VARCHAR(20),
    "is_published" BOOLEAN      NOT NULL DEFAULT true,
    "is_featured"  BOOLEAN      NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "blogs_slug_key" ON "blogs"("slug");
CREATE INDEX IF NOT EXISTS "blogs_category_idx" ON "blogs"("category");
CREATE INDEX IF NOT EXISTS "blogs_is_published_published_at_idx" ON "blogs"("is_published", "published_at");
