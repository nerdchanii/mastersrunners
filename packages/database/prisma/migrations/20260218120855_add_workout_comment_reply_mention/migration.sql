-- AlterTable
ALTER TABLE "WorkoutComment" ADD COLUMN     "mentionedUserIds" TEXT[],
ADD COLUMN     "parentId" TEXT;

-- CreateIndex
CREATE INDEX "WorkoutComment_parentId_idx" ON "WorkoutComment"("parentId");

-- AddForeignKey
ALTER TABLE "WorkoutComment" ADD CONSTRAINT "WorkoutComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "WorkoutComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
