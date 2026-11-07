/**
 * County ACS 5-year Data Profile (2023), state 15.
 * Fetched 2026-11-07 with the Census Data API. Key is not stored in this file.
 *
 * These are aggregates. They do not identify people who need rescue.
 *
 * Variables:
 * - DP05_0001E  total population
 * - DP05_0024PE percent 65+
 * - DP02_0072PE percent with a disability (civilian noninstitutionalized)
 * - DP04_0058PE percent of occupied housing units with no vehicle
 * - DP02_0114PE percent language other than English at home (age 5+)
 * - DP02_0115PE percent who speak English less than "very well" (age 5+)
 * - DP03_0119PE poverty rate
 */

export const ACS_SOURCE = {
  name: "U.S. Census Bureau, ACS 5-year Data Profile 2023",
  retrievedAt: "2026-11-07",
  url: "https://api.census.gov/data/2023/acs/acs5/profile",
  notes: [
    "County geography only (place-level tables can be added with the same API).",
    "Disability is the ACS civilian noninstitutionalized population with a disability, all ages.",
    "No-vehicle is occupied housing units with no vehicle available (DP04_0058PE).",
    "Language other than English is DP02_0114PE; limited English is DP02_0115PE.",
    "No individual medical or functional-needs registry is stored.",
  ],
};

export const COUNTY_ACS = {
  honolulu: {
    countyId: "honolulu",
    name: "Honolulu County",
    population: 1003666,
    households: null,
    olderAdultsPct: 19.1,
    disabilityUnder65Pct: 12.2,
    disabilityPct: 12.2,
    languageOtherThanEnglishPct: 26.1,
    limitedEnglishPct: 11.8,
    povertyPct: 6.1,
    noVehiclePct: 9.8,
    geography: "County",
    vintage: "ACS 2023 5-year",
  },
  maui: {
    countyId: "maui",
    name: "Maui County",
    population: 164632,
    households: null,
    olderAdultsPct: 20.0,
    disabilityUnder65Pct: 10.8,
    disabilityPct: 10.8,
    languageOtherThanEnglishPct: 22.2,
    limitedEnglishPct: 9.4,
    povertyPct: 6.8,
    noVehiclePct: 4.8,
    geography: "County",
    vintage: "ACS 2023 5-year",
  },
  hawaii: {
    countyId: "hawaii",
    name: "Hawaiʻi County",
    population: 203684,
    households: null,
    olderAdultsPct: 23.2,
    disabilityUnder65Pct: 15.7,
    disabilityPct: 15.7,
    languageOtherThanEnglishPct: 25.3,
    limitedEnglishPct: 7.7,
    povertyPct: 10.8,
    noVehiclePct: 4.7,
    geography: "County",
    vintage: "ACS 2023 5-year",
  },
  kauai: {
    countyId: "kauai",
    name: "Kauaʻi County",
    population: 73610,
    households: null,
    olderAdultsPct: 21.8,
    disabilityUnder65Pct: 11.4,
    disabilityPct: 11.4,
    languageOtherThanEnglishPct: 18.0,
    limitedEnglishPct: 8.6,
    povertyPct: 6.5,
    noVehiclePct: 4.0,
    geography: "County",
    vintage: "ACS 2023 5-year",
  },
};

export function getCountyAcs(countyId) {
  return COUNTY_ACS[countyId] ?? null;
}
