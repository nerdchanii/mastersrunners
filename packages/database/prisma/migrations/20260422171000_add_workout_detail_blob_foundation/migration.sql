-- AlterTable
ALTER TABLE "Workout"
ADD COLUMN     "encodedPolyline" TEXT,
ADD COLUMN     "detailPath" TEXT,
ADD COLUMN     "detailFormatVersion" INTEGER;

-- AlterTable
ALTER TABLE "WorkoutFile"
ADD COLUMN     "sourcePath" TEXT;
