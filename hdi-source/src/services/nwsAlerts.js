import { categorizeEvent, inferCountyIds, severityToLevel } from "../lib/nwsZones";

export const NWS_ALERTS_ENDPOINT = "https://api.weather.gov/alerts/active?area=HI";
export const NWS_PROXY_PATH = "/api/nws/alerts/active?area=HI";
/** Human-facing Honolulu NWS office page (alert source for this prototype). */
export const NWS_PUBLIC_URL = "https://www.weather.gov/hfo/";

const NWS_HEADERS = {
  Accept: "application/geo+json",
};

export function normalizeNwsFeature(feature) {
  const properties = feature.properties ?? {};
  const event = properties.event || "Weather alert";
  const areaDesc = properties.areaDesc || "Hawaiʻi (area not specified)";
  const geometry = feature.geometry ?? null;

  return {
    id: properties.id || feature.id,
    verified: true,
    sourceKind: "nws",
    category: categorizeEvent(event),
    disasterType: event,
    location: areaDesc,
    areaDesc,
    communityId: null,
    countyIds: inferCountyIds(areaDesc, properties.geocode),
    title: properties.event || "NWS alert",
    officialTitle: properties.headline || properties.event || "National Weather Service alert",
    severity: properties.severity || "Unknown",
    level: severityToLevel(properties.severity),
    status: properties.status || "Unknown",
    issuedAt: properties.sent || properties.effective || properties.onset,
    expiresAt: properties.expires || properties.ends,
    source: properties.senderName || "National Weather Service",
    sourceUrl: properties.id || "https://www.weather.gov/hfo/",
    summary: properties.description || "No narrative was included with this product.",
    instruction: properties.instruction || "",
    geometry,
    geometryLabel: geometry
      ? "NWS provided alert polygon"
      : `Broader affected zone (no polygon provided): ${areaDesc}`,
  };
}

export async function fetchLiveHawaiiAlerts() {
  const urls = [NWS_PROXY_PATH, NWS_ALERTS_ENDPOINT];
  let lastError;

  for (const url of urls) {
    try {
      const response = await fetch(url, { headers: NWS_HEADERS });
      if (!response.ok) {
        lastError = new Error(`NWS request failed (${response.status})`);
        continue;
      }
      const geojson = await response.json();
      return {
        source: "National Weather Service",
        endpoint: NWS_ALERTS_ENDPOINT,
        fetchedAt: new Date().toISOString(),
        alerts: (geojson.features ?? []).map(normalizeNwsFeature),
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("NWS request failed");
}

