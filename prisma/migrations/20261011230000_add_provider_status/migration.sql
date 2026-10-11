CREATE TABLE "ProviderStatus" (
    "name" TEXT NOT NULL,
    "blockedUntil" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,

    CONSTRAINT "ProviderStatus_pkey" PRIMARY KEY ("name")
);
