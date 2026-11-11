# Hawaiʻi Disaster Intelligence — application source

This folder is the **Vite + React** app. For the full HAIC judge guide (live URL, MAP·MODEL·MATCH, privacy, limitations), see the **[repository root README](../README.md)**.

**Live demo:** https://haic-mimir-1.vercel.app/

## Local development

```bash
# from repo root
cd hdi-source
npm install
npm run dev
```

Requires **Node.js 20+**.

| Script | Description |
| :--- | :--- |
| `npm run dev` | Dev server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Serve the production build |
| `npm run acs` | Optional ACS data refresh |

## Configuration

Copy `.env.example` to `.env.local` only if you need optional tooling:

- `CENSUS_API_KEY` — for `npm run acs` (never commit the key)
- `VITE_AI_SUMMARY_URL` — optional; app runs without it

## Vercel

- **Root Directory:** `hdi-source`
- **Production Branch:** `main`
