/**
 * County-level public statistics used as CMIST / AFN proxy indicators.
 * These are aggregates. They do not identify people who need rescue.
 *
 * Retrieved 2026-11-06 from U.S. Census Bureau QuickFacts.
 * https://www.census.gov/quickfacts/fact/table/honolulucountyhawaii,mauicountyhawaii,hawaiicountyhawaii,kauaicountyhawaii
 *
 * Geographic granularity: county only.
 * Uncertainty: ACS 2020–2024 5-year estimates have sampling error.
 * Vehicle-access shares are not published in QuickFacts, so that field is null.
 */

export const ACS_SOURCE = {
  name: "U.S. Census Bureau QuickFacts",
  retrievedAt: "2026-11-06",
  url: "https://www.census.gov/quickfacts/fact/table/honolulucountyhawaii,mauicountyhawaii,hawaiicountyhawaii,kauaicountyhawaii",
  notes: [
    "Population is the Vintage 2025 estimate (July 1, 2025).",
    "Age, disability, language, households, and poverty are ACS 2020–2024 5-year estimates.",
    "Disability is published for persons under age 65 only.",
    "Language is “language other than English spoken at home,” not a full limited-English-proficiency measure.",
    "No individual medical or functional-needs registry is stored.",
  ],
};

export const COUNTY_ACS = {
  honolulu: {
    countyId: "honolulu",
    name: "Honolulu County",
    population: 988703,
    households: 338868,
    olderAdultsPct: 21.7,
    disabilityUnder65Pct: 7.4,
    languageOtherThanEnglishPct: 26.0,
    povertyPct: 8.8,
    noVehiclePct: null,
    geography: "County",
  },
  maui: {
    countyId: "maui",
    name: "Maui County",
    population: 160592,
    households: 55841,
    olderAdultsPct: 23.0,
    disabilityUnder65Pct: 6.5,
    languageOtherThanEnglishPct: 22.0,
    povertyPct: 9.9,
    noVehiclePct: null,
    geography: "County",
  },
  hawaii: {
    countyId: "hawaii",
    name: "Hawaiʻi County",
    population: 210043,
    households: 74072,
    olderAdultsPct: 26.0,
    disabilityUnder65Pct: 10.7,
    languageOtherThanEnglishPct: 22.6,
    povertyPct: 15.7,
    noVehiclePct: null,
    geography: "County",
  },
  kauai: {
    countyId: "kauai",
    name: "Kauaʻi County",
    population: 73400,
    households: 23632,
    olderAdultsPct: 24.6,
    disabilityUnder65Pct: 5.9,
    languageOtherThanEnglishPct: 18.3,
    povertyPct: 9.5,
    noVehiclePct: null,
    geography: "County",
  },
};

export function getCountyAcs(countyId) {
  return COUNTY_ACS[countyId] ?? null;
}
