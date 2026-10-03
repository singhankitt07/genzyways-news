-- CreateTable
CREATE TABLE "ArticleDraft" (
    "id" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL,
    "reportId" TEXT,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "titleHi" TEXT,
    "summaryHi" TEXT,
    "contentHi" TEXT,
    "category" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "seoTitle" TEXT NOT NULL,
    "seoDescription" TEXT NOT NULL,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'IN_REVIEW',
    "riskLevel" TEXT NOT NULL DEFAULT 'LOW',
    "needsHuman" BOOLEAN NOT NULL DEFAULT true,
    "verdict" TEXT,
    "confidence" INTEGER NOT NULL DEFAULT 0,
    "model" TEXT,
    "articleId" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArticleDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIReview" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ArticleDraft_status_createdAt_idx" ON "ArticleDraft"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ArticleDraft_clusterId_idx" ON "ArticleDraft"("clusterId");

-- CreateIndex
CREATE INDEX "AIReview_draftId_createdAt_idx" ON "AIReview"("draftId", "createdAt");

-- AddForeignKey
ALTER TABLE "ArticleDraft" ADD CONSTRAINT "ArticleDraft_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "StoryCluster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIReview" ADD CONSTRAINT "AIReview_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "ArticleDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

