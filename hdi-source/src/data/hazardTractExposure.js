/**
 * Precomputed census-tract ∩ hazard polygon exposure for ESF-6 planning.
 * Built from public tract GeoJSON + Hawaiʻi GIS hazard layers (see JSON meta).
 */
import exposure from "./hazardTractExposure.json";
import { SCENARIO_FACTORS } from "./planningFactors";

export const HAZARD_TRACT_EXPOSURE = exposure;

export const HAZARD_EXPOSURE_SOURCE = {
  name: "Hazard ∩ census-tract AFN exposure (precomputed)",
  method: exposure.meta.method,
  asOf: exposure.meta.asOf,
  tsunamiSource: exposure.meta.tsunamiSource,
  floodSource: exposure.meta.floodSource,
  wildfireSource: exposure.meta.wildfireSource,
  note:
    "Counts are planning proxies from tract polygons that intersect hazard polygons. They are not parcel-level risk or a list of people.",
};

/** Map Resource Planning disaster scenario → exposure key in the JSON. */
export function exposureKeyForScenario(disasterTypeId) {
  if (disasterTypeId === "coastal-flood") return "tsunami";
  if (disasterTypeId === "hurricane") return "hurricane";
  if (disasterTypeId === "tsunami") return "tsunami";
  if (disasterTypeId === "flood") return "flood";
  if (disasterTypeId === "wildfire") return "wildfire";
  return "hurricane";
}

export function getCountyHazardExposure(countyId, disasterTypeId) {
  const county = exposure.byCounty?.[countyId];
  if (!county) return null;
  const key = exposureKeyForScenario(disasterTypeId);
  const selected = county[key] ?? county.hurricane;
  return {
    countyId,
    hazardKey: key,
    hazardLabel: SCENARIO_FACTORS[key]?.label ?? key,
    allTracts: county.allTracts,
    selected,
    meta: exposure.meta,
  };
}

/**
 * Apply scenario shelter rate to exposed-tract population for a county-scale
 * demand cue (separate from the selected-community MODEL calculator).
 */
export function estimateExposedShelterNeed(countyId, disasterTypeId) {
  const row = getCountyHazardExposure(countyId, disasterTypeId);
  if (!row?.selected) return null;
  const rates = SCENARIO_FACTORS[exposureKeyForScenario(disasterTypeId)] ?? SCENARIO_FACTORS.hurricane;
  const pop = row.selected.population ?? 0;
  const shelterNeed = Math.round(pop * rates.shelterRate);
  return {
    ...row,
    shelterRate: rates.shelterRate,
    shelterRateSource: rates.shelterRateSource,
    estimatedShelterNeedFromExposedTracts: shelterNeed,
  };
}
