/**
 * Refresh county ACS/QuickFacts-style indicators.
 * Usage: CENSUS_API_KEY=... node scripts/fetch-acs.mjs
 * Does not write the key into source files.
 */
const KEY = process.env.CENSUS_API_KEY;
if (!KEY) {
  console.error("Set CENSUS_API_KEY in the environment. Activate it from the Census email first.");
  process.exit(1);
}

const url =
  "https://api.census.gov/data/2023/acs/acs5/profile?" +
  new URLSearchParams({
    get: "NAME,DP05_0001E,DP05_0024PE,DP02_0072PE,DP04_0058PE,DP02_0113PE,DP03_0119PE",
    for: "county:*",
    in: "state:15",
    key: KEY,
  });

const response = await fetch(url);
const text = await response.text();
if (!response.ok || text.includes("Invalid Key") || text.startsWith("<")) {
  console.error("Census API rejected the request. Activate the key from the signup email, then retry.");
  console.error(text.slice(0, 300));
  process.exit(1);
}

const rows = JSON.parse(text);
console.log(JSON.stringify(rows, null, 2));
console.log("\nFields: NAME, population, 65+ %, disability under 65 %, no-vehicle %, language other than English %, poverty %");
