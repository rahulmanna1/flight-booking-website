-- CreateEnum
CREATE TYPE "public"."BookingStatus" AS ENUM ('CONFIRMED', 'PENDING', 'PAYMENT_FAILED', 'CANCELLED', 'COMPLETED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."TripType" AS ENUM ('ONE_WAY', 'ROUND_TRIP', 'MULTI_CITY');

-- CreateEnum
CREATE TYPE "public"."CabinClass" AS ENUM ('ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST');

-- CreateEnum
CREATE TYPE "public"."AlertType" AS ENUM ('PRICE_DROP', 'PRICE_BELOW', 'PRICE_ABOVE');

-- CreateEnum
CREATE TYPE "public"."AlertFrequency" AS ENUM ('IMMEDIATE', 'DAILY', 'WEEKLY');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('PRICE_DROP', 'TARGET_REACHED', 'PRICE_INCREASE', 'BOOKING_CONFIRMATION', 'BOOKING_REMINDER', 'FLIGHT_DELAYED', 'FLIGHT_CANCELLED', 'CHECK_IN_REMINDER', 'GENERAL');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "avatar" TEXT,
    "phone" TEXT,
    "dateOfBirth" TEXT,
    "nationality" TEXT,
    "preferences" TEXT NOT NULL DEFAULT '{"currency":"USD","language":"en","notifications":{"email":true,"sms":false,"push":true}}',
    "frequentFlyerNumbers" TEXT DEFAULT '[]',
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLogin" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bookings" (
    "id" TEXT NOT NULL,
    "bookingReference" TEXT NOT NULL,
    "confirmationNumber" TEXT NOT NULL,
    "status" "public"."BookingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "userId" TEXT NOT NULL,
    "flightData" TEXT NOT NULL,
    "passengers" TEXT NOT NULL,
    "seatSelections" TEXT DEFAULT '[]',
    "mealPreferences" TEXT DEFAULT '[]',
    "baggageInfo" TEXT DEFAULT '{"checked":[],"carry_on":[]}',
    "insuranceInfo" TEXT DEFAULT 'null',
    "isGroupBooking" BOOLEAN NOT NULL DEFAULT false,
    "groupSize" INTEGER DEFAULT 1,
    "groupCoordinatorEmail" TEXT,
    "tripType" "public"."TripType" NOT NULL DEFAULT 'ROUND_TRIP',
    "pricing" TEXT NOT NULL,
    "contactInfo" TEXT NOT NULL,
    "paymentInfo" TEXT NOT NULL,
    "bookingDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."price_alerts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "departureDate" TEXT NOT NULL,
    "returnDate" TEXT,
    "tripType" "public"."TripType" NOT NULL DEFAULT 'ONE_WAY',
    "passengers" TEXT NOT NULL DEFAULT '{"adults":1,"children":0,"infants":0}',
    "cabinClass" "public"."CabinClass" NOT NULL DEFAULT 'ECONOMY',
    "targetPrice" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "currentPrice" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "alertType" "public"."AlertType" NOT NULL DEFAULT 'PRICE_BELOW',
    "frequency" "public"."AlertFrequency" NOT NULL DEFAULT 'DAILY',
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "priceHistory" TEXT NOT NULL DEFAULT '[]',
    "lastChecked" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "priceAlertId" TEXT,
    "type" "public"."NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "previousPrice" DOUBLE PRECISION,
    "currentPrice" DOUBLE PRECISION,
    "changeAmount" DOUBLE PRECISION,
    "changePercent" DOUBLE PRECISION,
    "channels" TEXT NOT NULL DEFAULT '[]',
    "readAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."flights" (
    "id" TEXT NOT NULL,
    "airline" TEXT NOT NULL,
    "flightNumber" TEXT NOT NULL,
    "aircraftType" TEXT,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "departureTime" TEXT NOT NULL,
    "arrivalTime" TEXT NOT NULL,
    "departureDate" TEXT NOT NULL,
    "arrivalDate" TEXT,
    "duration" TEXT NOT NULL,
    "stops" INTEGER NOT NULL DEFAULT 0,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "availableSeats" INTEGER,
    "cabinClasses" TEXT NOT NULL DEFAULT '{}',
    "additionalInfo" TEXT NOT NULL DEFAULT '{}',
    "validUntil" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."airports" (
    "id" TEXT NOT NULL,
    "iataCode" TEXT NOT NULL,
    "icaoCode" TEXT,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "timezone" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "elevation" INTEGER,
    "additionalInfo" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "airports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_bookingReference_key" ON "public"."bookings"("bookingReference");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_confirmationNumber_key" ON "public"."bookings"("confirmationNumber");

-- CreateIndex
CREATE INDEX "flights_origin_destination_departureDate_idx" ON "public"."flights"("origin", "destination", "departureDate");

-- CreateIndex
CREATE INDEX "flights_airline_flightNumber_idx" ON "public"."flights"("airline", "flightNumber");

-- CreateIndex
CREATE INDEX "flights_validUntil_idx" ON "public"."flights"("validUntil");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "public"."sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "airports_iataCode_key" ON "public"."airports"("iataCode");

-- CreateIndex
CREATE INDEX "airports_iataCode_idx" ON "public"."airports"("iataCode");

-- CreateIndex
CREATE INDEX "airports_city_country_idx" ON "public"."airports"("city", "country");

-- CreateIndex
CREATE INDEX "airports_name_idx" ON "public"."airports"("name");

-- AddForeignKey
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."price_alerts" ADD CONSTRAINT "price_alerts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_priceAlertId_fkey" FOREIGN KEY ("priceAlertId") REFERENCES "public"."price_alerts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
