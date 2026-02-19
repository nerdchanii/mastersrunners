-- AlterTable: Crew profile + region fields
ALTER TABLE "Crew" ADD COLUMN "coverImageUrl" TEXT;
ALTER TABLE "Crew" ADD COLUMN "location" TEXT;
ALTER TABLE "Crew" ADD COLUMN "region" TEXT;
ALTER TABLE "Crew" ADD COLUMN "subRegion" TEXT;

-- AlterTable: Post.crewId for crew posts
ALTER TABLE "Post" ADD COLUMN "crewId" TEXT;

-- AlterTable: User region fields
ALTER TABLE "User" ADD COLUMN "region" TEXT;
ALTER TABLE "User" ADD COLUMN "subRegion" TEXT;

-- CreateIndex: Crew region search
CREATE INDEX "Crew_region_subRegion_idx" ON "Crew"("region", "subRegion");

-- CreateIndex: Post by crew
CREATE INDEX "Post_crewId_createdAt_idx" ON "Post"("crewId", "createdAt");

-- AddForeignKey: Post -> Crew
ALTER TABLE "Post" ADD CONSTRAINT "Post_crewId_fkey" FOREIGN KEY ("crewId") REFERENCES "Crew"("id") ON DELETE SET NULL ON UPDATE CASCADE;
