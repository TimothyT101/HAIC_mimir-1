/**
 * Multilingual + trauma-informed communication pathways for ESF-6 planning.
 * English templates only — partners / certified interpreters should localize.
 * No PII. Not official public alerts.
 */

export const COMMUNICATION_PATHWAYS_SOURCE = {
  name: "HAIC ESF-6 communication pathways (planning templates)",
  note:
    "Sample English messages for County / partner use. Official alerts still come from NWS, HIEMA, and county emergency management. Translate with trusted community messengers and language-access partners — this prototype does not machine-translate.",
  challengeNote:
    "Addresses the HAIC objective for clear, multilingual, trauma-informed (humanistic) communication before, during, and after disasters.",
};

/** Priority languages commonly needed in Hawaiʻi mass-care outreach (planning reference). */
export const PRIORITY_LANGUAGES = [
  { id: "en", label: "English", role: "Default operations language" },
  { id: "haw", label: "ʻŌlelo Hawaiʻi", role: "Cultural respect; community radio / messengers" },
  { id: "ilo", label: "Ilokano", role: "High LEP communities (esp. Oʻahu / Maui)" },
  { id: "tgl", label: "Tagalog", role: "High LEP communities statewide" },
  { id: "chk", label: "Chuukese", role: "Micronesian communities; trusted church / neighbor networks" },
  { id: "mh", label: "Marshallese", role: "Micronesian communities; plain-language radio" },
  { id: "sm", label: "Samoan", role: "Pacific Islander communities" },
  { id: "zh", label: "Chinese (Mandarin / Cantonese)", role: "Urban and visitor corridors" },
  { id: "ko", label: "Korean", role: "Urban and visitor corridors" },
  { id: "vi", label: "Vietnamese", role: "Urban LEP households" },
  { id: "ja", label: "Japanese", role: "Residents and visitors" },
  { id: "es", label: "Spanish", role: "Residents and visitors" },
  { id: "asl", label: "American Sign Language (ASL)", role: "Deaf / hard-of-hearing — video or in-person, not text-only" },
];

/** Copy-ready briefing for County / VOAD language-access partners (no PII). */
export function buildLanguageAccessBriefing(priorityLanguageIds) {
  const pool =
    Array.isArray(priorityLanguageIds) && priorityLanguageIds.length
      ? PRIORITY_LANGUAGES.filter((lang) => priorityLanguageIds.includes(lang.id))
      : PRIORITY_LANGUAGES;
  const lines = pool
    .filter((lang) => lang.id !== "en")
    .map((lang) => `- [ ] ${lang.label} — ${lang.role}`);
  return [
    "Language-access briefing (ESF-6 planning)",
    "Audience: County EM / language partners / libraries / VOAD",
    "",
    "Please confirm interpreters or plain-language lines BEFORE impact for:",
    ...lines,
    "",
    "Also confirm: ASL video or in-person options; large-print / phone-tree alternatives for low-connectivity households.",
    "Use trusted community messengers. Official life-safety alerts remain NWS / HIEMA / county products.",
    "This prototype does not machine-translate and does not store personal language preferences.",
  ].join("\n");
}

export const TRAUMA_PRINCIPLES = [
  {
    id: "safety",
    title: "Lead with safety, not fear",
    body: "Say what to do and where help is. Avoid panic language, blame, or “active incident” wording when you are still in planning or readiness mode.",
  },
  {
    id: "trust",
    title: "Use trusted messengers",
    body: "Churches, homestead associations, clinics, libraries, hotels, and community health workers often reach households that do not follow official social media.",
  },
  {
    id: "immigrant",
    title: "Seeking shelter is safe",
    body: "Immigrant and mixed-status households may fear enforcement at shelters. County / partner messages should clearly state that seeking emergency shelter is about safety — not immigration enforcement (align with local counsel and county policy).",
  },
  {
    id: "dignity",
    title: "Respect dignity and choice",
    body: "Offer shelter-in-place when appropriate, explain what to bring (meds, devices, pets/crates), and never require personal medical details on a public website.",
  },
  {
    id: "access",
    title: "Multiple formats",
    body: "Pair sirens and radio with plain-language text, large print, ASL video where available, and phone trees for households with limited broadband.",
  },
  {
    id: "timing",
    title: "Translate before impact",
    body: "Pre-translate life-safety lines for priority languages. Do not wait until roads close to start language access.",
  },
];

export const CHANNELS = [
  {
    id: "official",
    title: "Official life-safety channels",
    items: [
      "NWS / PTWC products and county emergency management announcements",
      "Outdoor warning sirens + NOAA Weather Radio",
      "HNL Alert / county Everbridge / similar opt-in systems",
    ],
  },
  {
    id: "mass-care",
    title: "ESF-6 mass-care channels",
    items: [
      "County EOC → State ESF-6 desk (HIEMA / DHS)",
      "Red Cross / VOAD shelter operations briefings",
      "Transit / paratransit pickup announcements",
    ],
  },
  {
    id: "community",
    title: "Community & language-access channels",
    items: [
      "Libraries, schools, clinics, and faith communities",
      "Hotel / visitor industry desk briefs",
      "Language-access partners and ASL interpreters",
      "Printed flyers at food hubs and homestead meeting places",
    ],
  },
];

