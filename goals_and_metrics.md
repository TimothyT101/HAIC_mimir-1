# Goals & Metrics: Hawaiʻi Disaster Intelligence (HAIC 2026)

Aligned to the DHS challenge **Enhancing ESF-6 Planning Through AI-Supported Insights**
and pitch evaluation: **Actionable · Usable · Private · Equitable · Sustainable**.

## Challenge pillars (MAP · MODEL · MATCH)

| Pillar | Deliverable in this prototype |
| :--- | :--- |
| **MAP** | Live Map with NWS alerts, tsunami/flood/wildfire overlays, town markers, shelter inventories, and tract AFN choropleths for **all 4 counties / 435 census tracts**. |
| **MODEL** | Resource Planning scenarios (hurricane, wildfire, tsunami, flood) estimating shelter, water, meals, transport, backup power, language support, and pets — plus CMIST notes from ACS + emPOWER. |
| **MATCH** | Partner matching with roles and decision points; downloadable ESF-6 planning report; Communication pathways (multilingual checklist + trauma-informed templates). |

## Evaluation criteria

| Criterion | How this prototype meets it |
| :--- | :--- |
| **Actionable** | Cited HIEMA / FEMA / Ready.gov / ACS / emPOWER rates; formulas shown on Resource Planning and About. |
| **Usable** | County-first roles, decision points, Communication templates, report download. |
| **Private** | De-identified public aggregates only — no PII, no AFN registries, no DHS client data. |
| **Equitable** | Every county + neighbor-island communities; LEP languages + ASL; immigrant-safety messaging. |
| **Sustainable** | Static Vite app on public APIs/GIS; ACS refresh script; optional AI summary only if `VITE_AI_SUMMARY_URL` is set. |

## Measurable goals (Section 7)

| Goal | Target | Prototype status |
| :--- | :--- | :--- |
| Hazard-specific AFN maps for all counties | 100% of census tracts | **435 / 435** tracts in map GeoJSON + AFN attributes |
| Needs estimates across CMIST | Reasonable for County / DHS review | Shelter, transport, power, language, meals, water, pets + CMIST text from ACS/emPOWER |
| Faster coordinated plan | Minutes/seconds vs manual recompilation | Report + MATCH partners generate in-browser in seconds |

## Honest limits (called out for judges)

- **Medication counts** are not quantified (CMIST Medical uses disability % + emPOWER electricity-dependent DME shares).
- **Earthquake** is not a Resource Planning scenario (pitch notes little-notice hazards; we model wildfire/tsunami/flood/hurricane).
- **High-rise elevators / off-grid** appear in community notes and partner decision points, not as separate quantitative models.
- Shelter capacities are **sample / planning** values — not live open-bed status.
