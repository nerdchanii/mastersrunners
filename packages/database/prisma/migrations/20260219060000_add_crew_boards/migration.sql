-- CreateTable
CREATE TABLE "CrewBoard" (
    "id" TEXT NOT NULL,
    "crewId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'GENERAL',
    "writePermission" TEXT NOT NULL DEFAULT 'ALL_MEMBERS',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrewBoard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrewBoardPost" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrewBoardPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrewBoardPostImage" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CrewBoardPostImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrewBoardComment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parentId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrewBoardComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrewBoardPostLike" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrewBoardPostLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CrewBoard_crewId_sortOrder_idx" ON "CrewBoard"("crewId", "sortOrder");

-- CreateIndex
CREATE INDEX "CrewBoardPost_boardId_isPinned_createdAt_idx" ON "CrewBoardPost"("boardId", "isPinned", "createdAt");

-- CreateIndex
CREATE INDEX "CrewBoardPostImage_postId_order_idx" ON "CrewBoardPostImage"("postId", "order");

-- CreateIndex
CREATE INDEX "CrewBoardComment_postId_createdAt_idx" ON "CrewBoardComment"("postId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CrewBoardPostLike_postId_userId_key" ON "CrewBoardPostLike"("postId", "userId");

-- AddForeignKey
ALTER TABLE "CrewBoard" ADD CONSTRAINT "CrewBoard_crewId_fkey" FOREIGN KEY ("crewId") REFERENCES "Crew"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrewBoardPost" ADD CONSTRAINT "CrewBoardPost_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "CrewBoard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrewBoardPost" ADD CONSTRAINT "CrewBoardPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrewBoardPostImage" ADD CONSTRAINT "CrewBoardPostImage_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CrewBoardPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrewBoardComment" ADD CONSTRAINT "CrewBoardComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CrewBoardPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrewBoardComment" ADD CONSTRAINT "CrewBoardComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrewBoardComment" ADD CONSTRAINT "CrewBoardComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "CrewBoardComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrewBoardPostLike" ADD CONSTRAINT "CrewBoardPostLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CrewBoardPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrewBoardPostLike" ADD CONSTRAINT "CrewBoardPostLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
