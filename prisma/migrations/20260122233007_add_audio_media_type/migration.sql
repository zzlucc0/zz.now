-- AlterEnum
ALTER TYPE "MediaType" ADD VALUE 'AUDIO';

-- AlterTable
ALTER TABLE "PostMedia" ADD COLUMN     "isBackgroundMusic" BOOLEAN NOT NULL DEFAULT false;
