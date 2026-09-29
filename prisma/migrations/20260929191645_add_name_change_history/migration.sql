-- AlterTable
ALTER TABLE "User" ADD COLUMN     "nameChangeTimestamps" TIMESTAMP(3)[] DEFAULT ARRAY[]::TIMESTAMP(3)[];
