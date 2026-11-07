/**
 * Planning-exercise samples for Map → Planning scenario mode only.
 * These are NOT National Weather Service products and must never be shown as live alerts.
 */

export const DISASTER_CATEGORIES = ["Hurricanes", "Wildfires", "Tsunamis", "Floods"];

export const DEMO_ALERTS = [
  {
    id: "alert-wf-haleiwa",
    category: "Wildfires",
    disasterType: "Wildfire",
    location: "Haleʻiwa, North Shore, Oʻahu",
    communityId: "haleiwa",
    countyId: "honolulu",
    title: "Planning exercise: fire-weather scenario (North Shore)",
    officialTitle: "HAIC exercise card — fire weather (not a live NWS product)",
    severity: "Exercise",
    level: 3,
    status: "Exercise sample — not active",
    issuedAt: "2026-11-06T10:00:00-10:00",
    source: "HAIC planning exercise (sample)",
    sourceUrl: "https://www.weather.gov/hfo/",
    summary:
      "Sample ESF-6 workflow card only. Use Live conditions for real NWS products. This does not mean a Fire Weather Watch is in effect.",
  },
  {
    id: "alert-flood-ewa",
    category: "Floods",
    disasterType: "Coastal Flooding",
    location: "ʻEwa Beach, Honolulu County",
    communityId: "ewa-beach",
    countyId: "honolulu",
    title: "Planning exercise: coastal-flood scenario (ʻEwa Beach)",
    officialTitle: "HAIC exercise card — coastal flood (not a live advisory)",
    severity: "Exercise",
    level: 3,
    status: "Exercise sample — not active",
    issuedAt: "2026-11-06T09:30:00-10:00",
    source: "HAIC planning exercise (sample)",
    sourceUrl: "https://dod.hawaii.gov/hiema/",
    summary:
      "Sample card to practice shelter and transport estimates. Not an official coastal flood product.",
  },
  {
    id: "alert-surf-north",
    category: "Floods",
    disasterType: "High Surf",
    location: "North Shore, Oʻahu",
    communityId: "kahuku",
    countyId: "honolulu",
    title: "Planning exercise: high-surf coastal scenario",
    officialTitle: "HAIC exercise card — high surf (not a live advisory)",
    severity: "Exercise",
    level: 2,
    status: "Exercise sample — not active",
    issuedAt: "2026-11-05T16:00:00-10:00",
    source: "HAIC planning exercise (sample)",
    sourceUrl: "https://www.weather.gov/hfo/",
    summary:
      "Exercise only. Inland towns are not auto-classified from this sample card.",
  },
  {
    id: "alert-wind-central",
    category: "Hurricanes",
    disasterType: "Strong Winds",
    location: "Central Oʻahu",
    communityId: "mililani",
    countyId: "honolulu",
    title: "Planning exercise: strong-wind scenario (Central Oʻahu)",
    officialTitle: "HAIC exercise card — wind (not a live advisory)",
    severity: "Exercise",
    level: 2,
    status: "Exercise sample — not active",
    issuedAt: "2026-11-05T14:00:00-10:00",
    source: "HAIC planning exercise (sample)",
    sourceUrl: "https://www.weather.gov/hfo/",
    summary: "Exercise sample for Central Oʻahu mass-care planning — not a live wind product.",
  },
  {
    id: "alert-brush-waianae",
    category: "Wildfires",
    disasterType: "Wildfire",
    location: "Waiʻanae, Oʻahu",
    communityId: "waianae",
    countyId: "honolulu",
    title: "Planning exercise: wildfire response after-action sample",
    officialTitle: "HAIC exercise card — wildfire (historical sample, not live)",
    severity: "Exercise",
    level: 2,
    status: "Exercise sample — not active",
    issuedAt: "2026-11-04T18:00:00-10:00",
    source: "HAIC planning exercise (sample)",
    sourceUrl: "https://fire.honolulu.gov/",
    summary: "Historical-style exercise card for practice only. Not a live fire incident.",
  },
  {
    id: "alert-tsunami-hilo",
    category: "Tsunamis",
    disasterType: "Tsunami",
    location: "Hilo, Hawaiʻi County",
    communityId: "hilo",
    countyId: "hawaii",
    title: "Planning exercise: tsunami information scenario (Hilo)",
    officialTitle: "HAIC exercise card — tsunami information (not a warning)",
    severity: "Exercise",
    level: 2,
    status: "Exercise sample — not active",
    issuedAt: "2026-11-06T08:00:00-10:00",
    source: "HAIC planning exercise (sample)",
    sourceUrl: "https://www.tsunami.gov/",
    summary:
      "Exercise card styled like an information statement. Not a tsunami warning. Kona is not classified from this Hilo sample.",
  },
  {
    id: "alert-cane-kauai",
    category: "Hurricanes",
    disasterType: "Hurricane",
    location: "Līhuʻe, Kauaʻi County",
    communityId: "lihue",
    countyId: "kauai",
    title: "Planning exercise: tropical cyclone mass-care drill",
    officialTitle: "HAIC exercise card — hurricane shelter drill (not a live cyclone)",
    severity: "Exercise",
    level: 2,
    status: "Exercise sample — not active",
    issuedAt: "2026-11-06T11:00:00-10:00",
    source: "HAIC planning exercise (sample)",
    sourceUrl: "https://www.nhc.noaa.gov/",
    summary: "Off-season ESF-6 shelter drill card. No live tropical cyclone is implied.",
  },
];

export function alertsForCounty(countyId) {
  return DEMO_ALERTS.filter((alert) => alert.countyId === countyId);
}

export function alertsForCommunity(communityId) {
  return DEMO_ALERTS.filter((alert) => alert.communityId === communityId);
}
