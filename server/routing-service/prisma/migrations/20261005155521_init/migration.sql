-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('INITIAL', 'REPLAN');

-- CreateTable
CREATE TABLE "RoutePlan" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "type" "PlanType" NOT NULL,
    "path" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoutePlan_pkey" PRIMARY KEY ("id")
);
