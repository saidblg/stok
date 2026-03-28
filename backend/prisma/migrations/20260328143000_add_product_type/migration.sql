-- Idempotent fix for partially applied production state
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

ALTER TABLE "products"
ADD COLUMN IF NOT EXISTS "productType" "ProductType";

ALTER TABLE "products"
ALTER COLUMN "productType" SET DEFAULT 'ADET';

UPDATE "products"
SET "productType" = 'ADET'
WHERE "productType" IS NULL;

ALTER TABLE "products"
ALTER COLUMN "productType" SET NOT NULL;
