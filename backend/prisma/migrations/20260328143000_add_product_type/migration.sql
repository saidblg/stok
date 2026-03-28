-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('KOLI', 'ADET');

-- AlterTable
ALTER TABLE "products"
ADD COLUMN "productType" "ProductType" NOT NULL DEFAULT 'ADET';
