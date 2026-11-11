# Hawaiʻi Disaster Intelligence (HDI)

**HAIC 2026** · DHS challenge: *Enhancing ESF-6 Planning Through AI-Supported Insights*  
**Category:** AI-Developed Planning and Improvement Challenge (coded prototype)  
**HAIC registered team name:** Mimir  
**Project / product name:** Hawaiʻi Disaster Intelligence (HDI)  
**Repository:** https://github.com/TimothyT101/HAIC_mimir-1  
**Live demo (judges):** https://haic-mimir-1.vercel.app/

> **Not an official emergency warning system.** Always follow NWS, HIEMA, and County emergency management.

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

## Quick start for judges (preferred)

1. Open the live site: **https://haic-mimir-1.vercel.app/**
2. Suggested walkthrough (MAP → MODEL → MATCH):
   - **Live Map** — pick a county; toggle AFN tracts / hazards / shelters
   - **Resource Planning** — pick county, community, hazard → review estimates & **CMIST**
   - Scroll to **Coordinated response framework** — partners, “Matched to,” decision points
   - Click **Download ESF-6 planning report**
   - **Communication** — build a copy-ready advisory (languages included)

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
