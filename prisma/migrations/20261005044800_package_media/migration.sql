/*
  Warnings:

  - You are about to drop the `PackageImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PackageImage" DROP CONSTRAINT "PackageImage_packageId_fkey";

-- AlterTable
ALTER TABLE "TourPackage" ADD COLUMN     "heroImage" TEXT,
ADD COLUMN     "heroType" "MediaType" NOT NULL DEFAULT 'IMAGE';

-- DropTable
DROP TABLE "PackageImage";

-- CreateTable
CREATE TABLE "PackageMedia" (
    "id" SERIAL NOT NULL,
    "packageId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "type" "MediaType" NOT NULL DEFAULT 'IMAGE',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PackageMedia_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PackageMedia" ADD CONSTRAINT "PackageMedia_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "TourPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
