-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD');

-- AlterEnum
ALTER TYPE "TransactionType" ADD VALUE 'PAYMENT';

-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Supplier" ALTER COLUMN "name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "CustomerTransaction"
ADD COLUMN "paymentMethod" "PaymentMethod",
ADD COLUMN "grossAmount" DECIMAL(10,2),
ALTER COLUMN "description" DROP NOT NULL;
