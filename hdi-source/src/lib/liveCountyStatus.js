import { COUNTIES } from "../data/counties";

/** County-scale NWS colors. Town markers stay uncolored. Minor shares green with Fine. */
export const NWS_COUNTY_SCALE = {
  checking: {
    id: "checking",
    label: "Checking NWS",
    detail: "Waiting for the National Weather Service feed.",
    color: "#9ca3af",
    rank: -1,
  },
  error: {
    id: "error",
    label: "NWS unavailable",
    detail: "County color cannot be confirmed until the feed returns.",
    color: "#9ca3af",
    rank: -1,
  },
  none: {
    id: "none",
    label: "Fine",
    detail: "No active NWS product matched this county.",
    color: "#22c55e",
    rank: 0,
  },
  minor: {
    id: "minor",
    label: "Minor",
    detail: "Highest matched NWS severity is Minor.",
    color: "#22c55e",
    rank: 1,
  },
  moderate: {
    id: "moderate",
    label: "Moderate",
    detail: "Highest matched NWS severity is Moderate.",
    color: "#eab308",
    rank: 2,
  },
  severe: {
    id: "severe",
    label: "Severe",
    detail: "Highest matched NWS severity is Severe.",
    color: "#ef4444",
    rank: 3,
  },
  extreme: {
    id: "extreme",
    label: "Extreme",
    detail: "Highest matched NWS severity is Extreme.",
    color: "#7f1d1d",
    rank: 4,
  },
};

export const NWS_COUNTY_LEGEND = [
  { id: "fine", label: "Fine / Minor", color: NWS_COUNTY_SCALE.none.color },
  { id: "moderate", label: "Moderate", color: NWS_COUNTY_SCALE.moderate.color },
  { id: "severe", label: "Severe", color: NWS_COUNTY_SCALE.severe.color },
  { id: "extreme", label: "Extreme", color: NWS_COUNTY_SCALE.extreme.color },
];

export function nwsSeverityToCountyStatus(severity = "") {
  const value = severity.toLowerCase();
  if (value === "extreme") return NWS_COUNTY_SCALE.extreme;
  if (value === "severe") return NWS_COUNTY_SCALE.severe;
  if (value === "moderate") return NWS_COUNTY_SCALE.moderate;
  if (value === "minor") return NWS_COUNTY_SCALE.minor;
  return NWS_COUNTY_SCALE.moderate;
}

export function alertTouchesCounty(alert, countyId) {
  return Boolean(alert?.countyIds?.length && alert.countyIds.includes(countyId));
}

export function countyLiveStatus(countyId, alerts = [], feedStatus = "ready") {
  if (feedStatus === "loading" && !alerts.length) return NWS_COUNTY_SCALE.checking;
  if (feedStatus === "error" && !alerts.length) return NWS_COUNTY_SCALE.error;

  const matched = alerts.filter((alert) => alertTouchesCounty(alert, countyId));
  if (!matched.length) return NWS_COUNTY_SCALE.none;

  return matched
    .map((alert) => nwsSeverityToCountyStatus(alert.severity))
    .sort((a, b) => b.rank - a.rank)[0];
}

export function allCountyLiveStatuses(alerts = [], feedStatus = "ready") {
  return Object.fromEntries(
    COUNTIES.map((county) => [county.id, countyLiveStatus(county.id, alerts, feedStatus)])
  );
}
