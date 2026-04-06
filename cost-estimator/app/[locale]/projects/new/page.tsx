"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { generateDefaultProgram } from "@/lib/engine/project-defaults";

// ── Types ─────────────────────────────────────────────────────────────────────
interface WizardData {
  // Step 1
  projectName: string;
  countryCode: string;
  regionCode: string;
  city: string;
  projectTypeCode: string;
  buildingUseCode: string;
  // Step 2
  grossAreaM2: number;
  netAreaM2: number;
  floorsAboveGround: number;
  floorsBelowGround: number;
  commonAreaRatio: number;
  facadeComplexity: string;
  roofType: string;
  // Step 3 - Technical profile
  structureSystemCode: string;
  heatingType: string;
  heatingDistribution: string;
  ventilationType: string;
  electricalLevel: string;
  hasElevator: boolean;
  energyStandardCode: string;
  // Step 4 - Program + Finish
  finishLevelCode: string;
  contingencyRate: number;
  overheadRate: number;
  profitRate: number;
  vatRate: number;
  // Step 4 - New fields
  bathroomCount: number;
  wcCount: number;
  bedroomCount: number;
  roomCount: number;
  interiorDoorCount: number;
  hasStair: boolean;
  stairType: string;
  stairFinish: string;
  kitchenType: string;
  kitchenCredenceType: string;
  hasBuanderie: boolean;
  hasCellier: boolean;
  cellierStorageLevel: string;
  windowGlazingType: string;
  windowFrameType: string;
  windowOpeningType: string;
  windowAreaRatio: number;
  roofWindowCount: number;
  interiorDoorType: string;
  bathroomLevel: string;
  bathroomType: string;
  // Step 5
  label: string;
}

const REGIONS = [
  { code: "IDF", name: "Île-de-France", coef: 1.28 },
  { code: "PACA", name: "Provence-Alpes-Côte d'Azur", coef: 1.12 },
  { code: "ARA", name: "Auvergne-Rhône-Alpes", coef: 1.06 },
  { code: "OCC", name: "Occitanie", coef: 1.00 },
  { code: "NAQ", name: "Nouvelle-Aquitaine", coef: 0.97 },
  { code: "BFC", name: "Bourgogne-Franche-Comté", coef: 0.94 },
  { code: "HDF", name: "Hauts-de-France", coef: 0.96 },
  { code: "GES", name: "Grand Est", coef: 0.95 },
  { code: "NOR", name: "Normandie", coef: 0.96 },
  { code: "BRE", name: "Bretagne", coef: 0.95 },
  { code: "PDL", name: "Pays de la Loire", coef: 0.97 },
  { code: "CVL", name: "Centre-Val de Loire", coef: 0.95 },
];

const FINISH_BASE_COSTS: Record<string, number> = {
  standard: 1200,
  premium: 1500,
  luxury: 1860,
};

function estimateCostPerM2(data: WizardData): number {
  const baseCost = FINISH_BASE_COSTS[data.finishLevelCode] || 1200;
  const region = REGIONS.find((r) => r.code === data.regionCode);
  const regionCoef = region?.coef || 1.0;
  const floorCoef = data.floorsAboveGround >= 4 ? 1.08 : 1.0;
  const basementCoef = data.floorsBelowGround > 0 ? 1.12 : 1.0;
  return baseCost * regionCoef * floorCoef * basementCoef;
}

