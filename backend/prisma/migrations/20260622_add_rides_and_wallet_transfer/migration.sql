-- Create ride status enum
CREATE TYPE "RideStatus" AS ENUM ('ACTIVE', 'COMPLETED');

-- Create ride history table
CREATE TABLE "Ride" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "startDock" TEXT NOT NULL,
    "endDock" TEXT NOT NULL,
    "fare" DECIMAL(10,2) NOT NULL,
    "duration" INTEGER NOT NULL,
    "distance" DECIMAL(6,2) NOT NULL,
    "bikeType" TEXT,
    "status" "RideStatus" NOT NULL DEFAULT 'COMPLETED',
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Ride_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Ride_userId_completedAt_idx" ON "Ride"("userId", "completedAt" DESC);

ALTER TABLE "Ride" ADD CONSTRAINT "Ride_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
