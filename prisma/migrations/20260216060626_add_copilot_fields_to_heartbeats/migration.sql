-- Add new fields to Heartbeats table for GitHub Copilot integration
ALTER TABLE "Heartbeats" ADD COLUMN "category" TEXT DEFAULT 'coding';
ALTER TABLE "Heartbeats" ADD COLUMN "eventType" TEXT;
ALTER TABLE "Heartbeats" ADD COLUMN "toolName" TEXT;
ALTER TABLE "Heartbeats" ADD COLUMN "metadata" JSONB;

-- Create indexes for new fields to improve query performance
CREATE INDEX "Heartbeats_category_idx" ON "Heartbeats"("category");
CREATE INDEX "Heartbeats_eventType_idx" ON "Heartbeats"("eventType");
CREATE INDEX "Heartbeats_toolName_idx" ON "Heartbeats"("toolName");
