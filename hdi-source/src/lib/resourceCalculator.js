/**
 * Transparent ESF-6 resource estimation.
 * Formulas prefer Hawaiʻi / federal public sources documented in planningFactors.js.
 * Resource Shortfall = max(0, Estimated Demand − Available Capacity)
 */
import { getCountyAcs, getPlaceAcs } from "../data/acsIndicators";
import {
  AVG_PETS_PER_PET_HOUSEHOLD,
  DAYS_SOURCE,
  EMPOWER_SOURCE,
  FEMA_EVAC_SHELTER_URL,
  getEmpowerCountyTotal,
  getPetFactors,
  HIEMA_SHELTER_GUIDANCE_URL,
  MEAL_SOURCE,
  PERSONS_PER_HOUSEHOLD,
  PET_SOURCE,
  PUBLIC_SOURCE_LINKS,
  READY_KIT_URL,
  READY_WATER_URL,
  RED_CROSS_SHELTER_URL,
  SCENARIO_FACTORS,
  VISITOR_SHARE,
  VISITOR_SOURCE,
  WATER_SOURCE,
} from "../data/planningFactors";

export const DISASTER_TYPES = Object.values(SCENARIO_FACTORS).map((item) => ({
  id: item.id,
  label: item.label,
}));

/** @deprecated Prefer SCENARIO_FACTORS — kept as alias for older imports. */
export const PLANNING_RATES = SCENARIO_FACTORS;

export function shortfall(demand, capacity) {
  return Math.max(0, demand - capacity);
}

