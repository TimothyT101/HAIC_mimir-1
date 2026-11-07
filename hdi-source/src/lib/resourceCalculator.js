/**
 * Transparent ESF-6 resource estimation.
 * All rates are documented planning assumptions for the HAIC prototype.
 * Resource Shortfall = max(0, Estimated Demand − Available Capacity)
 */

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
  const population = community.population ?? 0;
  const noVehiclePct = (community.vulnerability?.noVehiclePct ?? 0) / 100;
  const lepPct = (community.vulnerability?.lepPct ?? 0) / 100;
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
      shelterRate: rates.shelterRate,
      availableCapacity,
      noVehiclePct,
      lepPct,
      days: rates.days,
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
      estimatedShelterNeed: "round(community population × scenario shelterRate)",
      shelterShortfall: "max(0, estimatedShelterNeed − sampleCapacity) — sample capacity is not verified open beds",
      transportAssist: "round(estimatedShelterNeed × max(transportAssistRate, community no-vehicle share))",
      electricityBackup: "round(population × scenario backup-power rate)",
      communicationSupport: "round(estimatedShelterNeed × max(communicationSupportRate, LEP share))",
      waterGallons: "estimatedShelterNeed × 1 gallon × days",
      meals: "estimatedShelterNeed × mealsPerPersonDay × days",
    },
    dataLabel: "Scenario calculation — not an operational resource request",
  };
}
