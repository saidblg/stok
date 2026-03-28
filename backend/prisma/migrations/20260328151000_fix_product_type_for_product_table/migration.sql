-- Fix for environments where 20260328143000 was resolved but column was not created
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'ProductType'
  ) THEN
    CREATE TYPE "ProductType" AS ENUM ('KOLI', 'ADET');
  END IF;
END $$;

ALTER TYPE "ProductType" ADD VALUE IF NOT EXISTS 'KOLI';
ALTER TYPE "ProductType" ADD VALUE IF NOT EXISTS 'ADET';

ALTER TABLE "Product"
ADD COLUMN IF NOT EXISTS "productType" "ProductType";

ALTER TABLE "Product"
ALTER COLUMN "productType" SET DEFAULT 'ADET';

UPDATE "Product"
SET "productType" = 'ADET'
WHERE "productType" IS NULL;

ALTER TABLE "Product"
ALTER COLUMN "productType" SET NOT NULL;
