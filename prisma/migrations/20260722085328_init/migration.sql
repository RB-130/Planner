-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "ScheduleBlock" (
    "id" TEXT NOT NULL,
    "dayType" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "startOffsetMinutes" INTEGER NOT NULL,
    "endOffsetMinutes" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "fixedClockTime" BOOLEAN NOT NULL DEFAULT false,
    "fixedStart" TEXT,
    "fixedEnd" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DayOverride" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "removed" BOOLEAN NOT NULL DEFAULT false,
    "taskText" TEXT,
    "overrideStartMinutes" INTEGER,
    "overrideEndMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DayOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DaySettings" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "wakeTime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DaySettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScheduleBlock_dayType_order_idx" ON "ScheduleBlock"("dayType", "order");

-- CreateIndex
CREATE INDEX "DayOverride_date_idx" ON "DayOverride"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DayOverride_date_blockId_key" ON "DayOverride"("date", "blockId");

-- CreateIndex
CREATE UNIQUE INDEX "DaySettings_date_key" ON "DaySettings"("date");

-- CreateIndex
CREATE INDEX "Appointment_date_idx" ON "Appointment"("date");

-- AddForeignKey
ALTER TABLE "DayOverride" ADD CONSTRAINT "DayOverride_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "ScheduleBlock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

