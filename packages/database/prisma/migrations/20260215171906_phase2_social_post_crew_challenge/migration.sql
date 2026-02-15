/*
  Warnings:

  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isPublic` on the `Workout` table. All the data in the column will be lost.
  - You are about to drop the `Comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Like` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_parentId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_userId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_workoutId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_userId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_workoutId_fkey";

-- DropIndex
DROP INDEX "Workout_isPublic_createdAt_idx";

-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "creatorType" TEXT NOT NULL DEFAULT 'USER',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "goalType" TEXT NOT NULL DEFAULT 'CUMULATIVE',
ADD COLUMN     "joinType" TEXT NOT NULL DEFAULT 'OPEN',
ADD COLUMN     "participationMode" TEXT NOT NULL DEFAULT 'SOLO',
ADD COLUMN     "participationUnit" TEXT NOT NULL DEFAULT 'INDIVIDUAL',
ADD COLUMN     "visibility" TEXT NOT NULL DEFAULT 'PUBLIC';

-- AlterTable
ALTER TABLE "ChallengeParticipant" ADD COLUMN     "challengeTeamId" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Crew" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "CrewMember" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Follow" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACCEPTED';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password",
ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "workoutSharingDefault" TEXT NOT NULL DEFAULT 'FOLLOWERS';

-- AlterTable
ALTER TABLE "Workout" DROP COLUMN "isPublic",
ADD COLUMN     "visibility" TEXT NOT NULL DEFAULT 'FOLLOWERS';

-- DropTable
DROP TABLE "Comment";

-- DropTable
DROP TABLE "Like";

-- CreateTable
CREATE TABLE "Block" (
    "id" TEXT NOT NULL,
    "blockerId" TEXT NOT NULL,
    "blockedId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'FOLLOWERS',
    "hashtags" TEXT[],
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostImage" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PostImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostWorkout" (
    "postId" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,

    CONSTRAINT "PostWorkout_pkey" PRIMARY KEY ("postId","workoutId")
);

-- CreateTable
CREATE TABLE "PostLike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostComment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parentId" TEXT,
    "mentionedUserId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutLike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkoutLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutComment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrewTag" (
    "id" TEXT NOT NULL,
    "crewId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#3B82F6',

    CONSTRAINT "CrewTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrewMemberTag" (
    "crewMemberId" TEXT NOT NULL,
    "crewTagId" TEXT NOT NULL,

    CONSTRAINT "CrewMemberTag_pkey" PRIMARY KEY ("crewMemberId","crewTagId")
);

-- CreateTable
CREATE TABLE "CrewBan" (
    "id" TEXT NOT NULL,
    "crewId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bannedBy" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrewBan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrewActivity" (
    "id" TEXT NOT NULL,
    "crewId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "activityDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "qrCode" TEXT,

    CONSTRAINT "CrewActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrewAttendance" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'QR',
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrewAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengeTeam" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChallengeTeam_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Block_blockerId_idx" ON "Block"("blockerId");

-- CreateIndex
CREATE INDEX "Block_blockedId_idx" ON "Block"("blockedId");

-- CreateIndex
CREATE UNIQUE INDEX "Block_blockerId_blockedId_key" ON "Block"("blockerId", "blockedId");

-- CreateIndex
CREATE INDEX "Post_userId_deletedAt_createdAt_idx" ON "Post"("userId", "deletedAt", "createdAt");

-- CreateIndex
CREATE INDEX "Post_visibility_deletedAt_createdAt_idx" ON "Post"("visibility", "deletedAt", "createdAt");

-- CreateIndex
CREATE INDEX "PostImage_postId_sortOrder_idx" ON "PostImage"("postId", "sortOrder");

-- CreateIndex
CREATE INDEX "PostLike_postId_idx" ON "PostLike"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "PostLike_userId_postId_key" ON "PostLike"("userId", "postId");

-- CreateIndex
CREATE INDEX "PostComment_postId_deletedAt_createdAt_idx" ON "PostComment"("postId", "deletedAt", "createdAt");

-- CreateIndex
CREATE INDEX "PostComment_parentId_idx" ON "PostComment"("parentId");

-- CreateIndex
CREATE INDEX "WorkoutLike_workoutId_idx" ON "WorkoutLike"("workoutId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutLike_userId_workoutId_key" ON "WorkoutLike"("userId", "workoutId");

-- CreateIndex
CREATE INDEX "WorkoutComment_workoutId_deletedAt_createdAt_idx" ON "WorkoutComment"("workoutId", "deletedAt", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CrewTag_crewId_name_key" ON "CrewTag"("crewId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "CrewBan_crewId_userId_key" ON "CrewBan"("crewId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "CrewActivity_qrCode_key" ON "CrewActivity"("qrCode");

-- CreateIndex
CREATE INDEX "CrewActivity_crewId_activityDate_idx" ON "CrewActivity"("crewId", "activityDate");

-- CreateIndex
CREATE UNIQUE INDEX "CrewAttendance_activityId_userId_key" ON "CrewAttendance"("activityId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeTeam_challengeId_name_key" ON "ChallengeTeam"("challengeId", "name");

-- CreateIndex
CREATE INDEX "Workout_userId_deletedAt_createdAt_idx" ON "Workout"("userId", "deletedAt", "createdAt");

-- CreateIndex
CREATE INDEX "Workout_visibility_deletedAt_createdAt_idx" ON "Workout"("visibility", "deletedAt", "createdAt");

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostImage" ADD CONSTRAINT "PostImage_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostWorkout" ADD CONSTRAINT "PostWorkout_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostWorkout" ADD CONSTRAINT "PostWorkout_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostLike" ADD CONSTRAINT "PostLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostLike" ADD CONSTRAINT "PostLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "PostComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutLike" ADD CONSTRAINT "WorkoutLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutLike" ADD CONSTRAINT "WorkoutLike_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutComment" ADD CONSTRAINT "WorkoutComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutComment" ADD CONSTRAINT "WorkoutComment_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrewTag" ADD CONSTRAINT "CrewTag_crewId_fkey" FOREIGN KEY ("crewId") REFERENCES "Crew"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrewMemberTag" ADD CONSTRAINT "CrewMemberTag_crewMemberId_fkey" FOREIGN KEY ("crewMemberId") REFERENCES "CrewMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrewMemberTag" ADD CONSTRAINT "CrewMemberTag_crewTagId_fkey" FOREIGN KEY ("crewTagId") REFERENCES "CrewTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrewBan" ADD CONSTRAINT "CrewBan_crewId_fkey" FOREIGN KEY ("crewId") REFERENCES "Crew"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrewActivity" ADD CONSTRAINT "CrewActivity_crewId_fkey" FOREIGN KEY ("crewId") REFERENCES "Crew"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrewAttendance" ADD CONSTRAINT "CrewAttendance_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "CrewActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeParticipant" ADD CONSTRAINT "ChallengeParticipant_challengeTeamId_fkey" FOREIGN KEY ("challengeTeamId") REFERENCES "ChallengeTeam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeTeam" ADD CONSTRAINT "ChallengeTeam_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
