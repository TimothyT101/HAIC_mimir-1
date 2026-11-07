/**
 * ACS 5-year Data Profile 2023 (state 15).
 * Values come from src/data/acs2023.json, refreshed by scripts/fetch-acs.mjs.
 * The Census API key never ships in this file or the frontend.
 *
 * These are aggregates. They do not identify people who need rescue.
 */

import acs2023 from "./acs2023.json";

export const ACS_SOURCE = {
  name: `U.S. Census Bureau, ${acs2023.vintage}`,
  retrievedAt: acs2023.retrievedAt,
  url: acs2023.url,
  notes: [
    "County tables plus Census place/CDP tables matched to prototype communities.",
    "Mililani uses Mililani Town CDP (Mililani Mauka is a separate Census place and is not summed).",
    "Niʻihau / Puʻuwai has no published ACS place table — shown as Unknown.",
    "Disability is the ACS civilian noninstitutionalized population with a disability, all ages (DP02_0072PE).",
    "No-vehicle is occupied housing units with no vehicle available (DP04_0058PE).",
    "Language other than English is DP02_0114PE; limited English is DP02_0115PE.",
    "No individual medical or functional-needs registry is stored.",
  ],
};

export const COUNTY_ACS = acs2023.counties;
export const PLACE_ACS = acs2023.places;

export function getCountyAcs(countyId) {
  return COUNTY_ACS[countyId] ?? null;
}

export function getPlaceAcs(communityId) {
  return PLACE_ACS[communityId] ?? null;
}
