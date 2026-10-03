-- CreateTable
CREATE TABLE "NewsSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'rss',
    "kind" TEXT NOT NULL DEFAULT 'PUBLISHER',
    "url" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Current Affairs',
    "config" JSONB,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "pollMinutes" INTEGER NOT NULL DEFAULT 30,
    "lastFetchedAt" TIMESTAMP(3),
    "lastStatus" TEXT,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsItem" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "externalId" TEXT,
    "originalUrl" TEXT NOT NULL,
    "urlHash" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleFingerprint" TEXT NOT NULL,
    "description" TEXT,
    "publishedAt" TIMESTAMP(3),
    "retrievedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" TEXT NOT NULL,
    "meta" JSONB,

    CONSTRAINT "NewsItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIProcessingJob" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "runAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedAt" TIMESTAMP(3),
    "payload" JSONB,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "AIProcessingJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationLog" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'INFO',
    "action" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "entity" TEXT,
    "entityId" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AutomationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "pollMinutes" INTEGER NOT NULL DEFAULT 30,
    "categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "minImportance" INTEGER NOT NULL DEFAULT 2,
    "autoResearch" BOOLEAN NOT NULL DEFAULT false,
    "autoDraft" BOOLEAN NOT NULL DEFAULT false,
    "requireApproval" BOOLEAN NOT NULL DEFAULT true,
    "aiProvider" TEXT NOT NULL DEFAULT 'openai-compatible',
    "aiModel" TEXT,
    "maxRequestsPerDay" INTEGER NOT NULL DEFAULT 200,
    "maxTokensPerDay" INTEGER NOT NULL DEFAULT 200000,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NewsSource_url_key" ON "NewsSource"("url");

-- CreateIndex
CREATE UNIQUE INDEX "NewsItem_urlHash_key" ON "NewsItem"("urlHash");

-- CreateIndex
CREATE INDEX "NewsItem_titleFingerprint_idx" ON "NewsItem"("titleFingerprint");

-- CreateIndex
CREATE INDEX "NewsItem_publishedAt_idx" ON "NewsItem"("publishedAt");

-- CreateIndex
CREATE INDEX "NewsItem_sourceId_retrievedAt_idx" ON "NewsItem"("sourceId", "retrievedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AIProcessingJob_key_key" ON "AIProcessingJob"("key");

-- CreateIndex
CREATE INDEX "AIProcessingJob_status_runAt_idx" ON "AIProcessingJob"("status", "runAt");

-- CreateIndex
CREATE INDEX "AutomationLog_createdAt_idx" ON "AutomationLog"("createdAt");

-- CreateIndex
CREATE INDEX "AutomationLog_entity_entityId_idx" ON "AutomationLog"("entity", "entityId");

-- AddForeignKey
ALTER TABLE "NewsItem" ADD CONSTRAINT "NewsItem_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "NewsSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

