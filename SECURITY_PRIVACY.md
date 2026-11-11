# Security & Privacy Description

**For the HAIC Project Submission Form** (limit 300 words). Copy or adapt the text below.

---

Hawaiʻi Disaster Intelligence is a public planning prototype for HAIC 2026. It is designed around de-identified data and does not collect, store, or display personally identifiable information.

**Data.** The app uses only public or de-identified aggregates: U.S. Census ACS place/county indicators, CDC/ATSDR Social Vulnerability Index tract metrics, HHS emPOWER-style county counts of electricity-dependent Medicare beneficiaries, public shelter/refuge lists, and public hazard GIS (tsunami, flood, wildfire). It does not ingest DHS client files, Med-QUEST records, partner client lists, or voluntary individual AFN registries. Out of scope by design: individual-level tracking and any workflow that would require HIPAA-covered or human-services confidential data.

**Application security.** The production build is a static front-end hosted on Vercel with HTTPS. There is no user authentication, no account database, and no server-side storage of resident data in this prototype. Optional environment variables (for example a Census API key used only by an offline refresh script, or an optional AI summary endpoint) are kept out of the GitHub repository via `.gitignore`; secrets are never committed. Live National Weather Service alerts are requested from the public `api.weather.gov` API.

**Operational privacy & safety.** On-screen disclaimers and a Prototype badge state that the site is not an official emergency warning system and must not replace NWS, HIEMA, or County alerting or EOPs. Communication drafts are labeled as planning drafts requiring County PIO approval. Resource estimates and shelter capacities are planning aids, including clearly labeled sample capacity values where live bed inventories are unavailable.

**Equity without exposure.** Language-access and immigrant-safety messaging support inclusive outreach without collecting language preferences or immigration status.
