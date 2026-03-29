-- CreateTable
CREATE TABLE "State" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(10),

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "District" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "state_id" INTEGER NOT NULL,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bank" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "short_name" VARCHAR(20),
    "bank_code" VARCHAR(10),
    "bank_type" VARCHAR(30),
    "headquarters" VARCHAR(100),
    "website" TEXT,

    CONSTRAINT "Bank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" SERIAL NOT NULL,
    "ifsc" VARCHAR(11) NOT NULL,
    "micr" VARCHAR(9),
    "bank_id" INTEGER NOT NULL,
    "branch_name" VARCHAR(200) NOT NULL,
    "address" TEXT,
    "city" VARCHAR(100),
    "centre" VARCHAR(100),
    "district_id" INTEGER,
    "state_id" INTEGER NOT NULL,
    "pincode" VARCHAR(6),
    "phone" VARCHAR(50),
    "neft" BOOLEAN NOT NULL DEFAULT true,
    "rtgs" BOOLEAN NOT NULL DEFAULT true,
    "imps" BOOLEAN NOT NULL DEFAULT true,
    "upi" BOOLEAN NOT NULL DEFAULT true,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "swift" VARCHAR(11),
    "iso3166" VARCHAR(10),
    "bank_code" VARCHAR(10),
    "last_updated" TIMESTAMP(3),

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_logs" (
    "id" SERIAL NOT NULL,
    "search_type" VARCHAR(20),
    "query" VARCHAR(200),
    "results_count" INTEGER,
    "ip_hash" VARCHAR(16),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_log" (
    "id" SERIAL NOT NULL,
    "release_tag" TEXT,
    "release_date" TEXT,
    "records_synced" INTEGER NOT NULL DEFAULT 0,
    "duration_secs" DOUBLE PRECISION,
    "status" TEXT,
    "error_msg" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "State_name_key" ON "State"("name");

-- CreateIndex
CREATE INDEX "District_state_id_idx" ON "District"("state_id");

-- CreateIndex
CREATE UNIQUE INDEX "District_name_state_id_key" ON "District"("name", "state_id");

-- CreateIndex
CREATE UNIQUE INDEX "Bank_name_key" ON "Bank"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Branch_ifsc_key" ON "Branch"("ifsc");

-- CreateIndex
CREATE INDEX "Branch_bank_id_idx" ON "Branch"("bank_id");

-- CreateIndex
CREATE INDEX "Branch_state_id_idx" ON "Branch"("state_id");

-- CreateIndex
CREATE INDEX "Branch_district_id_idx" ON "Branch"("district_id");

-- CreateIndex
CREATE INDEX "Branch_pincode_idx" ON "Branch"("pincode");

-- CreateIndex
CREATE INDEX "Branch_micr_idx" ON "Branch"("micr");

-- AddForeignKey
ALTER TABLE "District" ADD CONSTRAINT "District_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "Bank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
