/*
  Warnings:

  - You are about to drop the `DestinationImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DestinationImage" DROP CONSTRAINT "DestinationImage_destinationId_fkey";

-- AlterTable
ALTER TABLE "Destination" ADD COLUMN     "bannerType" "MediaType" NOT NULL DEFAULT 'IMAGE';

-- AlterTable
ALTER TABLE "Place" ADD COLUMN     "heroType" "MediaType" NOT NULL DEFAULT 'IMAGE';

-- DropTable
DROP TABLE "DestinationImage";

-- CreateTable
CREATE TABLE "DestinationMedia" (
    "id" SERIAL NOT NULL,
    "destinationId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "type" "MediaType" NOT NULL DEFAULT 'IMAGE',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DestinationMedia_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DestinationMedia" ADD CONSTRAINT "DestinationMedia_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;
