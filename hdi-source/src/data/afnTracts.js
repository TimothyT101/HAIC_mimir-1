/**
 * Tract-level Access & Functional Needs (AFN) map metrics.
 * Geometry: public/tracts/tracts-{countyId}.geojson
 * Attributes: CDC/ATSDR SVI 2022 Hawaii tract estimates joined to Census 2023 tract boundaries.
 */

export const AFN_TRACT_SOURCE = {
  name: "CDC/ATSDR Social Vulnerability Index 2022 — Hawaiʻi census tracts",
  csvUrl: "https://svi.cdc.gov/Documents/Data/2022/csv/states/Hawaii.csv",
  documentationUrl:
    "https://www.atsdr.cdc.gov/place-health/php/svi/svi-data-documentation-download.html",
  boundariesUrl:
    "https://www2.census.gov/geo/tiger/GENZ2023/shp/cb_2023_15_tract_500k.zip",
  retrievedAt: "2026-11-07",
  vintage: "SVI 2022 (ACS 2018–2022 inputs)",
  note: "Tract choropleths are de-identified community proxies for CMIST planning. They do not identify people who need rescue.",
};

export const AFN_METRICS = [
  {
    id: "sviOverall",
    label: "Overall SVI (AFN proxy)",
    unit: "percentile",
    description:
      "CDC SVI overall percentile among U.S. tracts (0–1). Higher = more social vulnerability across CMIST-related themes.",
    cmist: ["communication", "medical", "independence", "safety", "transportation"],
  },
  {
    id: "disabilityPct",
    label: "Disability %",
    unit: "percent",
    description: "Share of civilians with a disability (SVI EP_DISABL). CMIST Medical / Independence proxy.",
    cmist: ["medical", "independence"],
  },
  {
    id: "limitedEnglishPct",
    label: "Limited English %",
    unit: "percent",
    description: "Share of people with limited English proficiency (SVI EP_LIMENG). CMIST Communication proxy.",
    cmist: ["communication"],
  },
  {
    id: "noVehiclePct",
    label: "No vehicle %",
    unit: "percent",
    description: "Share of households with no vehicle available (SVI EP_NOVEH). CMIST Transportation proxy.",
    cmist: ["transportation"],
  },
  {
    id: "olderAdultsPct",
    label: "Age 65+ %",
    unit: "percent",
    description: "Share of residents age 65+ (SVI EP_AGE65). CMIST Independence / Safety scale cue.",
    cmist: ["independence", "safety"],
  },
  {
    id: "povertyPct",
    label: "Poverty (150% FPL) %",
    unit: "percent",
    description: "Share below 150% of poverty level (SVI EP_POV150). CMIST Safety / Support proxy.",
    cmist: ["safety"],
  },
];

export function tractGeoUrl(countyId) {
  return `/tracts/tracts-${countyId}.geojson`;
}

/** Color stops for choropleth (low → high vulnerability). */
export function afnFillColor(value, unit) {
  if (value == null || Number.isNaN(value)) return "#cbd5e1";
  const t = unit === "percentile" ? clamp01(value) : clamp01(value / 40);
  // cream → amber → deep red (avoid purple glow aesthetic)
  if (t < 0.25) return "#fef3c7";
  if (t < 0.5) return "#fbbf24";
  if (t < 0.75) return "#f97316";
  return "#b91c1c";
}

function clamp01(n) {
  return Math.max(0, Math.min(1, n));
}

export function formatAfnValue(value, unit) {
  if (value == null || Number.isNaN(value)) return "Unknown";
  if (unit === "percentile") return `${Math.round(value * 100)}th pctile`;
  return `${Number(value).toFixed(1)}%`;
}