/**
 * English planning templates. `phase`: before | during | after
 * `hazards`: which scenarios the template fits (or "all")
 */
export const MESSAGE_TEMPLATES = [
  {
    id: "before-prepare",
    phase: "before",
    hazards: ["all"],
    title: "Prepare now — shelter and go-bag",
    audience: "General public + AFN households",
    body: "A storm or hazard may affect our islands. If you may need a public shelter, pack medicines, chargers, important papers, and supplies for any pets (crate, food, leash). If you use power-dependent medical equipment, talk with your care provider about a backup plan. Official openings will be announced by county emergency management — this message is preparedness only.",
  },
  {
    id: "before-lep",
    phase: "before",
    hazards: ["all"],
    title: "Language-access readiness (for partners)",
    audience: "County EM / language partners / libraries",
    body: `Please confirm interpreters and translated plain-language lines before impact for: ${PRIORITY_LANGUAGES.filter((l) => l.id !== "en" && l.id !== "asl").map((l) => l.label).join(", ")}. Share ASL video options if available. Use trusted community messengers — not only English social media.`,
  },
  {
    id: "before-immigrant",
    phase: "before",
    hazards: ["all"],
    title: "Shelter is about safety",
    audience: "Immigrant / mixed-status households (via trusted messengers)",
    body: "If you need a safe place during the emergency, public emergency shelters are for everyone’s safety. Bring your go-bag and any medicines. You do not need to share private immigration information to seek life-safety shelter. Listen to county emergency management for which sites are open.",
  },
  {
    id: "during-open-shelter",
    phase: "during",
    hazards: ["all"],
    title: "Shelter opening",
    audience: "Public release",
    body: "[COUNTY] emergency management: A public emergency shelter is open at [SHELTER_SITE]. Bring food, water, medicines, and bedding if you can. Pets: [PET_RULE]. This is not a hospital — for medical emergencies call 911. For updates, follow [OFFICIAL_CHANNEL].",
  },
  {
    id: "during-sip",
    phase: "during",
    hazards: ["hurricane", "wildfire", "flood"],
    title: "Shelter in place when safer",
    audience: "Public release",
    body: "If county officials say it is safer to stay home, stay inside away from windows, keep phones charged, and check on neighbors who may need help — especially older adults and people who use medical devices. Do not drive through flood water. Follow only official county and NWS instructions.",
  },
  {
    id: "during-tsunami",
    phase: "during",
    hazards: ["tsunami"],
    title: "Tsunami — move inland / to high ground",
    audience: "Public release",
    body: "A tsunami warning or evacuation order is in effect for [ZONE]. Move inland or to high ground now. Do not wait to watch the water. Take your go-bag if you can leave quickly. Listen to sirens and NOAA Weather Radio. Hotels and workplaces should help visitors without cars.",
  },
  {
    id: "during-transport",
    phase: "during",
    hazards: ["all"],
    title: "No-vehicle / accessible transport",
    audience: "Public release",
    body: "If you need a ride to an open shelter, call [TRANSPORT_LINE] or go to the announced pickup point at [PICKUP]. Accessible vehicles will be prioritized for people with mobility needs and medical equipment. Bring medicines and a caregiver if you have one.",
  },
  {
    id: "after-return",
    phase: "after",
    hazards: ["all"],
    title: "After the hazard — recovery info",
    audience: "Public release",
    body: "The immediate hazard has passed for [AREA], but roads and power may still be unsafe. Return home only when county officials say it is safe. For debris, housing, or recovery help, use official county and State channels — not unverified social media lists. Mental health support: call or text 988.",
  },
  {
    id: "after-trauma",
    phase: "after",
    hazards: ["all"],
    title: "Trauma-informed partner talking points",
    audience: "Partner / staff brief",
    body: "Speak calmly. Offer choices (“Would you like water or a quiet seat?”). Do not demand personal stories. Protect privacy — no photos of shelter guests without consent. Connect people to 988 or county behavioral-health partners if they ask for help. Thank volunteers and remind them rest matters too.",
  },
];

export const PHASES = [
  { id: "before", label: "Before" },
  { id: "during", label: "During" },
  { id: "after", label: "After" },
];

export function templatesFor({ phase, hazardId }) {
  return MESSAGE_TEMPLATES.filter((item) => {
    const phaseOk = !phase || item.phase === phase;
    const hazardOk =
      !hazardId ||
      item.hazards.includes("all") ||
      item.hazards.includes(hazardId);
    return phaseOk && hazardOk;
  });
}

