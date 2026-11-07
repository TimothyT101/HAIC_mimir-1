import { getLevel } from "../data/classification";
import { getCounty } from "../data/counties";
import { matchPartners } from "../data/partners";
import { DISASTER_TYPES } from "./resourceCalculator";

export function buildPlanningReport({ community, assessment, generatedAt = new Date() }) {
  const level = getLevel(community.provisionalLevel);
  const county = getCounty(community.countyId);
  const disasterLabel =
    DISASTER_TYPES.find((item) => item.id === assessment.disasterTypeId)?.label ??
    community.disasterType;
  const partners = matchPartners({
    assessment,
    disasterTypeId: assessment.disasterTypeId,
  });

  return {
    title: `ESF-6 Planning Report — ${community.name}`,
    subtitle: "Hawaiʻi Disaster Intelligence prototype (HAIC 2026)",
    generatedAt: generatedAt.toISOString(),
    disclaimer:
      "This report is a deterministic planning template filled with calculator outputs and public county indicators. It is not AI-generated and is not an official emergency order, evacuation instruction, or resource request.",
    community: {
      name: community.name,
      county: county.name,
      island: community.island,
      provisionalLevel: `${level.fullLabel} (planning exercise — not an official warning)`,
      disasterType: disasterLabel,
    },
    needs: [
      { item: "Estimated residents needing shelter", value: assessment.estimatedShelterNeed },
      { item: "Available shelter capacity", value: assessment.availableCapacity },
      { item: "Potential shelter shortage", value: assessment.shelterShortfall },
      { item: "Transportation assistance estimates", value: assessment.transportAssist },
      { item: "Backup electricity considerations", value: assessment.electricityBackup },
      { item: "Language / communication support contacts", value: assessment.communicationSupport },
      { item: "Water (gallons, planning horizon)", value: assessment.waterGallons },
      { item: "Meals (planning horizon)", value: assessment.meals },
      {
        item: "Pet / working-animal support (planning estimate)",
        value: assessment.petSupport,
      },
    ],
    agencies: partners.map((partner) => ({
      name: partner.name,
      role: partner.role,
      cmist: partner.cmist.join(", "),
      matchedNeeds: partner.matchedNeeds.join("; ") || "County / State coordination support",
      decisionPoints: partner.decisionPoints,
    })),
    verificationSteps: [
      "Confirm the official NWS, PTWC, or county warning product before any public message.",
      "Verify shelter capacities with the county mass-care lead — prototype numbers are sample planning values.",
      "Check Access and Functional Needs lists through authorized agencies only; this site stores no personal records.",
      "Validate transportation routes against current road closures.",
    ],
    communicationPathways: [
      "County Emergency Operations Center → ESF-6 desk",
      "Official public alerts via HIEMA / county sirens / NOAA Weather Radio",
      "Partner conference bridge for VOAD, transit, and health",
      "Community messengers for limited-English-proficiency households",
    ],
    proposedActions: [
      "Review shelter shortfall and identify overflow or hotel/non-congregate options.",
      "Pre-assign transportation for the estimated no-vehicle share.",
      "Stage backup power support for the electricity-dependent planning estimate.",
      "Keep this prototype classification visually separate from official alerts.",
    ],
  };
}

export function reportToText(report) {
  const lines = [
    report.title,
    report.subtitle,
    `Generated: ${report.generatedAt}`,
    "",
    report.disclaimer,
    "",
    report.summary ? `Planning summary\n${report.summary}` : "",
    "",
    `Community: ${report.community.name}`,
    `County / island: ${report.community.county} / ${report.community.island}`,
    `Provisional classification: ${report.community.provisionalLevel}`,
    `Scenario disaster type: ${report.community.disasterType}`,
    "",
    "Identified resource needs",
    ...report.needs.map((need) => `- ${need.item}: ${need.value}`),
    "",
    "Matched partners and responsibilities",
    ...report.agencies.flatMap((agency) => [
      `- ${agency.name}: ${agency.role}`,
      agency.matchedNeeds ? `  Needs matched: ${agency.matchedNeeds}` : null,
      agency.cmist ? `  CMIST focus: ${agency.cmist}` : null,
      ...(agency.decisionPoints || []).map((step) => `  Decision: ${step}`),
    ].filter(Boolean)),
    "",
    "Required verification steps",
    ...report.verificationSteps.map((step) => `- ${step}`),
    "",
    "Communication pathways",
    ...report.communicationPathways.map((item) => `- ${item}`),
    "",
    "Proposed emergency planning actions",
    ...report.proposedActions.map((item) => `- ${item}`),
  ];
  return lines.join("\n");
}

export function downloadReport(report) {
  const blob = new Blob([reportToText(report)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${report.community.name.replace(/\s+/g, "-").toLowerCase()}-esf6-planning-report.txt`;
  link.click();
  URL.revokeObjectURL(url);
}
