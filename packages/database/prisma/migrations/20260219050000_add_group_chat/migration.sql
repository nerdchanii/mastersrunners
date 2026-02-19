-- Add group chat fields to Conversation
ALTER TABLE "Conversation" ADD COLUMN "name" TEXT;
ALTER TABLE "Conversation" ADD COLUMN "crewId" TEXT;
ALTER TABLE "Conversation" ADD COLUMN "activityId" TEXT;

-- Add indices
CREATE INDEX "Conversation_crewId_idx" ON "Conversation"("crewId");
CREATE INDEX "Conversation_activityId_idx" ON "Conversation"("activityId");

-- Add chatConversationId to Crew
ALTER TABLE "Crew" ADD COLUMN "chatConversationId" TEXT;
CREATE UNIQUE INDEX "Crew_chatConversationId_key" ON "Crew"("chatConversationId");

-- Add chatConversationId to CrewActivity
ALTER TABLE "CrewActivity" ADD COLUMN "chatConversationId" TEXT;
CREATE UNIQUE INDEX "CrewActivity_chatConversationId_key" ON "CrewActivity"("chatConversationId");
