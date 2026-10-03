-- CreateTable
CREATE TABLE "ArticleView" (
    "articleId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ArticleView_pkey" PRIMARY KEY ("articleId","day")
);

-- CreateIndex
CREATE INDEX "ArticleView_day_idx" ON "ArticleView"("day");

-- AddForeignKey
ALTER TABLE "ArticleView" ADD CONSTRAINT "ArticleView_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

