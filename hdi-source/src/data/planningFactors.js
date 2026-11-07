/**
 * Documented ESF-6 planning factors for the HAIC prototype.
 * Prefer Hawaiʻi / federal public sources over invented percentages.
 * These are planning models — not operational forecasts or registries.
 */

/** ACS-derived statewide average persons per household (Hawaiʻi planning constant). */
export const PERSONS_PER_HOUSEHOLD = 2.92;

/**
 * HHS emPOWER Map — de-identified Medicare beneficiaries with electricity-dependent DME.
 * County totals only. Not a patient list. Under-counts non-Medicare users.
 * Snapshot cited publicly as of 2026-03 (empowerprogram.hhs.gov / republished county tables).
 */
export const EMPOWER_SOURCE = {
  name: "HHS emPOWER Map (Medicare electricity-dependent DME)",
  asOf: "2026-03",
  url: "https://empowerprogram.hhs.gov/empowermap",
  note: "De-identified county totals. Masked ZIP cells and non-Medicare users mean this underestimates true electricity-dependent need.",
};

export const EMPOWER_BY_COUNTY = {
  honolulu: 4497,
  hawaii: 1193,
  maui: 756,
  kauai: 302,
};

/**
 * Companion-animal household rates from Hawaiʻi DOH Hawaiʻi Health Survey 2011–2012
 * (peer-reviewed baseline estimates; indoor companion animals).
 * https://pmc.ncbi.nlm.nih.gov/articles/PMC11707368/
 */
export const PET_SOURCE = {
  name: "Hawaiʻi Health Survey 2011–2012 companion-animal baseline (DOH)",
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11707368/",
  note: "Survey asked about companion animals that spend part/all of the day indoors; may undercount outdoor-only animals. Not a live pet registry.",
};

export const PET_BY_COUNTY = {
  // anyIndoorCA uses statewide 39% where county “any pet” was not published separately.
  honolulu: { dogHH: 0.291, catHH: 0.12, anyIndoorCA: 0.39 },
  hawaii: { dogHH: 0.356, catHH: 0.221, anyIndoorCA: 0.39 },
  maui: { dogHH: 0.297, catHH: 0.192, anyIndoorCA: 0.39 },
  kauai: { dogHH: 0.312, catHH: 0.186, anyIndoorCA: 0.39 },
};

/** Approximate animals per pet-owning household (APMA / AVMA planning proxy). */
export const AVG_PETS_PER_PET_HOUSEHOLD = 1.7;

/**
 * Hazard scenario factors.
 * shelterRate sources:
 * - hurricane: HIEMA Hurricane Evacuation Shelter Planning Guidance (Dec 2017) —
 *   statewide public-shelter demand planning figure 35% from 2009 USACE survey.
 * - wildfire / flood / tsunami: FEMA Evacuation & Shelter-in-Place planning rule of thumb
 *   ~10–15% of the affected population when local behavioral surveys are unavailable;
 *   applied to the selected community as a geographic proxy (not a zone intersection).
 */
export const SCENARIO_FACTORS = {
  hurricane: {
    id: "hurricane",
    label: "Hurricane",
    shelterRate: 0.35,
    shelterRateSource: "HIEMA Dec 2017 hurricane shelter guidance (35% statewide demand from 2009 USACE survey)",
    outageIntensity: 1,
    waterGallonsPerPersonDay: 1,
    mealPerPersonDay: 3,
    days: 3,
    exposure:
      "Island-scale wind, rain, and coastal inundation. HIEMA uses a 35% public-shelter demand planning figure for hurricane evacuation shelter space.",
    notes: "Shelter rate 35% per HIEMA hurricane shelter planning guidance (USACE 2009 survey).",
  },
  wildfire: {
    id: "wildfire",
    label: "Wildfire",
    shelterRate: 0.1,
    shelterRateSource: "FEMA Evacuation & Shelter-in-Place guide (~10–15% shelter demand rule of thumb); 10% applied to selected community as WUI proxy",
    outageIntensity: 0.4,
    waterGallonsPerPersonDay: 1,
    mealPerPersonDay: 3,
    days: 2,
    exposure:
      "Localized wildland-urban interface and smoke. FEMA’s general shelter-demand rule of thumb is about 10–15% of the affected population.",
    notes: "Shelter rate 10% (FEMA general rule lower bound) applied to the selected community as a WUI exposure proxy.",
  },
  tsunami: {
    id: "tsunami",
    label: "Tsunami",
    shelterRate: 0.125,
    shelterRateSource: "FEMA ~10–15% shelter-demand midpoint (12.5%) as community proxy when tsunami-zone population is not clipped",
    outageIntensity: 0.5,
    waterGallonsPerPersonDay: 1,
    mealPerPersonDay: 3,
    days: 2,
    exposure:
      "Coastal evacuation zones and harbors. Without zone-clipped ACS counts, the prototype uses FEMA’s mid-range shelter-demand factor on the selected community.",
    notes: "Shelter rate 12.5% (FEMA 10–15% midpoint) — replace with tsunami-zone population when GIS clip is available.",
  },
  flood: {
    id: "flood",
    label: "Flood",
    shelterRate: 0.1,
    shelterRateSource: "FEMA ~10–15% shelter-demand rule of thumb; 10% community proxy for flood-exposed neighborhoods",
    outageIntensity: 0.35,
    waterGallonsPerPersonDay: 1,
    mealPerPersonDay: 3,
    days: 2,
    exposure:
      "Stream, drainage, and low-lying floodplain exposure. Demand uses FEMA’s general shelter-demand range as a community proxy.",
    notes: "Shelter rate 10% (FEMA general rule lower bound) pending SFHA-population intersection.",
  },
};

