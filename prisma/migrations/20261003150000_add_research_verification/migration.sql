-- CreateTable
CREATE TABLE "ResearchReport" (
    "id" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "model" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DONE',
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResearchReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchSource" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "credibility" INTEGER NOT NULL DEFAULT 50,
    "snippet" TEXT,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "ResearchSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FactClaim" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "sourceCount" INTEGER NOT NULL DEFAULT 1,
    "sourceRefs" INTEGER[],
    "note" TEXT,

    CONSTRAINT "FactClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationResult" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "verdict" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL DEFAULT 0,
    "riskLevel" TEXT NOT NULL DEFAULT 'LOW',
    "needsHuman" BOOLEAN NOT NULL DEFAULT true,
    "conflicts" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ResearchReport_clusterId_createdAt_idx" ON "ResearchReport"("clusterId", "createdAt");

-- CreateIndex
CREATE INDEX "ResearchSource_reportId_idx" ON "ResearchSource"("reportId");

-- CreateIndex
CREATE INDEX "FactClaim_reportId_idx" ON "FactClaim"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationResult_reportId_key" ON "VerificationResult"("reportId");

-- AddForeignKey
ALTER TABLE "ResearchReport" ADD CONSTRAINT "ResearchReport_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "StoryCluster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchSource" ADD CONSTRAINT "ResearchSource_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "ResearchReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FactClaim" ADD CONSTRAINT "FactClaim_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "ResearchReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationResult" ADD CONSTRAINT "VerificationResult_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "ResearchReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

