import svi2022 from "./svi2022Counties.json";

export const SVI_SOURCE = {
  name: svi2022.source,
  retrievedAt: svi2022.retrievedAt,
  url: svi2022.url,
  note: svi2022.note,
};

export function getCountySvi(countyId) {
  return svi2022.counties[countyId] ?? null;
}

export function formatSviPercentile(value) {
  if (value == null) return "Unknown";
  return `${Math.round(value * 100)}th percentile of U.S. counties`;
}
