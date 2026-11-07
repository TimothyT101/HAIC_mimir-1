import { SCENARIO_FACTORS } from "../data/planningFactors";
import { calculateResources, DISASTER_TYPES } from "./resourceCalculator";

/**
 * Build a judge-facing “what changed” comparison for the selected community
 * across disaster scenarios. ACS vulnerability cards stay the same; MODEL rates move.
 */
export function buildScenarioCompare({ community, disasterTypeId }) {
  if (!community) return null;

  const currentId =
    disasterTypeId === "coastal-flood" ? "tsunami" : disasterTypeId;
  const current = calculateResources({ community, disasterTypeId: currentId });
  const baseline = calculateResources({
    community,
    disasterTypeId: "hurricane",
  });

  const rows = DISASTER_TYPES.map((item) => {
    const assessment = calculateResources({
      community,
      disasterTypeId: item.id,
    });
    return {
      id: item.id,
      label: item.label,
      isCurrent: item.id === currentId,
      shelterRatePct: Math.round(assessment.inputs.shelterRate * 100),
      days: assessment.inputs.days,
      outageIntensity: assessment.inputs.outageIntensity,
      estimatedShelterNeed: assessment.estimatedShelterNeed,
      shelterShortfall: assessment.shelterShortfall,
      transportAssist: assessment.transportAssist,
      electricityBackup: assessment.electricityBackup,
      waterGallons: assessment.waterGallons,
      meals: assessment.meals,
      petSupport: assessment.petSupport,
      communicationSupport: assessment.communicationSupport,
      notes: assessment.rates.notes,
      exposure: assessment.rates.exposure,
    };
  });

  const delta = (field) => current[field] - baseline[field];

  const bullets = [
    {
      label: "Shelter planning rate",
      detail: `${Math.round(current.inputs.shelterRate * 100)}% now vs ${Math.round(
        baseline.inputs.shelterRate * 100
      )}% for hurricane (${current.rates.shelterRateSource.split(";")[0]})`,
    },
    {
      label: "Planning horizon",
      detail: `${current.inputs.days} days now vs ${baseline.inputs.days} days for hurricane`,
    },
    {
      label: "Estimated shelter need",
      detail: `${fmt(current.estimatedShelterNeed)} people (${signed(
        delta("estimatedShelterNeed")
      )} vs hurricane on the same community)`,
    },
    {
      label: "Water / meals / pets",
      detail: `${fmt(current.waterGallons)} gal water, ${fmt(
        current.meals
      )} meals, ${fmt(current.petSupport)} pet-support estimate — scale with shelter need × days`,
    },
    {
      label: "Backup-power intensity",
      detail: `${current.inputs.outageIntensity} × place emPOWER share now vs ${baseline.inputs.outageIntensity} for hurricane`,
    },
  ];

  if (currentId === "tsunami") {
    bullets.push({
      label: "Coastal note",
      detail:
        "Tsunami uses a FEMA mid-range rate as a community proxy; county hazard∩tract panel below shows tracts that intersect tsunami evacuation zones.",
    });
  }
  if (currentId === "flood" || currentId === "wildfire") {
    bullets.push({
      label: "Localized hazard",
      detail:
        "Wildfire/flood rates are FEMA rule-of-thumb proxies on the selected community. Use the hazard∩tract panel for county tracts intersecting SFHA or fire-risk polygons.",
    });
  }

  return {
    communityName: community.name,
    currentId,
    currentLabel: SCENARIO_FACTORS[currentId]?.label ?? currentId,
    baselineLabel: "Hurricane",
    bullets,
    rows,
    unchangedNote:
      "County/community ACS vulnerability cards and CMIST text do not change when you switch scenarios — only MODEL rates and estimated needs do.",
  };
}

function fmt(n) {
  return Number(n).toLocaleString("en-US");
}

function signed(n) {
  if (n === 0) return "no change";
  const abs = Math.abs(n).toLocaleString("en-US");
  return n > 0 ? `+${abs}` : `−${abs}`;
}
