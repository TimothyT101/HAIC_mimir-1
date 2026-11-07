import { getCountyAcs, getPlaceAcs } from "../data/acsIndicators";
import { getCountySvi } from "../data/sviIndicators";
import { getCounty } from "../data/counties";
import { sheltersForCounty } from "../data/shelters";
import { DISASTER_TYPES } from "./resourceCalculator";

export function buildPlanningSummary({ community, assessment }) {
  const county = getCounty(community.countyId);
  const acs = getCountyAcs(community.countyId);
  const disaster =
    DISASTER_TYPES.find((item) => item.id === assessment.disasterTypeId)?.label ??
    assessment.disasterTypeId;
  const designated = sheltersForCounty(community.countyId);
  const openConfirmed = designated.filter((item) => item.openConfirmed).length;

  const place = getPlaceAcs(community.id);
  const vulnerabilityBits = [];
  if (place) {
    vulnerabilityBits.push(
      `${place.censusName} ACS 2023 5-year estimates include population ${place.population}, ${place.olderAdultsPct}% age 65+, ${place.disabilityPct}% with a disability, and ${place.noVehiclePct}% of occupied housing units with no vehicle`
    );
  } else {
    vulnerabilityBits.push(
      `${community.name} has no matching Census place table in this prototype, so town-level ACS demand is not estimated`
    );
  }
  if (acs) {
    vulnerabilityBits.push(
      `County context: ${acs.name} is ${acs.olderAdultsPct}% age 65+ and ${acs.disabilityPct}% with a disability`
    );
  }
  const svi = getCountySvi(community.countyId);
  if (svi) {
    vulnerabilityBits.push(
      `CDC/ATSDR SVI 2022 overall percentile for ${svi.name} is ${Math.round(svi.overall * 100)} among U.S. counties (higher is more vulnerable)`
    );
  }

  const gapText =
    assessment.capacityVerified
      ? `Verified available capacity is ${assessment.availableCapacity}, leaving a shortfall of ${assessment.shelterShortfall}.`
      : `Shelter shortfall of ${assessment.shelterShortfall} is a scenario calculation only (demand ${assessment.estimatedShelterNeed} minus assumed sample capacity ${assessment.availableCapacity}). It is not a verified bed shortage.`;

  const shelterText = `${designated.length} publicly listed designated facilities are shown for ${county.name}; ${openConfirmed} are confirmed open in this prototype (none unless a live shelter feed is connected).`;

  return {
    mode: "deterministic",
    aiGenerated: false,
    text: [
      `Planning exercise scenario: ${disaster} mass-care planning for ${community.name}, ${community.island}, ${county.name} (not a live incident).`,
      vulnerabilityBits.join(". ") + ".",
      `Using documented rates, estimated shelter need is ${assessment.estimatedShelterNeed} people, transportation assistance ${assessment.transportAssist}, backup-power considerations ${assessment.electricityBackup}, water ${assessment.waterGallons} gallons, meals ${assessment.meals}, and language-access support contacts ${assessment.communicationSupport}.`,
      gapText,
      shelterText,
      "County emergency management leads ESF-6 decisions. State DHS/HIEMA, Red Cross/VOAD, transit, and health partners support after official alerts are confirmed.",
      "Decision points: confirm the official NWS/county product; verify which designated facilities are actually open; check transportation corridors; and use authorized AFN processes — never this website — for individual assistance.",
    ].join(" "),
  };
}
