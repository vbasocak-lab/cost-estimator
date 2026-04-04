-- AlterTable
ALTER TABLE "CalculationRule" ADD COLUMN     "actionJson" TEXT,
ADD COLUMN     "conditionJson" TEXT,
ADD COLUMN     "labelFr" TEXT,
ADD COLUMN     "labelTr" TEXT,
ADD COLUMN     "regionScope" TEXT;

-- AlterTable
ALTER TABLE "ProjectVersion" ADD COLUMN     "bathroomCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "buildingAge" TEXT,
ADD COLUMN     "energyPackage" TEXT,
ADD COLUMN     "hasKitchen" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "siteAccess" TEXT;
