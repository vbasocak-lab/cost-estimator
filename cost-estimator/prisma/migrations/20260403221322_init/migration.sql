-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "brandName" TEXT,
    "countryCode" TEXT NOT NULL DEFAULT 'FR',
    "vatNumber" TEXT,
    "currencyCode" TEXT NOT NULL DEFAULT 'EUR',
    "defaultLanguage" TEXT NOT NULL DEFAULT 'fr',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'estimator',
    "preferredLanguage" TEXT NOT NULL DEFAULT 'fr',
    "companyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "defaultCurrency" TEXT NOT NULL DEFAULT 'EUR',
    "defaultVatRate" DOUBLE PRECISION NOT NULL DEFAULT 0.20,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "coefficientDefault" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectType" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProjectType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectTypeTranslation" (
    "id" TEXT NOT NULL,
    "projectTypeId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "ProjectTypeTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuildingUse" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "BuildingUse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuildingUseTranslation" (
    "id" TEXT NOT NULL,
    "buildingUseId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "BuildingUseTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinishLevel" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "coefficient" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "FinishLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RenovationScope" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "coefficient" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "RenovationScope_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnergyStandard" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "EnergyStandard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StructureSystem" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "StructureSystem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "ownerUserId" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "regionId" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "projectTypeId" TEXT,
    "buildingUseId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectVersion" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL DEFAULT 1,
    "label" TEXT NOT NULL DEFAULT 'V1',
    "grossAreaM2" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netAreaM2" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "floorsAboveGround" INTEGER NOT NULL DEFAULT 1,
    "floorsBelowGround" INTEGER NOT NULL DEFAULT 0,
    "commonAreaRatio" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
    "facadeComplexity" TEXT NOT NULL DEFAULT 'standard',
    "finishLevelId" TEXT,
    "energyStandardId" TEXT,
    "structureSystemId" TEXT,
    "renovationScopeId" TEXT,
    "hvacLevel" TEXT NOT NULL DEFAULT 'standard',
    "electricalLevel" TEXT NOT NULL DEFAULT 'standard',
    "heatingType" TEXT NOT NULL DEFAULT 'gas',
    "ventilationType" TEXT NOT NULL DEFAULT 'simple',
    "roofType" TEXT NOT NULL DEFAULT 'pitched',
    "hasElevator" BOOLEAN NOT NULL DEFAULT false,
    "contingencyRate" DOUBLE PRECISION NOT NULL DEFAULT 0.08,
    "overheadRate" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
    "profitRate" DOUBLE PRECISION NOT NULL DEFAULT 0.08,
    "vatRate" DOUBLE PRECISION NOT NULL DEFAULT 0.20,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectInput" (
    "id" TEXT NOT NULL,
    "projectVersionId" TEXT NOT NULL,
    "inputKey" TEXT NOT NULL,
    "inputValue" TEXT NOT NULL,
    "unit" TEXT,

    CONSTRAINT "ProjectInput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostCategory" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CostCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostCategoryTranslation" (
    "id" TEXT NOT NULL,
    "costCategoryId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "CostCategoryTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostLot" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "defaultUnit" TEXT NOT NULL DEFAULT 'm2',
    "calculationMode" TEXT NOT NULL DEFAULT 'formula',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CostLot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostLotTranslation" (
    "id" TEXT NOT NULL,
    "costLotId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "CostLotTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceItem" (
    "id" TEXT NOT NULL,
    "costLotId" TEXT NOT NULL,
    "itemCode" TEXT NOT NULL,
    "referenceName" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "basePriceHt" DOUBLE PRECISION NOT NULL,
    "countryId" TEXT NOT NULL,
    "regionId" TEXT,
    "finishLevelId" TEXT,
    "renovationScopeId" TEXT,
    "complexityMin" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "complexityMax" DOUBLE PRECISION NOT NULL DEFAULT 999,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validTo" TIMESTAMP(3),
    "sourceType" TEXT NOT NULL DEFAULT 'internal',
    "sourceNote" TEXT,
    "confidenceLevel" TEXT NOT NULL DEFAULT 'medium',
    "indexCode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PriceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceItemTranslation" (
    "id" TEXT NOT NULL,
    "priceItemId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "shortDescription" TEXT,

    CONSTRAINT "PriceItemTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceUpdateLog" (
    "id" TEXT NOT NULL,
    "priceItemId" TEXT NOT NULL,
    "oldPriceHt" DOUBLE PRECISION NOT NULL,
    "newPriceHt" DOUBLE PRECISION NOT NULL,
    "updateMethod" TEXT NOT NULL DEFAULT 'manual',
    "indexRef" TEXT,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceUpdateLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketIndex" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "periodDate" TIMESTAMP(3) NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "sourceUrl" TEXT,

    CONSTRAINT "MarketIndex_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegionalCoefficient" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "costLotId" TEXT,
    "coefficient" DOUBLE PRECISION NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validTo" TIMESTAMP(3),

    CONSTRAINT "RegionalCoefficient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualityCoefficient" (
    "id" TEXT NOT NULL,
    "finishLevelId" TEXT NOT NULL,
    "costLotId" TEXT,
    "coefficient" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "QualityCoefficient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplexityCoefficient" (
    "id" TEXT NOT NULL,
    "complexityCode" TEXT NOT NULL,
    "costLotId" TEXT,
    "coefficient" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ComplexityCoefficient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalculationRule" (
    "id" TEXT NOT NULL,
    "ruleCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ruleType" TEXT NOT NULL DEFAULT 'condition',
    "inputSchemaJson" TEXT,
    "formulaExpression" TEXT,
    "outputTarget" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "countryId" TEXT,

    CONSTRAINT "CalculationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RuleCondition" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "compareValue" TEXT NOT NULL,

    CONSTRAINT "RuleCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalculationResult" (
    "id" TEXT NOT NULL,
    "projectVersionId" TEXT NOT NULL,
    "totalCostHt" DOUBLE PRECISION NOT NULL,
    "totalCostTva" DOUBLE PRECISION NOT NULL,
    "totalCostTtc" DOUBLE PRECISION NOT NULL,
    "costPerM2Ht" DOUBLE PRECISION NOT NULL,
    "costPerM2Ttc" DOUBLE PRECISION NOT NULL,
    "confidenceLevel" TEXT NOT NULL DEFAULT 'indicatif',
    "breakdownJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalculationResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalculationResultLine" (
    "id" TEXT NOT NULL,
    "calculationResultId" TEXT NOT NULL,
    "costLotId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "unitPriceHt" DOUBLE PRECISION NOT NULL,
    "lineTotalHt" DOUBLE PRECISION NOT NULL,
    "appliedCoefficientsJson" TEXT,

    CONSTRAINT "CalculationResultLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "projectVersionId" TEXT NOT NULL,
    "reportType" TEXT NOT NULL DEFAULT 'summary',
    "languageCode" TEXT NOT NULL DEFAULT 'fr',
    "filePath" TEXT,
    "generatedById" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Country_code_key" ON "Country"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Region_countryId_code_key" ON "Region"("countryId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectType_code_key" ON "ProjectType"("code");

-- CreateIndex
CREATE UNIQUE INDEX "BuildingUse_code_key" ON "BuildingUse"("code");

-- CreateIndex
CREATE UNIQUE INDEX "FinishLevel_code_key" ON "FinishLevel"("code");

-- CreateIndex
CREATE UNIQUE INDEX "RenovationScope_code_key" ON "RenovationScope"("code");

-- CreateIndex
CREATE UNIQUE INDEX "EnergyStandard_code_key" ON "EnergyStandard"("code");

-- CreateIndex
CREATE UNIQUE INDEX "StructureSystem_code_key" ON "StructureSystem"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CostCategory_code_key" ON "CostCategory"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CostLot_code_key" ON "CostLot"("code");

-- CreateIndex
CREATE UNIQUE INDEX "PriceItem_itemCode_key" ON "PriceItem"("itemCode");

-- CreateIndex
CREATE UNIQUE INDEX "CalculationRule_ruleCode_key" ON "CalculationRule"("ruleCode");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Region" ADD CONSTRAINT "Region_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTypeTranslation" ADD CONSTRAINT "ProjectTypeTranslation_projectTypeId_fkey" FOREIGN KEY ("projectTypeId") REFERENCES "ProjectType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuildingUseTranslation" ADD CONSTRAINT "BuildingUseTranslation_buildingUseId_fkey" FOREIGN KEY ("buildingUseId") REFERENCES "BuildingUse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_projectTypeId_fkey" FOREIGN KEY ("projectTypeId") REFERENCES "ProjectType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_buildingUseId_fkey" FOREIGN KEY ("buildingUseId") REFERENCES "BuildingUse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectVersion" ADD CONSTRAINT "ProjectVersion_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectVersion" ADD CONSTRAINT "ProjectVersion_finishLevelId_fkey" FOREIGN KEY ("finishLevelId") REFERENCES "FinishLevel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectVersion" ADD CONSTRAINT "ProjectVersion_energyStandardId_fkey" FOREIGN KEY ("energyStandardId") REFERENCES "EnergyStandard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectVersion" ADD CONSTRAINT "ProjectVersion_structureSystemId_fkey" FOREIGN KEY ("structureSystemId") REFERENCES "StructureSystem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectVersion" ADD CONSTRAINT "ProjectVersion_renovationScopeId_fkey" FOREIGN KEY ("renovationScopeId") REFERENCES "RenovationScope"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectInput" ADD CONSTRAINT "ProjectInput_projectVersionId_fkey" FOREIGN KEY ("projectVersionId") REFERENCES "ProjectVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostCategoryTranslation" ADD CONSTRAINT "CostCategoryTranslation_costCategoryId_fkey" FOREIGN KEY ("costCategoryId") REFERENCES "CostCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostLot" ADD CONSTRAINT "CostLot_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CostCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostLotTranslation" ADD CONSTRAINT "CostLotTranslation_costLotId_fkey" FOREIGN KEY ("costLotId") REFERENCES "CostLot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceItem" ADD CONSTRAINT "PriceItem_costLotId_fkey" FOREIGN KEY ("costLotId") REFERENCES "CostLot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceItem" ADD CONSTRAINT "PriceItem_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceItem" ADD CONSTRAINT "PriceItem_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceItem" ADD CONSTRAINT "PriceItem_finishLevelId_fkey" FOREIGN KEY ("finishLevelId") REFERENCES "FinishLevel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceItem" ADD CONSTRAINT "PriceItem_renovationScopeId_fkey" FOREIGN KEY ("renovationScopeId") REFERENCES "RenovationScope"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceItemTranslation" ADD CONSTRAINT "PriceItemTranslation_priceItemId_fkey" FOREIGN KEY ("priceItemId") REFERENCES "PriceItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceUpdateLog" ADD CONSTRAINT "PriceUpdateLog_priceItemId_fkey" FOREIGN KEY ("priceItemId") REFERENCES "PriceItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceUpdateLog" ADD CONSTRAINT "PriceUpdateLog_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketIndex" ADD CONSTRAINT "MarketIndex_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionalCoefficient" ADD CONSTRAINT "RegionalCoefficient_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionalCoefficient" ADD CONSTRAINT "RegionalCoefficient_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionalCoefficient" ADD CONSTRAINT "RegionalCoefficient_costLotId_fkey" FOREIGN KEY ("costLotId") REFERENCES "CostLot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityCoefficient" ADD CONSTRAINT "QualityCoefficient_finishLevelId_fkey" FOREIGN KEY ("finishLevelId") REFERENCES "FinishLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityCoefficient" ADD CONSTRAINT "QualityCoefficient_costLotId_fkey" FOREIGN KEY ("costLotId") REFERENCES "CostLot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplexityCoefficient" ADD CONSTRAINT "ComplexityCoefficient_costLotId_fkey" FOREIGN KEY ("costLotId") REFERENCES "CostLot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalculationRule" ADD CONSTRAINT "CalculationRule_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RuleCondition" ADD CONSTRAINT "RuleCondition_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "CalculationRule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalculationResult" ADD CONSTRAINT "CalculationResult_projectVersionId_fkey" FOREIGN KEY ("projectVersionId") REFERENCES "ProjectVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalculationResultLine" ADD CONSTRAINT "CalculationResultLine_calculationResultId_fkey" FOREIGN KEY ("calculationResultId") REFERENCES "CalculationResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalculationResultLine" ADD CONSTRAINT "CalculationResultLine_costLotId_fkey" FOREIGN KEY ("costLotId") REFERENCES "CostLot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_projectVersionId_fkey" FOREIGN KEY ("projectVersionId") REFERENCES "ProjectVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
