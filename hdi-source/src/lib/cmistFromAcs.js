/** CMIST planning language from ACS place aggregates + county emPOWER share. No individual AFN data. */

import { getCountyAcs } from "../data/acsIndicators";
import { EMPOWER_SOURCE, getEmpowerCountyTotal } from "../data/planningFactors";

function pct(value) {
  return value == null ? "Unknown" : `${value}%`;
}

export function cmistFromAcs(place, communityName = "This community", countyId = null) {
  if (!place) {
    return {
      communication: `${communityName} has no matching Census place table. Do not invent language-access counts.`,
      medical: `${communityName} has no ACS disability table in this extract. Do not invent medical-device lists.`,
      independence: `${communityName} has no ACS age table here. Keep independence support Unknown until a public geography matches.`,
      safety: `No ACS poverty table for ${communityName}. Coordinate AFN support through official county processes, not this site.`,
      transportation: `No ACS no-vehicle table for ${communityName}. Transport estimates are not run from sample community percentages.`,
    };
  }

  const name = place.placeName || communityName;
  const vintage = place.vintage || "ACS 2023 5-year";
  const countyAcs = countyId ? getCountyAcs(countyId) : null;
  const countyEmpower = countyId ? getEmpowerCountyTotal(countyId) : 0;
  const placeEmpower =
    countyAcs?.population && place.population
      ? Math.round(countyEmpower * (place.population / countyAcs.population))
      : null;

  const medicalEmpower =
    placeEmpower == null
      ? `HHS emPOWER county allocation is unavailable for ${name}.`
      : `About ${placeEmpower} Medicare beneficiaries with electricity-dependent DME are allocated to ${name} by population share of the county total ${countyEmpower} (${EMPOWER_SOURCE.name}, ${EMPOWER_SOURCE.asOf}). This is not a patient list and undercounts non-Medicare users.`;

  return {
    communication: `${name}: ${pct(place.limitedEnglishPct)} of people age 5+ speak English less than very well (${vintage}, DP02_0115PE). ${pct(place.languageOtherThanEnglishPct)} speak a language other than English at home. Use accessible, multilingual notices. This is a place aggregate, not a resident list.`,
    medical: `${name}: ${pct(place.disabilityPct)} of the civilian noninstitutionalized population has a disability (${vintage}, DP02_0072PE). ${medicalEmpower}`,
    independence: `${name}: ${pct(place.olderAdultsPct)} of residents are age 65+ (${vintage}, DP05_0024PE). ACS does not measure ADLs or assistive-device use. Treat this as a scale cue for accessible shelter and check-ins.`,
    safety: `${name}: ${pct(place.povertyPct)} of people with poverty status determined are below poverty (${vintage}, DP03_0119PE). Do not target households. Caregiver and behavioral-health needs are not in ACS — use official AFN processes.`,
    transportation: `${name}: ${pct(place.noVehiclePct)} of occupied housing units have no vehicle available (${vintage}, DP04_0058PE). Scenario transport estimates use this share plus HIEMA visitor assumptions, not named riders.`,
  };
}
