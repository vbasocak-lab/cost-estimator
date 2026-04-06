-- AlterTable: Add new columns to ProjectVersion
ALTER TABLE "ProjectVersion" ADD COLUMN IF NOT EXISTS "buildingUsage" TEXT NOT NULL DEFAULT 'single_family';
ALTER TABLE "ProjectVersion" ADD COLUMN IF NOT EXISTS "estimationMode" TEXT NOT NULL DEFAULT 'standard';
ALTER TABLE "ProjectVersion" ADD COLUMN IF NOT EXISTS "surfaceShonM2" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "ProjectVersion" ADD COLUMN IF NOT EXISTS "surfaceShabM2" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "ProjectVersion" ADD COLUMN IF NOT EXISTS "aboveGroundFloors" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "ProjectVersion" ADD COLUMN IF NOT EXISTS "basementFloors" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ProjectVersion" ADD COLUMN IF NOT EXISTS "bedroomCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ProjectVersion" ADD COLUMN IF NOT EXISTS "wcCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ProjectVersion" ADD COLUMN IF NOT EXISTS "roomCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ProjectVersion" ADD COLUMN IF NOT EXISTS "hasStair" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ProjectVersion" ADD COLUMN IF NOT EXISTS "stairType" TEXT NOT NULL DEFAULT 'straight';
ALTER TABLE "ProjectVersion" ADD COLUMN IF NOT EXISTS "stairFinish" TEXT NOT NULL DEFAULT 'wood';
ALTER TABLE "ProjectVersion" ADD COLUMN IF NOT EXISTS "structureType" TEXT NOT NULL DEFAULT 'concrete';
ALTER TABLE "ProjectVersion" ADD COLUMN IF NOT EXISTS "energyStandard" TEXT NOT NULL DEFAULT 're2020';
ALTER TABLE "ProjectVersion" ADD COLUMN IF NOT EXISTS "heatingSystem" TEXT NOT NULL DEFAULT 'gas';
ALTER TABLE "ProjectVersion" ADD COLUMN IF NOT EXISTS "heatingDistribution" TEXT NOT NULL DEFAULT 'radiators';
ALTER TABLE "ProjectVersion" ADD COLUMN IF NOT EXISTS "electricLevel" TEXT NOT NULL DEFAULT 'standard';
ALTER TABLE "ProjectVersion" ADD COLUMN IF NOT EXISTS "elevatorRequired" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ProjectVersion" ADD COLUMN IF NOT EXISTS "windowAreaRatio" DOUBLE PRECISION NOT NULL DEFAULT 0.15;
ALTER TABLE "ProjectVersion" ADD COLUMN IF NOT EXISTS "windowGlazingType" TEXT NOT NULL DEFAULT 'double';
ALTER TABLE "ProjectVersion" ADD COLUMN IF NOT EXISTS "windowFrameType" TEXT NOT NULL DEFAULT 'pvc';
ALTER TABLE "ProjectVersion" ADD COLUMN IF NOT EXISTS "windowOpeningType" TEXT NOT NULL DEFAULT 'casement';
ALTER TABLE "ProjectVersion" ADD COLUMN IF NOT EXISTS "roofWindowCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ProjectVersion" ADD COLUMN IF NOT EXISTS "doorWindowType" TEXT NOT NULL DEFAULT 'standard';
ALTER TABLE "ProjectVersion" ADD COLUMN IF NOT EXISTS "interiorDoorCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ProjectVersion" ADD COLUMN IF NOT EXISTS "interiorDoorType" TEXT NOT NULL DEFAULT 'standard';
ALTER TABLE "ProjectVersion" ADD COLUMN IF NOT EXISTS "bathroomLevel" TEXT NOT NULL DEFAULT 'standard';
ALTER TABLE "ProjectVersion" ADD COLUMN IF NOT EXISTS "bathroomType" TEXT NOT NULL DEFAULT 'shower';
ALTER TABLE "ProjectVersion" ADD COLUMN IF NOT EXISTS "wcType" TEXT NOT NULL DEFAULT 'suspended';
ALTER TABLE "ProjectVersion" ADD COLUMN IF NOT EXISTS "showerType" TEXT NOT NULL DEFAULT 'standard';
ALTER TABLE "ProjectVersion" ADD COLUMN IF NOT EXISTS "vanityType" TEXT NOT NULL DEFAULT 'standard';
ALTER TABLE "ProjectVersion" ADD COLUMN IF NOT EXISTS "bathtubType" TEXT NOT NULL DEFAULT 'standard';
ALTER TABLE "ProjectVersion" ADD COLUMN IF NOT EXISTS "kitchenType" TEXT NOT NULL DEFAULT 'standard';
ALTER TABLE "ProjectVersion" ADD COLUMN IF NOT EXISTS "kitchenCredenceType" TEXT NOT NULL DEFAULT 'tile';
ALTER TABLE "ProjectVersion" ADD COLUMN IF NOT EXISTS "hasBuanderie" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ProjectVersion" ADD COLUMN IF NOT EXISTS "hasCellier" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ProjectVersion" ADD COLUMN IF NOT EXISTS "cellierStorageLevel" TEXT NOT NULL DEFAULT 'none';
ALTER TABLE "ProjectVersion" ADD COLUMN IF NOT EXISTS "finishLevel" TEXT NOT NULL DEFAULT 'standard';
ALTER TABLE "ProjectVersion" ADD COLUMN IF NOT EXISTS "riskPercent" DOUBLE PRECISION NOT NULL DEFAULT 8;
ALTER TABLE "ProjectVersion" ADD COLUMN IF NOT EXISTS "overheadPercent" DOUBLE PRECISION NOT NULL DEFAULT 5;
ALTER TABLE "ProjectVersion" ADD COLUMN IF NOT EXISTS "profitPercent" DOUBLE PRECISION NOT NULL DEFAULT 8;
ALTER TABLE "ProjectVersion" ADD COLUMN IF NOT EXISTS "vatPercent" DOUBLE PRECISION NOT NULL DEFAULT 20;

-- CreateTable: PriceCodeMapping
CREATE TABLE IF NOT EXISTS "PriceCodeMapping" (
    "id" TEXT NOT NULL,
    "inputKey" TEXT NOT NULL,
    "inputValue" TEXT NOT NULL,
    "targetLot" TEXT NOT NULL,
    "defaultCodes" TEXT[],
    "overrideCodes" TEXT[],
    "replaceMode" TEXT NOT NULL DEFAULT 'merge',
    "quantityMode" TEXT NOT NULL DEFAULT 'auto',
    "quantityValue" DOUBLE PRECISION,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "countryId" TEXT,
    CONSTRAINT "PriceCodeMapping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PriceCodeMapping_inputKey_inputValue_isActive_idx" ON "PriceCodeMapping"("inputKey", "inputValue", "isActive");
CREATE INDEX IF NOT EXISTS "PriceCodeMapping_targetLot_isActive_idx" ON "PriceCodeMapping"("targetLot", "isActive");

-- AddForeignKey
ALTER TABLE "PriceCodeMapping" DROP CONSTRAINT IF EXISTS "PriceCodeMapping_countryId_fkey";
ALTER TABLE "PriceCodeMapping" ADD CONSTRAINT "PriceCodeMapping_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;
