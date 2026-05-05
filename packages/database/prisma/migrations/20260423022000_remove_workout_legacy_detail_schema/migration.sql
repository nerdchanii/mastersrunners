-- This migration was first attempted by the 2026-05-05 dev deploy and failed
-- before it was recorded in the target database. Preserve deployability by
-- carrying legacy fileUrl forward as a compatibility sourcePath, then defer
-- physical legacy cleanup until the explicit private-storage backfill task can
-- write real detail blobs.
UPDATE "WorkoutFile"
SET "sourcePath" = "fileUrl"
WHERE "sourcePath" IS NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "WorkoutFile" wf
    WHERE wf."sourcePath" IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot make WorkoutFile.sourcePath required before sourcePath backfill is complete.';
  END IF;
END $$;

ALTER TABLE "WorkoutFile"
ALTER COLUMN "sourcePath" SET NOT NULL;
