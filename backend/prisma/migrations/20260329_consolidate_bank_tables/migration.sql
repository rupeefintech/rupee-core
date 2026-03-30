-- AlterTable
ALTER TABLE "Bank" DROP COLUMN "master_bank_id",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "ifsc_prefix" VARCHAR(10),
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_curated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "merged_into_id" INTEGER,
ADD COLUMN     "normalized_name" VARCHAR(150),
ADD COLUMN     "slug" VARCHAR(120),
ADD COLUMN     "source_razorpay" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "source_rbi" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sub_type" VARCHAR(50),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Branch" ADD COLUMN     "city_id" INTEGER,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "last_synced" TIMESTAMP(3),
ADD COLUMN     "source" VARCHAR(50);

-- AlterTable
ALTER TABLE "State" ADD COLUMN     "iso_code" VARCHAR(10),
ADD COLUMN     "logo_url" TEXT,
ADD COLUMN     "slug" VARCHAR(120);

-- AlterTable
ALTER TABLE "sync_log" ADD COLUMN     "completed_at" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "records_added" INTEGER,
ADD COLUMN     "records_deleted" INTEGER,
ADD COLUMN     "records_updated" INTEGER,
ADD COLUMN     "source" VARCHAR(50),
ADD COLUMN     "sync_type" VARCHAR(50);

-- DropTable
DROP TABLE "banks_master";

-- DropTable
DROP TABLE "playing_with_neon";

-- DropEnum
DROP TYPE "bank_type_enum";

-- CreateTable
CREATE TABLE "City" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "state_id" INTEGER NOT NULL,
    "slug" VARCHAR(120),
    "normalized_name" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_state_presence" (
    "id" SERIAL NOT NULL,
    "bank_id" INTEGER NOT NULL,
    "state_id" INTEGER NOT NULL,
    "branches_count" INTEGER NOT NULL DEFAULT 0,
    "last_verified" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bank_state_presence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_overrides" (
    "id" SERIAL NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "field_name" VARCHAR(100) NOT NULL,
    "old_value" TEXT,
    "new_value" TEXT,
    "reason" TEXT,
    "created_by" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "City_state_id_idx" ON "City"("state_id");

-- CreateIndex
CREATE UNIQUE INDEX "City_name_state_id_key" ON "City"("name", "state_id");

-- CreateIndex
CREATE INDEX "bank_state_presence_bank_id_idx" ON "bank_state_presence"("bank_id");

-- CreateIndex
CREATE INDEX "bank_state_presence_state_id_idx" ON "bank_state_presence"("state_id");

-- CreateIndex
CREATE UNIQUE INDEX "bank_state_presence_bank_id_state_id_key" ON "bank_state_presence"("bank_id", "state_id");

-- CreateIndex
CREATE INDEX "data_overrides_entity_type_entity_id_idx" ON "data_overrides"("entity_type", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "Bank_slug_key" ON "Bank"("slug");

-- CreateIndex
CREATE INDEX "Branch_city_id_idx" ON "Branch"("city_id");

-- CreateIndex
CREATE UNIQUE INDEX "State_slug_key" ON "State"("slug");

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_state_presence" ADD CONSTRAINT "bank_state_presence_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "Bank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_state_presence" ADD CONSTRAINT "bank_state_presence_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