function trimField(value) {
  const text = String(value ?? "").trim();
  return text || "";
}

function shelterSitePhrase(fields = {}) {
  const facility = trimField(fields.facility);
  const address = trimField(fields.address);
  if (facility && address) return `${facility}, ${address}`;
  if (facility) return facility;
  return "a designated site announced by county emergency management";
}

/** Fill template tokens with natural wording — never leave [BRACKETS] in the draft. */
export function fillTemplate(body, fields = {}) {
  const county = trimField(fields.county) || "County";
  const zone = trimField(fields.zone) || trimField(fields.area) || "this area";
  const area = trimField(fields.area) || trimField(fields.zone) || "this area";
  const pickup =
    trimField(fields.location) || "the announced community pickup point";
  const transport =
    trimField(fields.transportLine) || `${county} transit / paratransit`;
  const channel =
    trimField(fields.officialChannel) || `${county} emergency management`;
  const petRule =
    trimField(fields.petRule) || "follow county pet and crate guidance";

  const aliases = {
    COUNTY: county,
    FACILITY: trimField(fields.facility) || "the designated shelter",
    ADDRESS: trimField(fields.address),
    SHELTER_SITE: shelterSitePhrase(fields),
    ZONE: zone,
    AREA: area,
    LOCATION: pickup,
    PICKUP: pickup,
    TRANSPORT_LINE: transport,
    "COUNTY TRANSPORT / PARATRANSIT LINE": transport,
    OFFICIAL_CHANNEL: channel,
    "OFFICIAL CHANNEL": channel,
    PET_RULE: petRule,
    "PET RULE — CRATE REQUIRED / PET-FRIENDLY AREA": petRule,
    "PET RULE": petRule,
  };

  let text = String(body || "").replace(/\[([^\]]+)\]/g, (match, rawKey) => {
    const key = String(rawKey).trim().toUpperCase();
    if (Object.prototype.hasOwnProperty.call(aliases, key)) {
      return aliases[key];
    }
    return match;
  });

  // Clean leftover empty parentheticals if address was blank in older templates.
  text = text
    .replace(/\s*\(\s*\)/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.])/g, "$1")
    .trim();
  return text;
}

export function defaultComposerFields(county) {
  const name = county?.name || "County";
  return {
    county: name,
    facility: "",
    address: "",
    // Leave blank so planners pick a town from quick places (not the whole island).
    zone: "",
    area: "",
    location: "",
    transportLine: `${name} transit / paratransit`,
    officialChannel: `${name} emergency management`,
    petRule: "follow county pet and crate guidance",
  };
}

/**
 * Full advisory draft for County/partner desks:
 * where it affects · where to get help · languages · message body.
 * Reads like a planning memo — no bracket leftovers or audience labels.
 */
export function buildPublicAdvisoryDraft({
  county,
  hazardLabel,
  phaseLabel,
  fields,
  messageBody,
  nearbyShelterNames,
}) {
  const areaLine =
    trimField(fields.zone) ||
    trimField(fields.area) ||
    county?.islandLabel ||
    county?.name ||
    "Hawaiʻi";
  const helpLines = [];
  if (trimField(fields.facility)) {
    helpLines.push(
      `- Shelter: ${shelterSitePhrase(fields)} (confirm County has opened this site before releasing)`
    );
  } else {
    helpLines.push(
      "- Shelter: County emergency management will announce which designated sites are open"
    );
  }
  if (nearbyShelterNames?.length) {
    helpLines.push(
      `- Nearby designated sites to consider: ${nearbyShelterNames.join("; ")}`
    );
  }
  if (trimField(fields.location)) {
    helpLines.push(`- Transport pickup: ${trimField(fields.location)}`);
  }
  if (trimField(fields.transportLine)) {
    helpLines.push(`- Transit / paratransit: ${trimField(fields.transportLine)}`);
  }
  if (trimField(fields.officialChannel)) {
    helpLines.push(`- Official updates: ${trimField(fields.officialChannel)}`);
  }
  if (trimField(fields.petRule)) {
    helpLines.push(`- Pets: ${trimField(fields.petRule)}`);
  }

  const languageLabels = PRIORITY_LANGUAGES.filter((lang) => lang.id !== "en")
    .map((lang) => lang.label)
    .join(", ");

  return [
    "PLANNING DRAFT — not an official alert. County PIO must approve before public release.",
    "",
    `Phase: ${phaseLabel || "—"}`,
    `Hazard: ${hazardLabel || "—"}`,
    `Where this affects: ${trimField(fields.county) || county?.name || "County"} — ${areaLine}`,
    "",
    "Where to get help",
    ...helpLines,
    "",
    "Priority languages for mass care",
    languageLabels,
    "",
    "Suggested message",
    messageBody || "Choose a message focus above to fill this section.",
    "",
    "Seeking emergency shelter is about safety. Follow only official county and NWS instructions.",
  ].join("\n");
}
