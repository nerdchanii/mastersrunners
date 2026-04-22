DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "WorkoutFile" wf
    WHERE wf."sourcePath" IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot drop WorkoutFile.fileUrl before sourcePath backfill is complete.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM "WorkoutRoute" wr
    LEFT JOIN "Workout" w ON w."id" = wr."workoutId"
    WHERE w."detailPath" IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot drop WorkoutRoute before detailPath backfill is complete.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM "WorkoutLap" wl
    LEFT JOIN "Workout" w ON w."id" = wl."workoutId"
    WHERE w."detailPath" IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot drop WorkoutLap before detailPath backfill is complete.';
  END IF;
END $$;

ALTER TABLE "WorkoutFile"
ALTER COLUMN "sourcePath" SET NOT NULL;

DROP TABLE "WorkoutLap";

DROP TABLE "WorkoutRoute";

ALTER TABLE "WorkoutFile"
DROP COLUMN "fileUrl";
