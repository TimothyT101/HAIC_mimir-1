# Hawaiʻi Disaster Intelligence (HDI)

**HAIC 2026** · DHS challenge: *Enhancing ESF-6 Planning Through AI-Supported Insights*  
**Category:** AI-Developed Planning and Improvement Challenge (coded prototype)  
**HAIC registered team name:** Ethos  
**Project name:** Mimir  
**Website / product:** Hawaiʻi Disaster Intelligence (HDI)  
**Repository:** https://github.com/TimothyT101/HAIC_mimir-1  
**Live demo (judges):** https://haic-mimir-1.vercel.app/  
**Demo video (walkthrough):** https://youtu.be/LGWZ6OejGAw

> **Not an official emergency warning system.** Always follow NWS, HIEMA, and County emergency management.

---

## Demo video

Watch the full project walkthrough:

**https://youtu.be/LGWZ6OejGAw**

[![Hawaiʻi Disaster Intelligence — HAIC 2026 walkthrough](https://img.youtube.com/vi/LGWZ6OejGAw/maxresdefault.jpg)](https://youtu.be/LGWZ6OejGAw)

The video covers **MAP · MODEL · MATCH**, Resource Planning, the ESF-6 report download, Communication advisories, and About & Sources.

---

## What this is

A County-first ESF-6 **planning** prototype that delivers the challenge’s three required parts:

| Pillar | Where in the app | What judges will see |
| :--- | :--- | :--- |
| **MAP** | **Live Map** | NWS alerts, hazard overlays, shelters, AFN/SVI tract choropleths across **all 4 counties (435 tracts)** |
| **MODEL** | **Resource Planning** | Hurricane / wildfire / tsunami / flood scenarios → shelter, water, meals, transport, backup power, language, pets + **CMIST** notes |
| **MATCH** | **Resource Planning → Coordinated response framework** + **Communication** | Partners with roles & decision points, downloadable ESF-6 planning report, multilingual trauma-informed advisory drafts |

**Coordination model:** Counties lead mass care; State ESF-6 (HIEMA + DHS) supports. The app does **not** replace EOPs or official alerting.

More detail: [`goals_and_metrics.md`](./goals_and_metrics.md) · sources & formulas: in-app **About & Sources**.

---

## Project walkthrough (MAP → MODEL → MATCH)

1. Open the live site: **https://haic-mimir-1.vercel.app/**  
   Or watch: **https://youtu.be/LGWZ6OejGAw**
2. **MAP — Live Map**
   - County status cards update from live National Weather Service products
   - Toggle tsunami / flood / wildfire layers
   - Turn on **Tract AFN map** and click a tract for population + SVI details
   - Optional satellite basemap
3. **MODEL — Resource Planning**
   - Pick county, community, and hazard (example: Honolulu → ʻEwa Beach → Hurricane)
   - Review **Scenario comparison**, county-scale hazard cues, and **Population vulnerability (ACS)**
   - Check **CMIST** notes and **Estimated needs** (shelter, transport, power, language, water, meals, pets)
4. **MATCH — Coordinated response + Communication**
   - Review **Designated shelter / refuge inventory** (open status is not public / not confirmed here)
   - Scroll to **Coordinated response framework** — partners, “Matched to” gaps, decision points
   - Click **Download ESF-6 planning report** for a shareable text report
   - Open **Communication** — build an advisory, **Copy** it, and review priority languages for mass care
5. **About & Sources** — formulas, planning rates, and public data links

No login. No API keys required for the deployed demo.

---

## Run locally (optional)

**Requirements:** Node.js **20+** (Vite 7), npm

```bash
git clone https://github.com/TimothyT101/HAIC_mimir-1.git
cd HAIC_mimir-1/hdi-source
npm install
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

| Script | Purpose |
| :--- | :--- |
| `npm run dev` | Local development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run acs` | Optional ACS refresh (`CENSUS_API_KEY` in `.env.local` — see `.env.example`) |

Application source lives in **`hdi-source/`** (also the Vercel root directory).

---

## Stack & dependencies

- **React 19** + **Vite 7** + **Tailwind CSS 4**
- **Leaflet / react-leaflet** for maps
- **react-router-dom** for pages
- Hosted on **Vercel** (static frontend)

### External services used at runtime

| Service | Used for | Notes |
| :--- | :--- | :--- |
| `api.weather.gov` | Live Hawaiʻi alerts | Public; User-Agent set in app |
| OpenStreetMap / GIS tiles & layers | Basemap + hazard context | Public |
| Bundled ACS / SVI / emPOWER-derived JSON | AFN & resource estimates | De-identified aggregates only |

Optional: `VITE_AI_SUMMARY_URL` for a server summary — **not required**; demo works without it.

---

## Privacy & security (summary)

- **No PII**, no individual AFN registries, no DHS client data
- Uses **de-identified public aggregates** (ACS, CDC/ATSDR SVI, HHS emPOWER-style county counts, public shelter lists, public hazard GIS)
- Prototype badge + disclaimers: not an official alert channel
- Secrets: never commit `.env` / `.env.local` (see `.gitignore` and `hdi-source/.env.example`)

Full write-up: [`SECURITY_PRIVACY.md`](./SECURITY_PRIVACY.md)

---

## Known limitations (intentional)

- Shelter **capacities** are **sample planning placeholders** for shortfall demos — not live open-bed inventories (no statewide public beds API)
- **MODEL hazards** scoped to the challenge: hurricane, wildfire, tsunami, flood
- Medical AFN uses **electricity-dependent (emPOWER) proxies** + CMIST notes — not prescription/medication lists (would require PII)
- CMIST **Independence** and **Safety/Support** are primarily qualitative notes; Communication / Medical / Transportation have stronger numeric proxies
- NWS alert availability depends on the public API at review time

---

## Repo layout

```
HAIC_mimir-1/
├── README.md                 ← you are here (judge entry point)
├── goals_and_metrics.md      ← challenge metrics & criteria mapping
├── SECURITY_PRIVACY.md       ← submission-form security/privacy draft
├── .gitignore
└── hdi-source/               ← application (Vercel root)
    ├── README.md
    ├── package.json
    ├── public/               ← GeoJSON, hero, favicon
    ├── scripts/              ← optional ACS fetch
    └── src/                  ← React app (pages, data, calculator, partners)
```

---

## Deploy notes (maintainers)

Vercel project settings:

- **Production branch:** `main`
- **Root Directory:** `hdi-source`
- Keep **Deployment Protection off** so judges can open the URL without a Vercel login

---

## License / challenge use

Built for the **2026 Hawaiʻi Annual Innovation Challenge**. Planning prototype for educational / challenge evaluation use only.
