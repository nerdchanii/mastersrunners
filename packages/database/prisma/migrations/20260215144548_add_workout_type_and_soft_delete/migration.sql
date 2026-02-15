-- AlterTable
ALTER TABLE "Workout" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "workoutTypeId" TEXT;

-- CreateTable
CREATE TABLE "WorkoutType" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkoutType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkoutType_category_isActive_sortOrder_idx" ON "WorkoutType"("category", "isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutType_category_name_key" ON "WorkoutType"("category", "name");

-- AddForeignKey
ALTER TABLE "Workout" ADD CONSTRAINT "Workout_workoutTypeId_fkey" FOREIGN KEY ("workoutTypeId") REFERENCES "WorkoutType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