function computeDataCompleteness(data: WizardData): number {
  const fields = [
    data.projectName, data.regionCode, data.projectTypeCode, data.buildingUseCode,
    data.grossAreaM2 > 0, data.floorsAboveGround > 0,
    data.structureSystemCode, data.heatingType, data.energyStandardCode,
    data.finishLevelCode,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

// ── Reusable field components ─────────────────────────────────────────────────

function InputField({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-1.5">{label}</label>
      <input
        {...props}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}

function SelectField({
  label,
  options,
  placeholder,
  ...props
}: {
  label: string;
  options: { value: string; label: string }[];
  placeholder?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-1.5">{label}</label>
      <select
        {...props}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
      >
        <option value="">{placeholder ?? "..."}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

// ── Main wizard ───────────────────────────────────────────────────────────────

export default function NewProjectPage() {
  const router = useRouter();
  const params = useParams();
  const rawLocale = params.locale;
  const locale = Array.isArray(rawLocale) ? rawLocale[0] : (rawLocale ?? "fr");
  const { data: session } = useSession();
  const t = useTranslations("wizard");

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [data, setData] = useState<WizardData>({
    projectName: "",
    countryCode: "FR",
    regionCode: "",
    city: "",
    projectTypeCode: "",
    buildingUseCode: "",
    grossAreaM2: 0,
    netAreaM2: 0,
    floorsAboveGround: 1,
    floorsBelowGround: 0,
    commonAreaRatio: 0.15,
    facadeComplexity: "standard",
    roofType: "pitched",
    structureSystemCode: "concrete",
    heatingType: "gas",
    heatingDistribution: "radiators",
    ventilationType: "simple",
    electricalLevel: "standard",
    hasElevator: false,
    energyStandardCode: "re2020",
    finishLevelCode: "standard",
    contingencyRate: 8,
    overheadRate: 5,
    profitRate: 8,
    vatRate: 20,
    // New fields
    bathroomCount: 1,
    wcCount: 1,
    bedroomCount: 2,
    roomCount: 4,
    interiorDoorCount: 5,
    hasStair: false,
    stairType: "straight",
    stairFinish: "wood",
    kitchenType: "standard",
    kitchenCredenceType: "tile",
    hasBuanderie: false,
    hasCellier: false,
    cellierStorageLevel: "none",
    windowGlazingType: "double",
    windowFrameType: "pvc",
    windowOpeningType: "casement",
    windowAreaRatio: 0.15,
    roofWindowCount: 0,
    interiorDoorType: "standard",
    bathroomLevel: "standard",
    bathroomType: "shower",
    label: "V1",
  });

  const set = (field: keyof WizardData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const rawValue = e.target.value;
    const val = e.target.type === "checkbox"
      ? (e.target as HTMLInputElement).checked
      : e.target.type === "number"
      ? Number.parseFloat(rawValue.replace(",", ".")) || 0
      : rawValue;
    setData((prev) => ({ ...prev, [field]: val }));
  };

  // Auto-compute default program values when SHAB changes
  useEffect(() => {
    const shab = data.netAreaM2 > 0 ? data.netAreaM2 : data.grossAreaM2 * 0.85;
    if (shab > 0) {
      const defaults = generateDefaultProgram(shab, data.floorsAboveGround);
      setData((prev) => ({
        ...prev,
        bedroomCount: defaults.bedroomCount,
        bathroomCount: defaults.bathroomCount,
        wcCount: defaults.wcCount,
        roomCount: defaults.roomCount,
        interiorDoorCount: defaults.interiorDoorCount,
        hasStair: defaults.hasStair,
        kitchenType: defaults.kitchenType,
      }));
    }
  }, [data.grossAreaM2, data.netAreaM2, data.floorsAboveGround]);

  const STEPS = [t("step1"), t("step2"), t("step3"), t("step4"), t("step5")];
  const effectiveGrossAreaM2 = data.grossAreaM2 > 0 ? data.grossAreaM2 : data.netAreaM2;
  const estimatedCostPerM2 = estimateCostPerM2(data);
  const estimatedTotal = estimatedCostPerM2 * (effectiveGrossAreaM2 || 0) * (1 + data.vatRate / 100);
  const completeness = computeDataCompleteness(data);

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      const projRes = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: data.projectName,
          countryCode: data.countryCode,
          regionCode: data.regionCode,
          city: data.city,
          projectTypeCode: data.projectTypeCode,
          buildingUseCode: data.buildingUseCode,
        }),
      });
      if (!projRes.ok) {
        const err = await projRes.json().catch(() => ({}));
        throw new Error(err.error || t("errorStatus", { status: projRes.status }));
      }
      const project = await projRes.json();

      const versionRes = await fetch(`/api/projects/${project.id}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Version label
          label: data.label,
          regionCode: data.regionCode,
          // Surface (canonical names used by API route)
          grossAreaM2: effectiveGrossAreaM2,
          netAreaM2: data.netAreaM2 || effectiveGrossAreaM2 * 0.85,
          surfaceShonM2: effectiveGrossAreaM2,
          surfaceShabM2: data.netAreaM2 || effectiveGrossAreaM2 * 0.85,
          // Floors
          floorsAboveGround: data.floorsAboveGround,
          aboveGroundFloors: data.floorsAboveGround,
          floorsBelowGround: data.floorsBelowGround,
          basementFloors: data.floorsBelowGround,
          commonAreaRatio: data.commonAreaRatio,
          // Geometry
          facadeComplexity: data.facadeComplexity,
          roofType: data.roofType,
          // Legacy relation lookups
          structureSystemCode: data.structureSystemCode,
          energyStandardCode: data.energyStandardCode,
          finishLevelCode: data.finishLevelCode,
          renovationScopeCode: "",
          // Flat scalar equivalents (new engine uses these)
          structureType: data.structureSystemCode,
          energyStandard: data.energyStandardCode,
          finishLevel: data.finishLevelCode,
          buildingUsage: data.buildingUseCode,
          // Heating (single canonical set)
          heatingType: data.heatingType,
          heatingSystem: data.heatingType,
          heatingDistribution: data.heatingDistribution,
          ventilationType: data.ventilationType,
          // Electric / elevator (single canonical set)
          electricalLevel: data.electricalLevel,
          electricLevel: data.electricalLevel,
          hasElevator: data.hasElevator,
          elevatorRequired: data.hasElevator,
          // Rates (sent as decimals — server expects 0-1 range)
          contingencyRate: data.contingencyRate / 100,
          overheadRate: data.overheadRate / 100,
          profitRate: data.profitRate / 100,
          vatRate: data.vatRate / 100,
          // New flat rate fields (server reads raw % value)
          riskPercent: data.contingencyRate,
          overheadPercent: data.overheadRate,
          profitPercent: data.profitRate,
          vatPercent: data.vatRate,
          // Program
          bathroomCount: data.bathroomCount,
          wcCount: data.wcCount,
          bedroomCount: data.bedroomCount,
          roomCount: data.roomCount,
          interiorDoorCount: data.interiorDoorCount,
          // Stairs
          hasStair: data.hasStair,
          stairType: data.stairType,
          stairFinish: data.stairFinish,
          // Windows
          windowGlazingType: data.windowGlazingType,
          windowFrameType: data.windowFrameType,
          windowOpeningType: data.windowOpeningType,
          windowAreaRatio: data.windowAreaRatio,
          roofWindowCount: data.roofWindowCount,
          // Interior doors
          interiorDoorType: data.interiorDoorType,
          // Bathrooms
          bathroomLevel: data.bathroomLevel,
          bathroomType: data.bathroomType,
          // Kitchen
          kitchenType: data.kitchenType,
          kitchenCredenceType: data.kitchenCredenceType,
          // Extra rooms
          hasBuanderie: data.hasBuanderie,
          hasCellier: data.hasCellier,
          cellierStorageLevel: data.cellierStorageLevel,
        }),
      });
      if (!versionRes.ok) {
        const err = await versionRes.json().catch(() => ({}));
        throw new Error(err.error || t("errorStatus", { status: versionRes.status }));
      }
      const version = await versionRes.json();

      await fetch(
        `/api/projects/${project.id}/versions/${version.id}/calculate`,
        { method: "POST", headers: { "Content-Type": "application/json" } }
      )
        .then((res) => { if (!res.ok) console.warn("[wizard] Calculation returned", res.status); })
        .catch((err) => console.warn("[wizard] Calculation network error:", err));

      router.push(`/${locale}/projects/${project.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("errorGeneric");
      setSubmitError(msg);
      setSubmitting(false);
    }
  };

  const confidenceLabel =
    completeness >= 80 ? t("avance") : completeness >= 50 ? t("affine") : t("indicatif");

  const PROJECT_TYPE_LABELS = useMemo<Record<string, string>>(() => ({
    new_build: t("projectTypeNewBuild"),
    renovation: t("projectTypeRenovation"),
    extension: t("projectTypeExtension"),
  }), [t]);

  const HEATING_LABELS = useMemo<Record<string, string>>(() => ({
    gas: t("heatingGas"),
    heat_pump: t("heatingHeatPump"),
    electric: t("heatingElectric"),
    district: t("heatingDistrict"),
  }), [t]);

  const ENERGY_LABELS = useMemo<Record<string, string>>(() => ({
    re2020: t("energyRe2020"),
    rt2012: t("energyRt2012"),
    bbc: t("energyBbc"),
    passive: t("energyPassive"),
  }), [t]);

  const FINISH_LABELS = useMemo<Record<string, string>>(() => ({
    standard: t("finishStandard"),
    premium: t("finishPremium"),
    luxury: t("finishLuxury"),
  }), [t]);

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <p className="text-gray-600 mt-1">{t("subtitle")}</p>
      </div>

      <div className="flex gap-8">
        {/* Left: Form */}
        <div className="flex-1">
          {/* Step indicator */}
          <div className="flex mb-8">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center flex-1">
                <button
                  onClick={() => i <= step && setStep(i)}
                  className={`flex items-center gap-2 ${i <= step ? "cursor-pointer" : "cursor-default"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                      i < step
                        ? "bg-blue-600 text-white"
                        : i === step
                        ? "bg-blue-600 text-white ring-4 ring-blue-100"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {i < step ? "✓" : i + 1}
                  </div>
                  <span
                    className={`text-xs font-medium hidden md:block ${
                      i === step ? "text-blue-600" : i < step ? "text-gray-700" : "text-gray-400"
                    }`}
                  >
                    {s}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 ${i < step ? "bg-blue-600" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step content */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">

            {/* Step 1 — Identity */}
            {step === 0 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-5">{t("step1Title")}</h2>
                <InputField
                  label={t("projectName")}
                  value={data.projectName}
                  onChange={set("projectName")}
                  placeholder={t("projectNamePlaceholder")}
                />
                <div className="grid grid-cols-2 gap-4">
                  <SelectField
                    label={t("projectType")}
                    value={data.projectTypeCode}
                    onChange={set("projectTypeCode")}
                    placeholder={t("selectPlaceholder")}
                    options={[
                      { value: "new_build", label: t("projectTypeNewBuild") },
                      { value: "renovation", label: t("projectTypeRenovation") },
                      { value: "extension", label: t("projectTypeExtension") },
                    ]}
                  />
                  <SelectField
                    label={t("buildingUse")}
                    value={data.buildingUseCode}
                    onChange={set("buildingUseCode")}
                    placeholder={t("selectPlaceholder")}
                    options={[
                      { value: "single_family", label: t("buildingUseSingleFamily") },
                      { value: "multi_family", label: t("buildingUseMultiFamily") },
                      { value: "office", label: t("buildingUseOffice") },
                      { value: "retail", label: t("buildingUseRetail") },
                      { value: "mixed_use", label: t("buildingUseMixedUse") },
                    ]}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <SelectField
                    label={t("region")}
                    value={data.regionCode}
                    onChange={set("regionCode")}
                    placeholder={t("selectPlaceholder")}
                    options={REGIONS.map((r) => ({ value: r.code, label: r.name }))}
                  />
                  <InputField
                    label={t("city")}
                    value={data.city}
                    onChange={set("city")}
                    placeholder={t("cityPlaceholder")}
                  />
                </div>
              </div>
            )}

            {/* Step 2 — Geometry */}
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-5">{t("step2Title")}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label={t("grossArea")}
                    type="number"
                    value={data.grossAreaM2 || ""}
                    onChange={set("grossAreaM2")}
                    placeholder={t("grossAreaPlaceholder")}
                    min={0}
                  />
                  <InputField
                    label={t("netArea")}
                    type="number"
                    value={data.netAreaM2 || ""}
                    onChange={set("netAreaM2")}
                    placeholder={t("netAreaPlaceholder")}
                    min={0}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label={t("floorsAbove")}
                    type="number"
                    value={data.floorsAboveGround}
                    onChange={set("floorsAboveGround")}
                    min={1}
                    max={50}
                  />
                  <InputField
                    label={t("floorsBelow")}
                    type="number"
                    value={data.floorsBelowGround}
                    onChange={set("floorsBelowGround")}
                    min={0}
                    max={5}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <SelectField
                    label={t("facadeComplexity")}
                    value={data.facadeComplexity}
                    onChange={set("facadeComplexity")}
                    placeholder={t("selectPlaceholder")}
                    options={[
                      { value: "simple", label: t("facadeSimple") },
                      { value: "standard", label: t("facadeStandard") },
                      { value: "complex", label: t("facadeComplex") },
                    ]}
                  />
                  <SelectField
                    label={t("roofType")}
                    value={data.roofType}
                    onChange={set("roofType")}
                    placeholder={t("selectPlaceholder")}
                    options={[
                      { value: "flat", label: t("roofFlat") },
                      { value: "pitched", label: t("roofPitched") },
                      { value: "mixed", label: t("roofMixed") },
                    ]}
                  />
                </div>
              </div>
            )}

            {/* Step 3 — Technical profile */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-5">{t("step3Title")}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <SelectField
                    label={t("structureSystem")}
                    value={data.structureSystemCode}
                    onChange={set("structureSystemCode")}
                    placeholder={t("selectPlaceholder")}
                    options={[
                      { value: "concrete", label: t("structureConcrete") },
                      { value: "timber", label: t("structureTimber") },
                      { value: "steel", label: t("structureSteel") },
                      { value: "masonry", label: t("structureMasonry") },
                      { value: "mixed", label: t("structureMixed") },
                    ]}
                  />
                  <SelectField
                    label={t("energyStandard")}
                    value={data.energyStandardCode}
                    onChange={set("energyStandardCode")}
                    placeholder={t("selectPlaceholder")}
                    options={[
                      { value: "re2020", label: t("energyRe2020") },
                      { value: "rt2012", label: t("energyRt2012") },
                      { value: "bbc", label: t("energyBbc") },
                      { value: "passive", label: t("energyPassive") },
                    ]}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <SelectField
                    label={t("heatingType")}
                    value={data.heatingType}
                    onChange={set("heatingType")}
                    placeholder={t("selectPlaceholder")}
                    options={[
                      { value: "gas", label: t("heatingGas") },
                      { value: "heat_pump", label: t("heatingHeatPump") },
                      { value: "electric", label: t("heatingElectric") },
                      { value: "district", label: t("heatingDistrict") },
                    ]}
                  />
                  <SelectField
                    label={t("heatingDistribution")}
                    value={data.heatingDistribution}
                    onChange={set("heatingDistribution")}
                    placeholder={t("selectPlaceholder")}
                    options={[
                      { value: "radiators", label: t("distRadiators") },
                      { value: "floor_heating", label: t("distFloorHeating") },
                    ]}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <SelectField
                    label={t("ventilation")}
                    value={data.ventilationType}
                    onChange={set("ventilationType")}
                    placeholder={t("selectPlaceholder")}
                    options={[
                      { value: "simple", label: t("ventSimple") },
                      { value: "double_flow", label: t("ventDouble") },
                    ]}
                  />
                  <SelectField
                    label={t("electricalLevel")}
                    value={data.electricalLevel}
                    onChange={set("electricalLevel")}
                    placeholder={t("selectPlaceholder")}
                    options={[
                      { value: "standard", label: t("electricalStandard") },
                      { value: "premium", label: t("electricalPremium") },
                    ]}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 pt-6">
                    <input
                      type="checkbox"
                      id="elevator"
                      checked={data.hasElevator}
                      onChange={set("hasElevator")}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="elevator" className="text-sm font-medium text-gray-800">
                      {t("hasElevator")}
                    </label>
                    {data.floorsAboveGround >= 4 && (
                      <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                        {t("elevatorRequired")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4 — Finish */}
            {step === 3 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-5">{t("step4Title")}</h2>
                <SelectField
                  label={t("finishLevel")}
                  value={data.finishLevelCode}
                  onChange={set("finishLevelCode")}
                  placeholder={t("selectPlaceholder")}
                  options={[
                    { value: "standard", label: t("finishStandard") },
                    { value: "premium", label: t("finishPremium") },
                    { value: "luxury", label: t("finishLuxury") },
                  ]}
                />
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm">
                  <div className="font-medium text-blue-900 mb-1">{t("finishImpactTitle")}</div>
                  <div className="text-blue-800">{t("finishImpactDesc")}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label={t("contingency")}
                    type="number"
                    value={data.contingencyRate}
                    onChange={set("contingencyRate")}
                    min={0}
                    max={30}
                  />
                  <InputField
                    label={t("overhead")}
                    type="number"
                    value={data.overheadRate}
                    onChange={set("overheadRate")}
                    min={0}
                    max={30}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label={t("profit")}
                    type="number"
                    value={data.profitRate}
                    onChange={set("profitRate")}
                    min={0}
                    max={50}
                  />
                  <InputField
                    label={t("vat")}
                    type="number"
                    value={data.vatRate}
                    onChange={set("vatRate")}
                    min={0}
                    max={25}
                  />
                </div>
              </div>
            )}

            {/* Step 5 — Summary */}
            {step === 4 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-5">{t("step5Title")}</h2>
                <InputField
                  label={t("versionLabel")}
                  value={data.label}
                  onChange={set("label")}
                  placeholder={t("versionLabelPlaceholder")}
                />
                <div className="space-y-3">
                  {[
                    { label: t("summaryProject"), value: data.projectName || "—" },
                    { label: t("summaryType"), value: PROJECT_TYPE_LABELS[data.projectTypeCode] || data.projectTypeCode || "—" },
                    { label: t("summaryRegion"), value: REGIONS.find(r => r.code === data.regionCode)?.name || "—" },
                    { label: t("summaryArea"), value: effectiveGrossAreaM2 ? `${effectiveGrossAreaM2} m²` : "—" },
                    {
                      label: t("summaryFloors"),
                      value: `${data.floorsAboveGround} ${t("floorsAboveGround")}${data.floorsBelowGround > 0 ? ` + ${data.floorsBelowGround} ${t("basement")}` : ""}`,
                    },
                    { label: t("summaryFinish"), value: FINISH_LABELS[data.finishLevelCode] || data.finishLevelCode || "—" },
                    { label: t("summaryHeating"), value: HEATING_LABELS[data.heatingType] || data.heatingType || "—" },
                    { label: t("summaryEnergy"), value: ENERGY_LABELS[data.energyStandardCode] || data.energyStandardCode || "—" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between py-2 border-b border-gray-100 text-sm">
                      <span className="text-gray-600">{label}</span>
                      <span className="font-medium text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex flex-col gap-3 mt-8 pt-6 border-t border-gray-100">
              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {submitError}
                </div>
              )}
              <div className="flex justify-between">
                <button
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {t("back")}
                </button>

                {step < STEPS.length - 1 ? (
                  <button
                    onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                    disabled={step === 0 && !data.projectName}
                    className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {t("next")}
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !data.projectName || effectiveGrossAreaM2 <= 0}
                    className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting ? t("calculating") : t("calculate")}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live estimate panel */}
        <div className="w-72 shrink-0">
          <div className="bg-gray-900 text-white rounded-2xl p-6 sticky top-6">
            <div className="text-sm font-medium text-gray-300 mb-4">{t("liveEstimate")}</div>

            {effectiveGrossAreaM2 > 0 ? (
              <>
                <div className="mb-5">
                  <div className="text-3xl font-bold">
                    {new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(estimatedTotal)}
                  </div>
                  <div className="text-sm text-gray-400 mt-0.5">{t("totalTtc")}</div>
                </div>
                <div className="mb-5">
                  <div className="text-xl font-semibold text-blue-400">
                    {new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(estimatedCostPerM2)} / m²
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{t("htBeforeMargin")}</div>
                </div>
              </>
            ) : (
              <div className="text-gray-400 text-sm mb-5">
                {t("enterArea")}
              </div>
            )}

            {/* Completeness */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span>{t("dataCompleteness")}</span>
                <span>{completeness}%</span>
              </div>
              <div className="h-1.5 bg-gray-700 rounded-full">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    completeness >= 80 ? "bg-green-500" : completeness >= 50 ? "bg-blue-500" : "bg-orange-500"
                  }`}
                  style={{ width: `${completeness}%` }}
                />
              </div>
            </div>

            {/* Confidence badge */}
            <div className={`text-xs px-2.5 py-1.5 rounded-lg font-medium ${
              completeness >= 80 ? "bg-green-900 text-green-300" :
              completeness >= 50 ? "bg-blue-900 text-blue-300" : "bg-orange-900 text-orange-300"
            }`}>
              {t("confidence")} : {confidenceLabel}
            </div>

            {/* Regional note */}
            {data.regionCode && (
              <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-400">
                {t("regionalCoef")} :{" "}
                <span className="text-white font-medium">
                  ×{REGIONS.find(r => r.code === data.regionCode)?.coef.toFixed(2)}
                </span>
                {" "}({REGIONS.find(r => r.code === data.regionCode)?.name})
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
