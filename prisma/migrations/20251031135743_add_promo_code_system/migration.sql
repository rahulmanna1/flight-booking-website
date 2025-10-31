-- CreateEnum
CREATE TYPE "public"."DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'BUY_ONE_GET_ONE');

-- AlterTable
ALTER TABLE "public"."bookings" ADD COLUMN     "discountAmount" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "promoCodeId" TEXT,
ADD COLUMN     "totalAmount" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "public"."promo_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "discountType" "public"."DiscountType" NOT NULL,
    "discountValue" DOUBLE PRECISION NOT NULL,
    "minPurchaseAmount" DOUBLE PRECISION,
    "maxDiscountAmount" DOUBLE PRECISION,
    "usageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "perUserLimit" INTEGER,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "applicableRoutes" TEXT DEFAULT '[]',
    "applicableAirlines" TEXT DEFAULT '[]',
    "firstTimeOnly" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promo_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "promo_codes_code_key" ON "public"."promo_codes"("code");

-- CreateIndex
CREATE INDEX "promo_codes_code_idx" ON "public"."promo_codes"("code");

-- CreateIndex
CREATE INDEX "promo_codes_validFrom_validUntil_idx" ON "public"."promo_codes"("validFrom", "validUntil");

-- CreateIndex
CREATE INDEX "promo_codes_isActive_idx" ON "public"."promo_codes"("isActive");

-- AddForeignKey
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "public"."promo_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
