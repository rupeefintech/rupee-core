-- Create post_offices table for India Post PIN code directory
-- Run via Neon console or: psql $DATABASE_URL -f migrate_post_offices.sql
--
-- Columns match the data.gov.in CSV exactly:
-- circlename, regionname, divisionname, officename, pincode,
-- officetype, delivery, district, statename, latitude, longitude

CREATE TABLE IF NOT EXISTS post_offices (
  id           SERIAL        PRIMARY KEY,
  pin_code     VARCHAR(6)    NOT NULL,
  office_name  VARCHAR(200)  NOT NULL,
  office_type  VARCHAR(5),                    -- H.O / S.O / B.O
  delivery     BOOLEAN       NOT NULL DEFAULT TRUE,
  district     VARCHAR(100),
  division     VARCHAR(100),
  region       VARCHAR(100),
  circle       VARCHAR(100),
  state_name   VARCHAR(100)  NOT NULL,
  latitude     DOUBLE PRECISION,
  longitude    DOUBLE PRECISION
);

CREATE INDEX IF NOT EXISTS idx_po_pin_code  ON post_offices(pin_code);
CREATE INDEX IF NOT EXISTS idx_po_state     ON post_offices(state_name);
CREATE INDEX IF NOT EXISTS idx_po_district  ON post_offices(district);
