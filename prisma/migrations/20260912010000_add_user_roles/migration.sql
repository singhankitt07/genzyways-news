ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'READER';

UPDATE "User" SET "role" = 'ADMIN' WHERE "email" = 'abhisingh912218@gmail.com';
