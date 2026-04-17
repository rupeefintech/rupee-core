-- CreateTable: Product
CREATE TABLE IF NOT EXISTS "Product" (
    "id"            SERIAL PRIMARY KEY,
    "name"          VARCHAR(150) NOT NULL,
    "slug"          VARCHAR(180) NOT NULL,
    "category"      VARCHAR(50)  NOT NULL,
    "bank_id"       INTEGER      NOT NULL,
    "network"       VARCHAR(50),
    "card_image_url" TEXT,
    "apply_url"     TEXT,
    "is_featured"   BOOLEAN      NOT NULL DEFAULT false,
    "is_popular"    BOOLEAN      NOT NULL DEFAULT false,
    "is_active"     BOOLEAN      NOT NULL DEFAULT true,
    "rating"        DOUBLE PRECISION DEFAULT 0,
    "total_ratings" INTEGER      NOT NULL DEFAULT 0,
    "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Product_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "Bank"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Product_slug_key" ON "Product"("slug");
CREATE INDEX IF NOT EXISTS "Product_bank_id_idx" ON "Product"("bank_id");
CREATE INDEX IF NOT EXISTS "Product_category_idx" ON "Product"("category");

-- CreateTable: ProductDetails
CREATE TABLE IF NOT EXISTS "ProductDetails" (
    "id"           SERIAL PRIMARY KEY,
    "product_id"   INTEGER      NOT NULL,
    "annual_fee"   DOUBLE PRECISION,
    "joining_fee"  DOUBLE PRECISION,
    "min_income"   DOUBLE PRECISION,
    "eligibility"  TEXT,
    "lounge_access" INTEGER,
    "reward_type"  VARCHAR(50),
    "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductDetails_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "ProductDetails_product_id_key" ON "ProductDetails"("product_id");

-- CreateTable: ProductOffer
CREATE TABLE IF NOT EXISTS "ProductOffer" (
    "id"              SERIAL PRIMARY KEY,
    "product_id"      INTEGER      NOT NULL,
    "title"           VARCHAR(200) NOT NULL,
    "description"     TEXT,
    "reward_type"     VARCHAR(50),
    "reward_rate"     DOUBLE PRECISION,
    "reward_cap"      DOUBLE PRECISION,
    "category"        VARCHAR(100),
    "version"         INTEGER      NOT NULL DEFAULT 1,
    "is_active"       BOOLEAN      NOT NULL DEFAULT true,
    "valid_from"      TIMESTAMP(3),
    "valid_to"        TIMESTAMP(3),
    "source"          VARCHAR(50),
    "source_url"      TEXT,
    "last_checked_at" TIMESTAMP(3),
    "created_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductOffer_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "ProductOffer_product_id_idx" ON "ProductOffer"("product_id");
CREATE INDEX IF NOT EXISTS "ProductOffer_is_active_idx" ON "ProductOffer"("is_active");

-- CreateTable: Feature
CREATE TABLE IF NOT EXISTS "Feature" (
    "id"         SERIAL PRIMARY KEY,
    "name"       VARCHAR(100) NOT NULL,
    "slug"       VARCHAR(120),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "Feature_name_key" ON "Feature"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "Feature_slug_key" ON "Feature"("slug");

-- CreateTable: ProductFeatureMapping
CREATE TABLE IF NOT EXISTS "ProductFeatureMapping" (
    "id"         SERIAL PRIMARY KEY,
    "product_id" INTEGER NOT NULL,
    "feature_id" INTEGER NOT NULL,
    CONSTRAINT "ProductFeatureMapping_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProductFeatureMapping_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "Feature"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "ProductFeatureMapping_product_id_feature_id_key" ON "ProductFeatureMapping"("product_id", "feature_id");
CREATE INDEX IF NOT EXISTS "ProductFeatureMapping_product_id_idx" ON "ProductFeatureMapping"("product_id");
CREATE INDEX IF NOT EXISTS "ProductFeatureMapping_feature_id_idx" ON "ProductFeatureMapping"("feature_id");

-- CreateTable: admins
CREATE TABLE IF NOT EXISTS "admins" (
    "id"         SERIAL PRIMARY KEY,
    "email"      TEXT         NOT NULL,
    "password"   TEXT         NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "admins_email_key" ON "admins"("email");
