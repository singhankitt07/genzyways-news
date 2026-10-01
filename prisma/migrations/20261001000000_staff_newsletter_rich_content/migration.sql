ALTER TABLE "Article" ADD COLUMN "contentFormat" TEXT NOT NULL DEFAULT 'MARKDOWN';
ALTER TABLE "Article" ADD COLUMN "contentHiFormat" TEXT NOT NULL DEFAULT 'MARKDOWN';

ALTER TABLE "Subscriber" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "Subscriber" ADD COLUMN "confirmationTokenHash" TEXT;
ALTER TABLE "Subscriber" ADD COLUMN "confirmationExpiresAt" TIMESTAMP(3);
ALTER TABLE "Subscriber" ADD COLUMN "unsubscribeTokenHash" TEXT;

CREATE UNIQUE INDEX "Subscriber_confirmationTokenHash_key" ON "Subscriber"("confirmationTokenHash");
CREATE UNIQUE INDEX "Subscriber_unsubscribeTokenHash_key" ON "Subscriber"("unsubscribeTokenHash");