export function calculateResources({ community, disasterTypeId }) {
  const mappedId = disasterTypeId === "coastal-flood" ? "tsunami" : disasterTypeId;
  const rates = SCENARIO_FACTORS[mappedId] ?? SCENARIO_FACTORS.flood;
  const place = getPlaceAcs(community.id);
  const countyAcs = getCountyAcs(community.countyId);
  const hasPlace = place?.population != null;
  const population = hasPlace ? place.population : 0;
  const countyPopulation = countyAcs?.population ?? 0;
  const noVehiclePct = hasPlace ? (place.noVehiclePct ?? 0) / 100 : 0;
  const lepPct = hasPlace ? (place.limitedEnglishPct ?? 0) / 100 : 0;

  const residentShare = 1 - VISITOR_SHARE;
  const residentShelterNeed = Math.round(population * residentShare * rates.shelterRate);
  const visitorShelterNeed = Math.round(population * VISITOR_SHARE * rates.shelterRate);
  const estimatedShelterNeed = residentShelterNeed + visitorShelterNeed;

  const availableCapacity = community.shelterCapacity ?? 0;
  const capacityVerified = false;
  const shelterShortfall = shortfall(estimatedShelterNeed, availableCapacity);

  // Residents without a vehicle (ACS) + visitors assumed to need transport assistance (HIEMA).
  const transportAssist =
    Math.round(residentShelterNeed * noVehiclePct) + visitorShelterNeed;

  const countyEmpower = getEmpowerCountyTotal(community.countyId);
  const placeEmpowerShare =
    countyPopulation > 0 && hasPlace
      ? Math.round(countyEmpower * (population / countyPopulation))
      : 0;
  const electricityBackup = Math.round(placeEmpowerShare * rates.outageIntensity);

  const communicationSupport = Math.round(estimatedShelterNeed * lepPct);

  const waterGallons =
    estimatedShelterNeed * rates.waterGallonsPerPersonDay * rates.days;
  const meals = estimatedShelterNeed * rates.mealPerPersonDay * rates.days;

  const petFactors = getPetFactors(community.countyId);
  const households = hasPlace ? population / PERSONS_PER_HOUSEHOLD : 0;
  const petHouseholds = households * petFactors.anyIndoorCA;
  const petSupport = Math.round(
    petHouseholds * rates.shelterRate * AVG_PETS_PER_PET_HOUSEHOLD
  );

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
      visitorShare: VISITOR_SHARE,
      residentShelterNeed,
      visitorShelterNeed,
      countyEmpower,
      placeEmpowerShare,
      outageIntensity: rates.outageIntensity,
      petHouseholdRate: petFactors.anyIndoorCA,
      dogHouseholdRate: petFactors.dogHH,
      catHouseholdRate: petFactors.catHH,
      personsPerHousehold: PERSONS_PER_HOUSEHOLD,
      avgPetsPerPetHousehold: AVG_PETS_PER_PET_HOUSEHOLD,
    },
    estimatedShelterNeed,
    availableCapacity,
    shelterShortfall,
    transportAssist,
    electricityBackup,
    communicationSupport,
    waterGallons,
    meals,
    petSupport,
    sources: {
      shelterRate: `${rates.shelterRateSource} — ${
        mappedId === "hurricane" ? HIEMA_SHELTER_GUIDANCE_URL : FEMA_EVAC_SHELTER_URL
      }`,
      visitors: `${VISITOR_SOURCE} — ${HIEMA_SHELTER_GUIDANCE_URL}`,
      transport: `ACS DP04_0058PE (no-vehicle occupied units) + HIEMA visitor share — ${HIEMA_SHELTER_GUIDANCE_URL}`,
      electricity: `${EMPOWER_SOURCE.name} (${EMPOWER_SOURCE.asOf}); allocated to place by ACS population share × scenario outage intensity — ${EMPOWER_SOURCE.url}`,
      communication: "ACS DP02_0115PE limited-English share × estimated shelter need — https://api.census.gov/data/2023/acs/acs5/profile",
      water: `${WATER_SOURCE} — ${READY_WATER_URL}`,
      meals: `${MEAL_SOURCE} — ${RED_CROSS_SHELTER_URL}`,
      days: `${DAYS_SOURCE[mappedId] ?? DAYS_SOURCE.default} — ${READY_KIT_URL}`,
      pets: `${PET_SOURCE.name}; households ≈ ACS pop ÷ ${PERSONS_PER_HOUSEHOLD}; × ${petFactors.anyIndoorCA} indoor companion-animal HH rate × shelter rate × ${AVG_PETS_PER_PET_HOUSEHOLD} animals/pet HH — ${PET_SOURCE.url}`,
      capacity: "Sample community capacity in prototype data — not a verified open-bed inventory",
    },
    sourceLinks: PUBLIC_SOURCE_LINKS,
    formulas: {
      estimatedShelterNeed:
        "round(pop × (1 − 0.15) × shelterRate) + round(pop × 0.15 × shelterRate) — HIEMA visitor share 15%",
      shelterShortfall:
        "max(0, estimatedShelterNeed − sampleCapacity) — sample capacity is not verified open beds",
      transportAssist:
        "round(residentShelterNeed × ACS no-vehicle share) + visitorShelterNeed",
      electricityBackup:
        "round(county emPOWER × placePop/countyPop × scenario outageIntensity)",
      communicationSupport: "round(estimatedShelterNeed × ACS limited-English share)",
      waterGallons: "estimatedShelterNeed × 1 gallon × days",
      meals: "estimatedShelterNeed × 3 meals × days",
      petSupport:
        "round((pop ÷ 2.92) × 0.39 indoor pet-HH rate × shelterRate × 1.7 animals) — Hawaiʻi Health Survey; not a registry",
    },
    dataLabel: hasPlace
      ? `ACS place ${place.censusName} (${place.vintage}). Shelter rate ${Math.round(
          rates.shelterRate * 100
        )}% (${rates.shelterRateSource.split(";")[0]}). emPOWER place share ${placeEmpowerShare} of ${countyEmpower} county Medicare electricity-dependent beneficiaries.`
      : `No ACS place table for ${community.name}; demand is not estimated from sample community numbers.`,
  };
}
