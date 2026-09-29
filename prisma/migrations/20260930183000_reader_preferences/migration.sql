ALTER TABLE "User"
ADD COLUMN "readingFontSize" INTEGER NOT NULL DEFAULT 18;

ALTER TABLE "User"
ALTER COLUMN "theme" SET DEFAULT 'auto';

UPDATE "User"
SET "theme" = 'auto'
WHERE "theme" = 'default';