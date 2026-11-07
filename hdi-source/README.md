# Hawaiʻi Disaster Intelligence

Prototype dashboard for the 2026 Hawaiʻi Annual Innovation Challenge (Challenge 2: ESF-6 planning). **Not an official emergency warning system.**

## Run locally

```bash
cd hdi-source
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

## Vercel

This app lives in `hdi-source`. In Vercel Project Settings set:

- **Production Branch:** `main`
- **Root Directory:** `hdi-source`

Do not use branch `cursor/hawaii-disaster-intelligence` for production. That branch is an older snapshot of the app at the repo root, which is why preview failed with “Root Directory hdi-source does not exist.”

## Scripts

- `npm run dev` — local development server
- `npm run build` — production build
- `npm run preview` — preview the production build
