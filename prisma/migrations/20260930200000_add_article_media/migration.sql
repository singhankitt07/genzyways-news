CREATE TYPE "ArticleMediaType" AS ENUM ('IMAGE', 'VIDEO');

CREATE TABLE "ArticleMedia" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "type" "ArticleMediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "paragraphIndex" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArticleMedia_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ArticleMedia_articleId_paragraphIndex_sortOrder_idx" ON "ArticleMedia"("articleId", "paragraphIndex", "sortOrder");

ALTER TABLE "ArticleMedia" ADD CONSTRAINT "ArticleMedia_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;