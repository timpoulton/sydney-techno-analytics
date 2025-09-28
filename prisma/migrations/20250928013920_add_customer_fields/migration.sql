/*
  Warnings:

  - You are about to drop the column `buyerEmail` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `buyerPostcode` on the `Ticket` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Ticket" DROP COLUMN "buyerEmail",
DROP COLUMN "buyerPostcode",
ADD COLUMN     "barcode" TEXT,
ADD COLUMN     "customerEmail" TEXT,
ADD COLUMN     "customerName" TEXT,
ADD COLUMN     "customerPostcode" TEXT,
ADD COLUMN     "marketingOptIn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "orderNumber" TEXT;

-- CreateIndex
CREATE INDEX "Ticket_customerEmail_idx" ON "public"."Ticket"("customerEmail");

-- CreateIndex
CREATE INDEX "Ticket_customerPostcode_idx" ON "public"."Ticket"("customerPostcode");
