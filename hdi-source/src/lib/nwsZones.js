const COUNTY_KEYWORDS = {
  honolulu: [
    "oahu",
    "oʻahu",
    "honolulu",
    "waianae",
    "waiʻanae",
    "ewa",
    "ʻewa",
    "oahu north shore",
    "pearl harbor",
    "waikiki",
    "koolau",
    "koʻolau",
  ],
  maui: ["maui", "molokai", "molokaʻi", "lanai", "lānaʻi", "kahoolawe", "kahoʻolawe", "kahului", "lahaina"],
  hawaii: [
    "hawaii county",
    "hawaiʻi county",
    "big island",
    "hilo",
    "kona",
    "puna",
    "kohala",
    "hamakua",
    "hāmākua",
    "kau district",
  ],
  kauai: ["kauai", "kauaʻi", "niihau", "niʻihau", "lihue", "līhuʻe"],
};

export function inferCountyIds(areaDesc = "", geocode = {}) {
  const text = `${areaDesc} ${(geocode.UGC || []).join(" ")}`.toLowerCase();
  const matched = Object.entries(COUNTY_KEYWORDS)
    .filter(([, words]) => words.some((word) => text.includes(word)))
    .map(([id]) => id);

  if (matched.length) return matched;
  if (/\bhawaii\b|\bhawaiʻi\b/.test(text) && !text.includes("honolulu")) {
    return ["hawaii"];
  }
  return [];
}

export function categorizeEvent(event = "") {
  const value = event.toLowerCase();
  if (value.includes("hurricane") || value.includes("tropical") || value.includes("typhoon")) {
    return "Hurricanes";
  }
  if (value.includes("fire") || value.includes("red flag") || value.includes("smoke")) {
    return "Wildfires";
  }
  if (value.includes("tsunami")) return "Tsunamis";
  if (value.includes("flood") || value.includes("surf") || value.includes("rip current") || value.includes("tide")) {
    return "Floods";
  }
  return "Other";
}

export function severityToLevel(severity = "") {
  const value = severity.toLowerCase();
  if (value === "extreme") return 5;
  if (value === "severe") return 4;
  if (value === "moderate") return 3;
  if (value === "minor") return 2;
  return "unknown";
}
