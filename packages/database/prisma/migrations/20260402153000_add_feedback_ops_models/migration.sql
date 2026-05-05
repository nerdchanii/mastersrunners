CREATE TABLE "PlatformOperatorIdentity" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),

  CONSTRAINT "PlatformOperatorIdentity_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "FeedbackSubmission"
ADD COLUMN "triageNote" TEXT,
ADD COLUMN "reviewedAt" TIMESTAMP(3),
ADD COLUMN "reviewedByOperatorEmail" TEXT,
ADD COLUMN "handoffNote" TEXT,
ADD COLUMN "handoffUpdatedAt" TIMESTAMP(3),
ADD COLUMN "handoffUpdatedByOperatorEmail" TEXT;

UPDATE "FeedbackSubmission"
SET "status" = CASE
  WHEN "status" = 'REVIEWED' THEN 'IN_REVIEW'
  WHEN "status" = 'CLOSED' THEN 'RESOLVED'
  ELSE "status"
END;

CREATE TABLE "FeedbackFollowUpReference" (
  "id" TEXT NOT NULL,
  "submissionId" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "target" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdByOperatorEmail" TEXT NOT NULL,

  CONSTRAINT "FeedbackFollowUpReference_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PlatformOperatorIdentity_email_key" ON "PlatformOperatorIdentity"("email");
CREATE INDEX "PlatformOperatorIdentity_revokedAt_email_idx" ON "PlatformOperatorIdentity"("revokedAt", "email");
CREATE INDEX "FeedbackFollowUpReference_submissionId_createdAt_idx" ON "FeedbackFollowUpReference"("submissionId", "createdAt" DESC);

ALTER TABLE "FeedbackFollowUpReference"
ADD CONSTRAINT "FeedbackFollowUpReference_submissionId_fkey"
FOREIGN KEY ("submissionId") REFERENCES "FeedbackSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
