/*
  Warnings:

  - You are about to drop the `ExperienceImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ExperienceImage" DROP CONSTRAINT "ExperienceImage_experienceId_fkey";

-- AlterTable
ALTER TABLE "Experience" ADD COLUMN     "heroImage" TEXT,
ADD COLUMN     "heroType" "MediaType" NOT NULL DEFAULT 'IMAGE';

-- DropTable
DROP TABLE "ExperienceImage";

-- CreateTable
CREATE TABLE "ExperienceMedia" (
    "id" SERIAL NOT NULL,
    "experienceId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "type" "MediaType" NOT NULL DEFAULT 'IMAGE',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ExperienceMedia_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ExperienceMedia" ADD CONSTRAINT "ExperienceMedia_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "Experience"("id") ON DELETE CASCADE ON UPDATE CASCADE;
