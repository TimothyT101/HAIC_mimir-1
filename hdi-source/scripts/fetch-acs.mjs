/**
 * Refresh county and Census place ACS indicators (no key written into src/).
 * Usage from hdi-source: node scripts/fetch-acs.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
loadEnv(path.join(root, ".env.local"));

const KEY = process.env.CENSUS_API_KEY;
if (!KEY) {
  console.error("Create hdi-source/.env.local with CENSUS_API_KEY. Activate the key from the Census email first.");
  process.exit(1);
}

const COUNTY_FIPS = {
  "001": "hawaii",
  "003": "honolulu",
  "007": "kauai",
  "009": "maui",
};

/** Census place NAME prefix (before ", Hawaii") → community id. Two Kailua CDPs use place codes. */
const PLACE_MATCH = {
  "Kapolei CDP": "kapolei",
  "Ewa Beach CDP": "ewa-beach",
  "Waipahu CDP": "waipahu",
  "Mililani Town CDP": "mililani",
  "Wahiawa CDP": "wahiawa",
  "Haleiwa CDP": "haleiwa",
  "Urban Honolulu CDP": "honolulu",
  "Kahuku CDP": "kahuku",
  "Waianae CDP": "waianae",
  "Kaneohe CDP": "kaneoha",
  "Waimanalo CDP": "waimanalo",
  "Pearl City CDP": "pearl-city",
  "Aiea CDP": "aiea",
  "Lahaina CDP": "lahaina",
  "Kahului CDP": "kahului",
  "Kaunakakai CDP": "kaunakakai",
  "Lanai City CDP": "lanai-city",
  "Hilo CDP": "hilo",
  "Pahoa CDP": "pahoa",
  "Lihue CDP": "lihue",
  "Kapaa CDP": "kapaa",
  "Kailua CDP (Honolulu County)": "kailua-oahu",
  "Kailua CDP (Hawaii County)": "kailua-kona",
};

const GET =
  "NAME,DP05_0001E,DP05_0024PE,DP02_0072PE,DP04_0058PE,DP02_0114PE,DP02_0115PE,DP03_0119PE";

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const name = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (name && process.env[name] == null) process.env[name] = value;
  }
}

function num(value) {
  if (value == null || value === "" || value === "-999999999" || value === "null") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseRow(headers, row) {
  const rec = Object.fromEntries(headers.map((key, i) => [key, row[i]]));
  return {
    censusName: rec.NAME,
    population: num(rec.DP05_0001E),
    olderAdultsPct: num(rec.DP05_0024PE),
    disabilityPct: num(rec.DP02_0072PE),
    noVehiclePct: num(rec.DP04_0058PE),
    languageOtherThanEnglishPct: num(rec.DP02_0114PE),
    limitedEnglishPct: num(rec.DP02_0115PE),
    povertyPct: num(rec.DP03_0119PE),
    state: rec.state,
    county: rec.county,
    place: rec.place,
  };
}

async function censusQuery(params) {
  const url =
    "https://api.census.gov/data/2023/acs/acs5/profile?" +
    new URLSearchParams({ get: GET, key: KEY, ...params });
  const response = await fetch(url);
  const text = await response.text();
  if (!response.ok || text.includes("Invalid Key") || text.startsWith("<") || text.includes("missing_key")) {
    console.error("Census API rejected the request. Activate the key from the signup email, then retry.");
    console.error(text.slice(0, 400));
    process.exit(1);
  }
  const [headers, ...rows] = JSON.parse(text);
  return rows.map((row) => parseRow(headers, row));
}

const counties = await censusQuery({ for: "county:*", in: "state:15" });
const places = await censusQuery({ for: "place:*", in: "state:15" });

const COUNTY_ACS = {};
for (const row of counties) {
  const id = COUNTY_FIPS[row.county];
  if (!id) continue;
  COUNTY_ACS[id] = {
    countyId: id,
    name: row.censusName.replace(", Hawaii", ""),
    censusName: row.censusName,
    population: row.population,
    olderAdultsPct: row.olderAdultsPct,
    disabilityPct: row.disabilityPct,
    disabilityUnder65Pct: row.disabilityPct,
    languageOtherThanEnglishPct: row.languageOtherThanEnglishPct,
    limitedEnglishPct: row.limitedEnglishPct,
    povertyPct: row.povertyPct,
    noVehiclePct: row.noVehiclePct,
    geography: "County",
    vintage: "ACS 2023 5-year",
    geoid: `15${row.county}`,
  };
}

const PLACE_ACS = {};
const unmatchedPlaces = [];
for (const row of places) {
  const prefix = row.censusName.replace(/, Hawaii$/, "");
  const communityId = PLACE_MATCH[prefix];
  if (!communityId) {
    unmatchedPlaces.push(`${prefix} (${row.place}, pop ${row.population})`);
    continue;
  }
  PLACE_ACS[communityId] = {
    communityId,
    censusName: row.censusName,
    placeName: prefix,
    population: row.population,
    olderAdultsPct: row.olderAdultsPct,
    disabilityPct: row.disabilityPct,
    languageOtherThanEnglishPct: row.languageOtherThanEnglishPct,
    limitedEnglishPct: row.limitedEnglishPct,
    povertyPct: row.povertyPct,
    noVehiclePct: row.noVehiclePct,
    geography: "Census place / CDP",
    vintage: "ACS 2023 5-year",
    geoid: `15${row.place}`,
  };
}

const payload = {
  retrievedAt: new Date().toISOString().slice(0, 10),
  vintage: "ACS 2023 5-year Data Profile",
  url: "https://api.census.gov/data/2023/acs/acs5/profile",
  counties: COUNTY_ACS,
  places: PLACE_ACS,
};

const outFile = path.join(root, "src/data/acs2023.json");
fs.writeFileSync(outFile, `${JSON.stringify(payload, null, 2)}\n`);

console.log(`Wrote ${outFile}`);
console.log("Counties:", Object.keys(COUNTY_ACS).join(", "));
console.log("Matched places:", Object.keys(PLACE_ACS).sort().join(", "));
const missing = Object.values(PLACE_MATCH).concat(["kailua-oahu", "kailua-kona"]).filter((id) => !PLACE_ACS[id]);
if (missing.length) console.log("Communities with no ACS place match:", [...new Set(missing)].join(", "));
console.log("Other HI places not mapped (ok):", unmatchedPlaces.length);
