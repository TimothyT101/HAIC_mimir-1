/**
 * Transparent ESF-6 resource estimation.
 * All rates are documented planning assumptions for the HAIC prototype.
 * Resource Shortfall = max(0, Estimated Demand − Available Capacity)
 */
import { getPlaceAcs } from "../data/acsIndicators";

export const DISASTER_TYPES = [
  { id: "hurricane", label: "Hurricane" },
  { id: "wildfire", label: "Wildfire" },
  { id: "tsunami", label: "Tsunami" },
  { id: "flood", label: "Flood" },
];

export const PLANNING_RATES = {
  hurricane: {
    shelterRate: 0.2,
    transportAssistRate: 0.22,
    electricityBackupRate: 0.06,
    waterGallonsPerPersonDay: 1,
    mealPerPersonDay: 3,
    days: 5,
    communicationSupportRate: 0.2,
    exposure:
      "Island-scale wind, rain, and coastal inundation. Assumes a larger share of households may lose power and need multi-day mass care.",
    notes: "Assumes 20% shelter demand for a county-scale wind and flood event.",
  },
  wildfire: {
    shelterRate: 0.08,
    transportAssistRate: 0.12,
    electricityBackupRate: 0.03,
    waterGallonsPerPersonDay: 1,
    mealPerPersonDay: 2,
    days: 2,
    communicationSupportRate: 0.12,
    exposure:
      "Localized wildland-urban interface and smoke. Inland and leeward communities can be affected without coastal inundation.",
    notes: "Assumes 8% short-term displacement from smoke or immediate threat areas.",
  },
  tsunami: {
    shelterRate: 0.15,
    transportAssistRate: 0.2,
    electricityBackupRate: 0.03,
    waterGallonsPerPersonDay: 1,
    mealPerPersonDay: 2,
    days: 2,
    communicationSupportRate: 0.18,
    exposure:
      "Coastal evacuation zones and harbors. Inland neighborhoods are not treated as inundated solely because they are nearby.",
    notes: "Assumes 15% of the selected community may need movement out of mapped tsunami evacuation zones.",
  },
  flood: {
    shelterRate: 0.07,
    transportAssistRate: 0.14,
    electricityBackupRate: 0.025,
    waterGallonsPerPersonDay: 1,
    mealPerPersonDay: 2,
    days: 2,
    communicationSupportRate: 0.1,
    exposure:
      "Stream, drainage, and low-lying floodplain exposure. Demand is lower than a hurricane and more localized than a tsunami watch.",
    notes: "Assumes 7% of residents in stream-adjacent housing may need short-term shelter.",
  },
};

export function shortfall(demand, capacity) {
  return Math.max(0, demand - capacity);
}

export function calculateResources({ community, disasterTypeId }) {
  const mappedId = disasterTypeId === "coastal-flood" ? "tsunami" : disasterTypeId;
  const rates = PLANNING_RATES[mappedId] ?? PLANNING_RATES.flood;
  const place = getPlaceAcs(community.id);
  const hasPlace = place?.population != null;
  const population = hasPlace ? place.population : 0;
  const noVehiclePct = hasPlace ? (place.noVehiclePct ?? 0) / 100 : 0;
  const lepPct = hasPlace ? (place.limitedEnglishPct ?? 0) / 100 : 0;
  const estimatedShelterNeed = Math.round(population * rates.shelterRate);
  const availableCapacity = community.shelterCapacity ?? 0;
  const capacityVerified = false;
  const shelterShortfall = shortfall(estimatedShelterNeed, availableCapacity);
  const transportAssist = Math.round(
    estimatedShelterNeed * Math.max(rates.transportAssistRate, noVehiclePct)
  );
  const electricityBackup = Math.round(population * rates.electricityBackupRate);
  const communicationSupport = Math.round(
    estimatedShelterNeed * Math.max(rates.communicationSupportRate, lepPct)
  );
  const waterGallons = estimatedShelterNeed * rates.waterGallonsPerPersonDay * rates.days;
  const meals = estimatedShelterNeed * rates.mealPerPersonDay * rates.days;

  return {
    community,
    disasterTypeId: mappedId,
    rates,
    capacityVerified,
    inputs: {
      population,
      populationSource: hasPlace ? place.censusName : null,
      shelterRate: rates.shelterRate,
      availableCapacity,
      noVehiclePct,
      lepPct,
      days: rates.days,
      hasPlaceAcs: hasPlace,
    },
    estimatedShelterNeed,
    availableCapacity,
    shelterShortfall,
    transportAssist,
    electricityBackup,
    communicationSupport,
    waterGallons,
    meals,
    formulas: {
      estimatedShelterNeed: "round(ACS place population × scenario shelterRate)",
      shelterShortfall: "max(0, estimatedShelterNeed − sampleCapacity) — sample capacity is not verified open beds",
      transportAssist: "round(estimatedShelterNeed × max(transportAssistRate, ACS no-vehicle share))",
      electricityBackup: "round(ACS place population × scenario backup-power rate)",
      communicationSupport: "round(estimatedShelterNeed × max(communicationSupportRate, ACS limited-English share))",
      waterGallons: "estimatedShelterNeed × 1 gallon × days",
      meals: "estimatedShelterNeed × mealsPerPersonDay × days",
    },
    dataLabel: hasPlace
      ? `Population, no-vehicle, and limited-English shares from ${place.censusName} (${place.vintage}). Shelter capacity remains a sample planning figure.`
      : `No ACS place table for ${community.name}; demand is not estimated from sample community numbers.`,
  };
}