/**
 * HIEMA notes ~15% of the state’s population are visitors on a given day.
 * Visitors seeking public shelter are treated as needing transportation assistance.
 */
export const VISITOR_SHARE = 0.15;
export const VISITOR_SOURCE =
  "HIEMA Hurricane Evacuation Shelter Planning Guidance (Dec 2017): ~15% of state population are visitors on a given day";

export const WATER_SOURCE = "Ready.gov / CDC emergency water guidance — 1 gallon per person per day";
export const MEAL_SOURCE = "American Red Cross / mass-care planning practice — 3 meals per person per day while sheltered";
export const DAYS_SOURCE = {
  hurricane: "Ready.gov minimum 3-day household preparedness window for hurricane planning horizon",
  default: "Short-displacement planning horizon (2 days) for localized wildfire / tsunami / flood scenarios",
};

export const HIEMA_SHELTER_GUIDANCE_URL =
  "https://dod.hawaii.gov/hiema/files/2018/02/State-Guidelines-for-Hurricane-Evacuation-Shelters.FINAL_.December-2017.pdf";
export const FEMA_EVAC_SHELTER_URL =
  "https://www.fema.gov/sites/default/files/2020-07/planning-considerations-evacuation-and-shelter-in-place.pdf";
export const READY_WATER_URL = "https://www.ready.gov/water";
export const READY_KIT_URL = "https://www.ready.gov/kit";
export const RED_CROSS_SHELTER_URL = "https://www.redcross.org/get-help/disaster-relief-and-recovery-services/find-an-open-shelter.html";
export const HAWAII_GIS_HAZARDS_URL =
  "https://geodata.hawaii.gov/arcgis/rest/services/Hazards/MapServer";
export const HONOLULU_DEM_URL = "https://www.honolulu.gov/dem/";
export const HONOLULU_SHELTER_LIST_URL =
  "https://uipa.org/files/foi/476/OahuHurricaneEvacuationShelterList18OCT18FINAL.pdf";
export const KAUAI_SHELTER_LIST_URL =
  "https://www.kauai.gov/files/assets/public/v/1/emergency-management/documents/potential-shelter-list.pdf";
export const MAUI_EMA_URL = "https://www.mauicounty.gov/76/Emergency-Management";
export const HAWAII_CD_URL = "https://www.hawaiicounty.gov/departments/civil-defense";
export const OPEN_DATA_SHELTERS_URL =
  "https://opendata.hawaii.gov/dataset/state-civil-defense-hurricane-shelters";
export const HONOLULU_LIVE_SHELTER_STATUS_URL = "https://p.veoci.com/hnlshelter";

/**
 * Canonical clickable source list for About & Sources and Resource Planning.
 * Keep every planning factor cited above represented here with a URL.
 */
