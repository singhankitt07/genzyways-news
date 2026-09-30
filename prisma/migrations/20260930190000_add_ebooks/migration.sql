CREATE TYPE "EbookFormat" AS ENUM ('PDF', 'EPUB');

CREATE TABLE "Ebook" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleHi" TEXT,
    "summary" TEXT NOT NULL,
    "summaryHi" TEXT,
    "category" TEXT NOT NULL,
    "author" TEXT NOT NULL DEFAULT 'GenzyWays News Desk',
    "language" TEXT NOT NULL DEFAULT 'en',
    "format" "EbookFormat" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "coverUrl" TEXT,
    "sources" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ebook_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Ebook_slug_key" ON "Ebook"("slug");
CREATE INDEX "Ebook_published_createdAt_idx" ON "Ebook"("published", "createdAt");