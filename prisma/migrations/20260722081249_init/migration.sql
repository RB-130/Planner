-- CreateTable
CREATE TABLE "ScheduleBlock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dayType" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "startOffsetMinutes" INTEGER NOT NULL,
    "endOffsetMinutes" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "fixedClockTime" BOOLEAN NOT NULL DEFAULT false,
    "fixedStart" TEXT,
    "fixedEnd" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DayOverride" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "removed" BOOLEAN NOT NULL DEFAULT false,
    "taskText" TEXT,
    "overrideStartMinutes" INTEGER,
    "overrideEndMinutes" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DayOverride_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "ScheduleBlock" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DaySettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "wakeTime" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
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