export const PUBLIC_SOURCE_LINKS = [
  {
    id: "nws",
    label: "National Weather Service active alerts (Hawaiʻi)",
    url: "https://api.weather.gov/alerts/active?area=HI",
    usedFor: "Live Map county alert coloring and alert list",
  },
  {
    id: "acs",
    label: "U.S. Census Bureau ACS 5-year Data Profile API",
    url: "https://api.census.gov/data/2023/acs/acs5/profile",
    usedFor: "Population, LEP, disability, no-vehicle, poverty, age 65+",
  },
  {
    id: "svi",
    label: "CDC/ATSDR Social Vulnerability Index 2022 (county)",
    url: "https://www.atsdr.cdc.gov/place-health/php/svi/index.html",
    usedFor: "County SVI percentiles on Resource Planning",
  },
  {
    id: "svi-tracts",
    label: "CDC/ATSDR SVI 2022 Hawaiʻi census-tract CSV",
    url: "https://svi.cdc.gov/Documents/Data/2022/csv/states/Hawaii.csv",
    usedFor:
      "Tract AFN choropleth (disability, limited English, no vehicle, age 65+, poverty, overall SVI)",
  },
  {
    id: "census-tracts",
    label: "U.S. Census 2023 cartographic boundary — Hawaiʻi tracts (1:500k)",
    url: "https://www2.census.gov/geo/tiger/GENZ2023/shp/cb_2023_15_tract_500k.zip",
    usedFor: "Tract polygon boundaries for the AFN map layer",
  },
  {
    id: "empower",
    label: EMPOWER_SOURCE.name,
    url: EMPOWER_SOURCE.url,
    usedFor: `Electricity-dependent Medicare DME county totals (snapshot ${EMPOWER_SOURCE.asOf})`,
  },
  {
    id: "hiema-shelter",
    label: "HIEMA Hurricane Evacuation Shelter Planning Guidance (Dec 2017)",
    url: HIEMA_SHELTER_GUIDANCE_URL,
    usedFor: "35% hurricane shelter demand; ~15% visitor share",
  },
  {
    id: "fema-evac",
    label: "FEMA Planning Considerations: Evacuation and Shelter-in-Place",
    url: FEMA_EVAC_SHELTER_URL,
    usedFor: "~10–15% shelter-demand rule of thumb for wildfire / tsunami / flood proxies",
  },
  {
    id: "ready-water",
    label: "Ready.gov — Water",
    url: READY_WATER_URL,
    usedFor: "1 gallon per person per day",
  },
  {
    id: "ready-kit",
    label: "Ready.gov — Build A Kit (3-day window)",
    url: READY_KIT_URL,
    usedFor: "Hurricane planning horizon of 3 days",
  },
  {
    id: "red-cross",
    label: "American Red Cross — disaster shelter / mass care",
    url: RED_CROSS_SHELTER_URL,
    usedFor: "3 meals per person per day mass-care planning practice",
  },
  {
    id: "pets",
    label: PET_SOURCE.name,
    url: PET_SOURCE.url,
    usedFor: "Indoor companion-animal household rates for pet support estimates",
  },
  {
    id: "hawaii-gis",
    label: "Hawaiʻi Statewide GIS — Hazards MapServer",
    url: HAWAII_GIS_HAZARDS_URL,
    usedFor: "Tsunami (layer 11), flood DFIRM, wildfire risk (layer 7) overlays",
  },
  {
    id: "honolulu-dem",
    label: "City & County of Honolulu Department of Emergency Management",
    url: HONOLULU_DEM_URL,
    usedFor: "County EM / hurricane refuge guidance",
  },
  {
    id: "honolulu-shelter-list",
    label: "Honolulu DEM Oʻahu Hurricane Evacuation Shelter List (Oct 18, 2018 FOI)",
    url: HONOLULU_SHELTER_LIST_URL,
    usedFor: "Designated Oʻahu planning facilities (not live openings)",
  },
  {
    id: "kauai-shelter-list",
    label: "Kauaʻi KEMA Potential Shelter / Refuge Area List",
    url: KAUAI_SHELTER_LIST_URL,
    usedFor: "Designated Kauaʻi planning facilities (not live openings)",
  },
  {
    id: "maui-ema",
    label: "Maui County Emergency Management Agency",
    url: MAUI_EMA_URL,
    usedFor: "Maui County shelter announcements and EMA hub",
  },
  {
    id: "hawaii-cd",
    label: "Hawaiʻi County Civil Defense",
    url: HAWAII_CD_URL,
    usedFor: "Hawaiʻi Island shelter announcements and Civil Defense hub",
  },
  {
    id: "opendata-shelters",
    label: "Hawaiʻi Open Data — State Civil Defense Hurricane Shelters (CSV, 2019)",
    url: OPEN_DATA_SHELTERS_URL,
    usedFor:
      "Statewide designated-facility inventory with coordinates (planning only; not operational status)",
  },
  {
    id: "honolulu-live-shelters",
    label: "Honolulu live hurricane refuge / shelter status (Veoci)",
    url: HONOLULU_LIVE_SHELTER_STATUS_URL,
    usedFor: "Event-time openings for Oʻahu only — not a standing inventory",
  },
  {
    id: "osm",
    label: "OpenStreetMap",
    url: "https://www.openstreetmap.org/copyright",
    usedFor: "Base map tiles",
  },
  {
    id: "esri",
    label: "Esri World Imagery",
    url: "https://www.esri.com/en-us/home",
    usedFor: "Optional satellite base map tiles",
  },
];

export function getPetFactors(countyId) {
  return PET_BY_COUNTY[countyId] ?? PET_BY_COUNTY.honolulu;
}

export function getEmpowerCountyTotal(countyId) {
  return EMPOWER_BY_COUNTY[countyId] ?? 0;
}
