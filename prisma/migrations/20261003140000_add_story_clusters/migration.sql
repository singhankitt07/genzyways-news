-- AlterTable
ALTER TABLE "NewsItem" ADD COLUMN     "clusterId" TEXT;

-- CreateTable
CREATE TABLE "StoryCluster" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleFingerprint" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "importance" INTEGER NOT NULL DEFAULT 0,
    "riskLevel" TEXT NOT NULL DEFAULT 'LOW',
    "sourceCount" INTEGER NOT NULL DEFAULT 1,
    "itemCount" INTEGER NOT NULL DEFAULT 1,
    "existingArticleId" TEXT,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoryCluster_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StoryCluster_status_importance_idx" ON "StoryCluster"("status", "importance");

-- CreateIndex
CREATE INDEX "StoryCluster_lastSeenAt_idx" ON "StoryCluster"("lastSeenAt");

-- CreateIndex
CREATE INDEX "NewsItem_clusterId_idx" ON "NewsItem"("clusterId");

-- AddForeignKey
ALTER TABLE "NewsItem" ADD CONSTRAINT "NewsItem_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "StoryCluster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

