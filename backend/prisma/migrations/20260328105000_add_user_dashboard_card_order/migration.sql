-- Add user-specific dashboard card order preference
ALTER TABLE "User"
ADD COLUMN "dashboardCardOrder" TEXT[] DEFAULT ARRAY[]::TEXT[];

UPDATE "User"
SET "dashboardCardOrder" = ARRAY[]::TEXT[]
WHERE "dashboardCardOrder" IS NULL;

ALTER TABLE "User"
ALTER COLUMN "dashboardCardOrder" SET NOT NULL;
