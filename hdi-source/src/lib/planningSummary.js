import { getCountyAcs } from "../data/acsIndicators";
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

  const vulnerabilityBits = [];
  if (acs) {
    vulnerabilityBits.push(
      `${acs.name} ACS/QuickFacts indicators include ${acs.olderAdultsPct}% of residents age 65+ and ${acs.disabilityUnder65Pct}% of people under 65 with a disability`
    );
    vulnerabilityBits.push(
      `${acs.languageOtherThanEnglishPct}% of people age 5+ speak a language other than English at home`
    );
  }
  if (community.vulnerability?.noVehiclePct != null) {
    vulnerabilityBits.push(
      `the selected community file lists ${community.vulnerability.noVehiclePct}% of households without a vehicle as a demonstration planning proxy`
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
      `Planning scenario: ${disaster} affecting ${community.name}, ${community.island}, ${county.name}.`,
      vulnerabilityBits.join(". ") + ".",
      `Using documented rates, estimated shelter need is ${assessment.estimatedShelterNeed} people, transportation assistance ${assessment.transportAssist}, backup-power considerations ${assessment.electricityBackup}, water ${assessment.waterGallons} gallons, meals ${assessment.meals}, and language-access support contacts ${assessment.communicationSupport}.`,
      gapText,
      shelterText,
      "County emergency management leads ESF-6 decisions. State DHS/HIEMA, Red Cross/VOAD, transit, and health partners support after official alerts are confirmed.",
      "Decision points: confirm the official NWS/county product; verify which designated facilities are actually open; check transportation corridors; and use authorized AFN processes — never this website — for individual assistance.",
    ].join(" "),
  };
}
