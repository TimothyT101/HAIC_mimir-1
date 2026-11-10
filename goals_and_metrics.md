# Goals & Metrics: Hawaiʻi Disaster Intelligence (HAIC 2026)

Aligned to the DHS challenge **Enhancing ESF-6 Planning Through AI-Supported Insights**
and pitch evaluation: **Actionable · Usable · Private · Equitable · Sustainable**.

## Challenge pillars (MAP · MODEL · MATCH)

| Pillar | Deliverable in this prototype |
| :--- | :--- |
| **MAP** | Live Map with NWS alerts, tsunami/flood/wildfire overlays, town markers, shelter inventories, and tract AFN choropleths for **all 4 counties / 435 census tracts**. |
| **MODEL** | Resource Planning scenarios (hurricane, wildfire, tsunami, flood) estimating shelter, water, meals, transport, backup power, language support, and pets — plus CMIST notes from ACS + emPOWER. |
| **MATCH** | Partner matching with roles and decision points; downloadable ESF-6 planning report; Communication pathways (priority languages + copyable briefing + trauma-informed templates). |

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

## Scope notes (intentional — not missing rubric items)

- **Challenge MODEL hazards** (pitch): hurricane, wildfire, tsunami, flood. Earthquake is context, not a required scenario.
- **Medication / client medical lists** would need PII — out of scope; Medical CMIST uses disability % + de-identified emPOWER power-dependent DME shares.
- **Live shelter open/closed beds**: Hawaiʻi has no statewide public API; capacities in the app are **sample planning placeholders** for shortfall demos, clearly labeled. Mapping designated facilities from public lists is what the challenge asks for.
- High-rise / off-grid appear as planning/comms considerations (pitch “It’s complicated”), not separate required models.
