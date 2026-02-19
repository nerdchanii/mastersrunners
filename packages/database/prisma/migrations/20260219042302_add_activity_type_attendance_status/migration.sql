-- AlterTable
ALTER TABLE "CrewActivity" ADD COLUMN     "activityType" TEXT NOT NULL DEFAULT 'OFFICIAL',
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
ADD COLUMN     "workoutTypeId" TEXT;

-- AlterTable
ALTER TABLE "CrewAttendance" ADD COLUMN     "checkedBy" TEXT,
ADD COLUMN     "rsvpAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'RSVP',
ALTER COLUMN "method" DROP NOT NULL,
ALTER COLUMN "method" DROP DEFAULT,
ALTER COLUMN "checkedAt" DROP NOT NULL,
ALTER COLUMN "checkedAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "CrewActivity_crewId_activityType_status_idx" ON "CrewActivity"("crewId", "activityType", "status");

-- CreateIndex
CREATE INDEX "CrewAttendance_activityId_status_idx" ON "CrewAttendance"("activityId", "status");

-- AddForeignKey
ALTER TABLE "CrewActivity" ADD CONSTRAINT "CrewActivity_workoutTypeId_fkey" FOREIGN KEY ("workoutTypeId") REFERENCES "WorkoutType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrewAttendance" ADD CONSTRAINT "CrewAttendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
