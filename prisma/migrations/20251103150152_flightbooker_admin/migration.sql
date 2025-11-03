-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "public"."ProviderType" AS ENUM ('AMADEUS', 'SKYSCANNER', 'KIWI', 'SABRE', 'TRAVELPORT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."AuditCategory" AS ENUM ('USER_AUTH', 'USER_MANAGEMENT', 'BOOKING_CREATE', 'BOOKING_UPDATE', 'BOOKING_CANCEL', 'PAYMENT', 'API_PROVIDER_CHANGE', 'SYSTEM_CONFIG', 'SECURITY', 'PROMO_CODE');

-- CreateEnum
CREATE TYPE "public"."AuditSeverity" AS ENUM ('INFO', 'WARNING', 'ERROR', 'CRITICAL');

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "role" "public"."UserRole" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "public"."api_providers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "provider" "public"."ProviderType" NOT NULL,
    "credentials" TEXT NOT NULL,
    "environment" TEXT NOT NULL DEFAULT 'test',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "requestsPerMinute" INTEGER NOT NULL DEFAULT 100,
    "requestsPerDay" INTEGER NOT NULL DEFAULT 10000,
    "totalRequests" INTEGER NOT NULL DEFAULT 0,
    "successfulRequests" INTEGER NOT NULL DEFAULT 0,
    "failedRequests" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "isHealthy" BOOLEAN NOT NULL DEFAULT true,
    "lastHealthCheck" TIMESTAMP(3),
    "healthCheckDetails" TEXT DEFAULT '{}',
    "supportedFeatures" TEXT NOT NULL DEFAULT '[]',
    "priority" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."system_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "isEncrypted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "category" "public"."AuditCategory" NOT NULL,
    "severity" "public"."AuditSeverity" NOT NULL DEFAULT 'INFO',
    "userId" TEXT,
    "userEmail" TEXT,
    "userRole" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "endpoint" TEXT,
    "method" TEXT,
    "details" TEXT NOT NULL DEFAULT '{}',
    "metadata" TEXT DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "api_providers_name_key" ON "public"."api_providers"("name");

-- CreateIndex
CREATE INDEX "api_providers_isPrimary_isActive_idx" ON "public"."api_providers"("isPrimary", "isActive");

-- CreateIndex
CREATE INDEX "api_providers_provider_idx" ON "public"."api_providers"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_key_key" ON "public"."system_config"("key");

-- CreateIndex
CREATE INDEX "system_config_category_idx" ON "public"."system_config"("category");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "public"."audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_category_severity_idx" ON "public"."audit_logs"("category", "severity");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "public"."audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "public"."users"("role");
