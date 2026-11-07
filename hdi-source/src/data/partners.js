/**
 * ESF-6 partner match catalog for HAIC prototype planning.
 * Roles are planning guidance only — Counties lead mass care; State ESF-6 supports.
 * No PII. No individual AFN registries.
 */

export const PARTNERS = [
  {
    id: "county-em",
    name: "County emergency management / civil defense",
    lead: true,
    cmist: ["communication", "medical", "independence", "safety", "transportation"],
    hazards: ["hurricane", "wildfire", "tsunami", "flood"],
    role: "Lead ESF-6 decisions: which shelters open, who is notified, and when to shelter in place.",
    decisionPoints: [
      "Confirm the official NWS / county product before public messaging",
      "Authorize shelter openings and overflow sites",
      "Set priority outreach geographies for AFN support",
    ],
    gapTriggers: ["shelterShortfall", "transportAssist", "electricityBackup", "communicationSupport"],
  },
  {
    id: "hiema-dhs",
    name: "HIEMA and State DHS (ESF-6)",
    lead: false,
    cmist: ["communication", "medical", "independence", "safety", "transportation"],
    hazards: ["hurricane", "wildfire", "tsunami", "flood"],
    role: "State coordination and mass-care support to County-led operations; functional-needs planning assistance.",
    decisionPoints: [
      "Stand up State ESF-6 desk to support County requests",
      "Align DHS program partners without sharing client-level data",
      "Escalate resource gaps the County cannot cover locally",
    ],
    gapTriggers: ["shelterShortfall", "electricityBackup", "communicationSupport"],
  },
  {
    id: "red-cross-voad",
    name: "American Red Cross and VOAD",
    lead: false,
    cmist: ["communication", "independence", "safety"],
    hazards: ["hurricane", "wildfire", "tsunami", "flood"],
    role: "Shelter operations, feeding, family reunification, and volunteer coordination.",
    decisionPoints: [
      "Confirm which designated facilities can actually open",
      "Staff accessible shelter spaces and feeding lines",
      "Coordinate donations and volunteers through VOAD, not ad-hoc drop-offs",
    ],
    gapTriggers: ["shelterShortfall", "meals", "waterGallons"],
  },
  {
    id: "transit",
    name: "Transit agency and paratransit providers",
    lead: false,
    cmist: ["transportation", "independence"],
    hazards: ["hurricane", "wildfire", "tsunami", "flood"],
    role: "Transportation assistance for households without vehicles and riders who need accessible vehicles.",
    decisionPoints: [
      "Pre-stage accessible buses/paratransit before road closures",
      "Confirm pickup points outside mapped hazard zones",
      "Coordinate with County EM on corridor closures",
    ],
    gapTriggers: ["transportAssist"],
  },
  {
    id: "health-utilities",
    name: "Health care coalitions and utilities",
    lead: false,
    cmist: ["medical", "independence"],
    hazards: ["hurricane", "wildfire", "tsunami", "flood"],
    role: "Electricity-dependent medical needs, backup power staging, dialysis/home-care continuity.",
    decisionPoints: [
      "Use de-identified emPOWER-style county counts only — never a patient list here",
      "Prioritize backup power for medical shelters and high-rise elevators where directed",
      "Coordinate medical needs sheltering with DOH / health coalitions",
    ],
    gapTriggers: ["electricityBackup"],
  },
  {
    id: "language-community",
    name: "Community messengers, libraries, and language-access partners",
    lead: false,
    cmist: ["communication", "safety"],
    hazards: ["hurricane", "wildfire", "tsunami", "flood"],
    role: "Trauma-informed, multilingual outreach through trusted local voices (including immigrant communities).",
    decisionPoints: [
      "Translate life-safety messages before impact, not after",
      "Use trusted messengers so residents know seeking shelter is safe",
      "Provide ASL / large-print / e-reader accessible formats where available",
    ],
    gapTriggers: ["communicationSupport"],
  },
  {
    id: "animal-care",
    name: "Animal care / pet-friendly shelter partners",
    lead: false,
    cmist: ["safety", "independence"],
    hazards: ["hurricane", "wildfire", "tsunami", "flood"],
    role: "Pet and working-animal sheltering or co-located support so households are not forced to leave animals behind.",
    decisionPoints: [
      "Identify which open shelters accept pets or working animals",
      "Stage crates, food, and separation protocols with Red Cross/VOAD",
    ],
    gapTriggers: ["shelterShortfall", "meals", "petSupport"],
  },
];

/**
 * Match partners to a scenario using CMIST gaps from the resource calculator.
 * Always includes the County lead; others appear when their gap trigger is > 0
 * or when the hazard always needs State ESF-6 support.
 */
export function matchPartners({ assessment, disasterTypeId }) {
  if (!assessment) return [];

  const activeGaps = new Set();
  if ((assessment.shelterShortfall ?? 0) > 0) activeGaps.add("shelterShortfall");
  if ((assessment.transportAssist ?? 0) > 0) activeGaps.add("transportAssist");
  if ((assessment.electricityBackup ?? 0) > 0) activeGaps.add("electricityBackup");
  if ((assessment.communicationSupport ?? 0) > 0) activeGaps.add("communicationSupport");
  if ((assessment.meals ?? 0) > 0) activeGaps.add("meals");
  if ((assessment.waterGallons ?? 0) > 0) activeGaps.add("waterGallons");
  if ((assessment.petSupport ?? 0) > 0) activeGaps.add("petSupport");

  const hazard = disasterTypeId || assessment.disasterTypeId;

  return PARTNERS.filter((partner) => {
    if (!partner.hazards.includes(hazard)) return false;
    if (partner.lead) return true;
    if (partner.id === "hiema-dhs") return true;
    return partner.gapTriggers.some((trigger) => activeGaps.has(trigger));
  }).map((partner) => {
    const matchedTriggers = partner.gapTriggers.filter((trigger) => activeGaps.has(trigger));
    const matchedNeeds = matchedTriggers.map((trigger) => gapLabel(trigger, assessment));
    return {
      ...partner,
      matchedTriggers,
      matchedNeeds,
      priority: partner.lead ? 0 : matchedTriggers.length ? 1 : 2,
    };
  }).sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name));
}

function gapLabel(trigger, assessment) {
  switch (trigger) {
    case "shelterShortfall":
      return `Shelter gap ~${assessment.shelterShortfall}`;
    case "transportAssist":
      return `Transport assist ~${assessment.transportAssist}`;
    case "electricityBackup":
      return `Backup power considerations ~${assessment.electricityBackup}`;
    case "communicationSupport":
      return `Language / communication support ~${assessment.communicationSupport}`;
    case "meals":
      return `Meals planning horizon ~${assessment.meals}`;
    case "waterGallons":
      return `Water gallons ~${assessment.waterGallons}`;
    case "petSupport":
      return `Pet / working-animal support ~${assessment.petSupport}`;
    default:
      return trigger;
  }
}
