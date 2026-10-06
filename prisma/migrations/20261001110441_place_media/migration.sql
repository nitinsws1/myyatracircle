/*
  Warnings:

  - You are about to drop the `PlaceImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- DropForeignKey
ALTER TABLE "PlaceImage" DROP CONSTRAINT "PlaceImage_placeId_fkey";

-- AlterTable
ALTER TABLE "Place" ADD COLUMN     "thumbnailImage" TEXT;

-- DropTable
DROP TABLE "PlaceImage";

-- CreateTable
CREATE TABLE "PlaceMedia" (
    "id" SERIAL NOT NULL,
    "placeId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "type" "MediaType" NOT NULL DEFAULT 'IMAGE',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PlaceMedia_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PlaceMedia" ADD CONSTRAINT "PlaceMedia_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;
