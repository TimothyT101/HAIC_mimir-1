import {
  BookOpen,
  Calculator,
  CheckCircle2,
  ExternalLink,
  Languages,
  Map,
  Shield,
} from "lucide-react";
import { Link } from "react-router-dom";
import DisclaimerBanner from "../components/DisclaimerBanner";
import { ACS_SOURCE } from "../data/acsIndicators";
import { AFN_TRACT_SOURCE } from "../data/afnTracts";
import {
  AVG_PETS_PER_PET_HOUSEHOLD,
  PERSONS_PER_HOUSEHOLD,
  PUBLIC_SOURCE_LINKS,
  SCENARIO_FACTORS,
  VISITOR_SHARE,
} from "../data/planningFactors";
import { SVI_SOURCE } from "../data/sviIndicators";
import { NWS_ALERTS_ENDPOINT, NWS_PUBLIC_URL } from "../services/nwsAlerts";

const SOURCE_GROUPS = [
  {
    id: "live",
    title: "Live alerts & maps",
    ids: ["nws", "nws-api", "osm", "esri", "hawaii-gis", "svi-tracts", "census-tracts"],
  },
  {
    id: "people",
    title: "Population & vulnerability",
    ids: ["acs", "svi", "empower", "pets"],
  },
  {
    id: "planning",
    title: "Shelter & mass-care planning factors",
    ids: ["hiema-shelter", "fema-evac", "ready-water", "ready-kit", "red-cross"],
  },
  {
    id: "shelters",
    title: "Shelter / refuge inventories",
    ids: [
      "opendata-shelters",
      "honolulu-shelter-list",
      "kauai-shelter-list",
      "honolulu-live-shelters",
      "honolulu-dem",
      "maui-ema",
      "hawaii-cd",
    ],
  },
];

const FORMULAS = [
  {
    name: "Estimated shelter need",
    expression:
      "round(pop × 0.85 × shelterRate) + round(pop × 0.15 × shelterRate)",
    note: "HIEMA ~15% visitor share; residents are the remaining 85%.",
  },
  {
    name: "Shelter shortfall",
    expression: "max(0, estimatedShelterNeed − sampleCapacity)",
    note: "Sample community capacity is not verified open beds.",
  },
  {
    name: "Transport assistance",
    expression: "round(residentShelter × ACS no-vehicle %) + visitorShelter",
    note: "Visitors are assumed to need transport help (HIEMA).",
  },
  {
    name: "Electricity backup cue",
    expression: "round(county emPOWER × placePop/countyPop × outageIntensity)",
    note: "Medicare DME county totals only — undercounts non-Medicare users.",
  },
  {
    name: "Communication support",
    expression: "round(estimatedShelterNeed × ACS limited-English %)",
    note: "Language-access contacts for people expected in public shelter.",
  },
  {
    name: "Water / meals",
    expression: "need × 1 gal × days · need × 3 meals × days",
    note: "Ready.gov water + mass-care meal practice.",
  },
  {
    name: "Pet support",
    expression: `round((pop ÷ ${PERSONS_PER_HOUSEHOLD}) × 0.39 × shelterRate × ${AVG_PETS_PER_PET_HOUSEHOLD})`,
    note: "Hawaiʻi Health Survey indoor companion-animal HH rate — not a pet registry.",
  },
  {
    name: "Hazard ∩ tract shelter cue",
    expression: "round(exposedTractPopulation × shelterRate)",
    note: "County-scale polygon proxy. No visitor split — different from the town MODEL above.",
  },
];

function SourceLink({ href, children }) {
  return (
    <a
      className="inline-flex items-center gap-1 font-medium text-forest underline-offset-2 hover:underline"
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      {children}
      <ExternalLink size={12} className="opacity-70" aria-hidden="true" />
    </a>
  );
}

function Card({ id, icon: Icon, title, children }) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-3xl border border-transparent bg-white p-5 shadow-sm dark:border-slate-800 dark:shadow-none sm:p-6"
    >
      <div className="flex items-start gap-3">
        {Icon ? (
          <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest-soft text-forest">
            <Icon size={18} />
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-semibold text-ink">{title}</h2>
          <div className="mt-3 space-y-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function AboutPage() {
  const sourcesById = Object.fromEntries(
    PUBLIC_SOURCE_LINKS.map((source) => [source.id, source])
  );
  const scenarios = Object.values(SCENARIO_FACTORS);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <header className="max-w-3xl">
        <h1 className="text-3xl font-bold text-forest dark:text-emerald-300">
          About & Sources
        </h1>
        <p className="mt-3 text-muted">
          Hawaiʻi Disaster Intelligence is a 2026 Hawaiʻi AI Challenge prototype for
          DHS Enhanced ESF-6 planning. It supports mass-care planning. It does not
          replace official alerts, evacuation orders, or county emergency operations
          plans.
        </p>
      </header>

      <DisclaimerBanner />

      <Card icon={Shield} title="HAIC challenge fit (MAP · MODEL · MATCH)">
        <p>
          Built against the DHS 2026 HAIC challenge: strengthen County-led ESF-6 mass
          care with State support — using only de-identified public data.
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            {
              label: "MAP",
              to: "/map",
              body: "Live NWS alerts, hazard overlays, shelter inventories, and tract AFN choropleths for all four counties (435 census tracts).",
            },
            {
              label: "MODEL",
              to: "/resource-planning",
              body: "Hazard scenarios (hurricane, wildfire, tsunami, flood) estimate shelter, water, meals, transport, backup power, language support, and pets — with CMIST notes from ACS + emPOWER.",
            },
            {
              label: "MATCH",
              to: "/resource-planning#coordination",
              body: "Partners matched to gaps with roles and decision points, plus trauma-informed multilingual Communication pathways.",
            },
          ].map((pillar) => (
            <Link
              key={pillar.label}
              to={pillar.to}
              className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-forest/30 hover:bg-forest-soft/40 dark:border-slate-700 dark:bg-slate-950/50 dark:hover:bg-slate-900"
            >
              <p className="text-sm font-bold tracking-wide text-forest">{pillar.label}</p>
              <p className="mt-2 text-xs leading-5 text-muted">{pillar.body}</p>
            </Link>
          ))}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            {
              title: "Actionable",
              body: "Cited rates and formulas Counties / DHS can review before an event.",
            },
            {
              title: "Usable",
              body: "Roles, decision points, Communication templates, and a downloadable planning report.",
            },
            {
              title: "Private",
              body: "ACS, SVI, and emPOWER aggregates only — no PII, no AFN registries.",
            },
            {
              title: "Equitable",
              body: "Every county and neighbor-island communities; LEP + ASL priority languages; immigrant-safety messaging.",
            },
            {
              title: "Sustainable",
              body: "Static web app on public APIs / GIS; ACS refresh script; optional AI summary only if configured.",
            },
            {
              title: "Scope & privacy",
              body: "Challenge scenarios are hurricane, wildfire, tsunami, and flood. No client lists or live shelter-bed APIs — gaps use sample planning capacity only when shown.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex gap-2 rounded-2xl border border-slate-100 px-3 py-2.5 dark:border-slate-700"
            >
              <CheckCircle2
                className="mt-0.5 shrink-0 text-forest"
                size={16}
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-semibold text-ink">{item.title}</p>
                <p className="text-xs leading-5 text-muted">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card icon={Calculator} title="Planning rates used across the site">
        <p>
          Resource Planning, reports, and the “What changed” strip all read these
          rates from one place (<code>planningFactors.js</code>). Changing a rate
          there changes the MODEL everywhere on the site.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-700">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-muted dark:bg-slate-950/70">
              <tr>
                <th className="px-3 py-2">Scenario</th>
                <th className="px-3 py-2">Shelter rate</th>
                <th className="px-3 py-2">Days</th>
                <th className="px-3 py-2">Outage intensity</th>
                <th className="px-3 py-2">Water / meals</th>
                <th className="px-3 py-2">Basis</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-slate-100 text-ink dark:border-slate-800"
                >
                  <td className="px-3 py-2.5 font-semibold">{row.label}</td>
                  <td className="px-3 py-2.5">
                    {Math.round(row.shelterRate * 1000) / 10}%
                  </td>
                  <td className="px-3 py-2.5">{row.days}</td>
                  <td className="px-3 py-2.5">{row.outageIntensity}</td>
                  <td className="px-3 py-2.5">
                    {row.waterGallonsPerPersonDay} gal · {row.mealPerPersonDay}{" "}
                    meals / person / day
                  </td>
                  <td className="max-w-xs px-3 py-2.5 text-muted">
                    {row.shelterRateSource.split(";")[0]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Visitor share is always{" "}
            <strong className="text-ink">{Math.round(VISITOR_SHARE * 100)}%</strong> of
            community population (HIEMA Dec 2017).
          </li>
          <li>
            Water = 1 gallon / person / day · Meals = 3 / person / day while sheltered.
          </li>
          <li>
            These are planning models — not operational forecasts or a registry of
            people.
          </li>
        </ul>
      </Card>

      <Card id="formulas" icon={BookOpen} title="Resource formulas">
        <p>
          Exact expressions used by the Resource Planning calculator. Hazard ∩ tract
          demand on that page uses a simpler county-scale formula (called out below).
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {FORMULAS.map((item) => (
            <article
              key={item.name}
              className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-950/50"
            >
              <p className="text-sm font-semibold text-ink">{item.name}</p>
              <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-xl bg-slate-900 px-3 py-2 font-mono text-[11px] leading-5 text-emerald-100">
                {item.expression}
              </pre>
              <p className="mt-2 text-xs text-muted">{item.note}</p>
            </article>
          ))}
        </div>
      </Card>

      <Card id="sources" icon={Shield} title="Data sources">
        <p>
          Every public dataset and planning document used by this prototype is linked
          below. Click through to the originating agency page or PDF.
        </p>
        <div className="space-y-5">
          {SOURCE_GROUPS.map((group) => (
            <div key={group.id}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
                {group.title}
              </h3>
              <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                {group.ids.map((id) => {
                  const source = sourcesById[id];
                  if (!source) return null;
                  return (
                    <li
                      key={id}
                      className="rounded-2xl border border-slate-100 p-3 dark:border-slate-700 dark:bg-slate-950/40"
                    >
                      <SourceLink href={source.url}>{source.label}</SourceLink>
                      <p className="mt-1 text-xs leading-5 text-muted">
                        {source.usedFor}
                        {id === "nws-api" ? (
                          <>
                            {" "}
                            (<code className="break-all text-[10px]">
                              {NWS_ALERTS_ENDPOINT}
                            </code>
                            )
                          </>
                        ) : null}
                        {id === "acs" ? (
                          <>
                            {" "}
                            ({ACS_SOURCE.name}, retrieved {ACS_SOURCE.retrievedAt}. Refresh
                            with <code>node scripts/fetch-acs.mjs</code>.)
                          </>
                        ) : null}
                        {id === "svi" ? (
                          <>
                            {" "}
                            ({SVI_SOURCE.name}, retrieved {SVI_SOURCE.retrievedAt}. Service:{" "}
                            <SourceLink href={SVI_SOURCE.url}>FeatureServer</SourceLink>.)
                          </>
                        ) : null}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        <p>
          Census ACS place and county tables require an activated Census Data API key in{" "}
          <code>.env.local</code> only. The key is never shipped to the browser.
        </p>
        <p>
          Designated shelter / refuge locations on Resource Planning come from public
          inventories (Open Data CSV 2019, Honolulu DEM FOI list, Kauaʻi KEMA list).
          Maui and Hawaiʻi Island currently use the Open Data CSV plus county hubs for
          announcements. Hawaiʻi does not publish a statewide open/closed shelter API —
          capacities stay blank unless a public source states them.
        </p>
      </Card>

      <Card icon={Map} title="What the numbers mean">
        <p>
          County and place ACS values are aggregates. They describe groups, not
          people. They must not be used to target individuals for rescue or to build a
          medical registry. CMIST notes are written from those percents.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          {ACS_SOURCE.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-950/50">
          <p className="font-semibold text-ink">Tract-level AFN mapping</p>
          <p className="mt-1">
            Live Map can color all {AFN_TRACT_SOURCE.tractCount} Hawaiʻi census tracts
            using {AFN_TRACT_SOURCE.name} ({AFN_TRACT_SOURCE.vintage}). Toggle “Show
            tract AFN choropleth” and choose a CMIST-related metric.{" "}
            {AFN_TRACT_SOURCE.note}
          </p>
          <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
            <SourceLink href={AFN_TRACT_SOURCE.csvUrl}>SVI CSV</SourceLink>
            <SourceLink href={AFN_TRACT_SOURCE.boundariesUrl}>
              Census tract boundaries
            </SourceLink>
            <SourceLink href={AFN_TRACT_SOURCE.documentationUrl}>SVI docs</SourceLink>
          </p>
        </div>
      </Card>

      <Card icon={Map} title="Live Map alerts">
        <p>
          Live Map county colors follow NWS severity at county scale: Fine/Minor
          (green), Moderate (yellow), Severe (red), Extreme (dark red). Town markers
          are locations only — most NWS products name a county or zone, not a single
          community. Hazard layers and tract AFN overlays are toggled on the map.
          ESF-6 needs modeling lives on Resource Planning (scenario dropdown), not as
          a second map mode.
        </p>
        <p>
          Alerts auto-refresh about every 3 minutes from{" "}
          <code>{NWS_ALERTS_ENDPOINT}</code>. Compare with{" "}
          <SourceLink href={NWS_PUBLIC_URL}>weather.gov/hfo</SourceLink>.
        </p>
      </Card>

      <Card icon={Calculator} title="Scenario differences and hazard ∩ tract demand">
        <p>
          On Resource Planning, the disaster-scenario dropdown only changes MODEL rates
          (shelter %, days, power intensity) for the selected community. ACS
          vulnerability cards stay the same. A “What changed” strip compares the
          current scenario to hurricane on the same town.
        </p>
        <p>
          A separate county panel estimates AFN demand for census tracts that intersect
          public hazard polygons (tsunami evacuation zones, DFIRM SFHA, fire risk
          areas). Hurricane is treated as countywide. That panel uses{" "}
          <code>exposedTractPopulation × shelterRate</code> only — it does{" "}
          <strong className="text-ink">not</strong> apply the 15% visitor split used in
          the town calculator. These are planning proxies from tract polygons — not
          parcel risk and not a registry of people.
        </p>
      </Card>

      <Card icon={Languages} title="Communication pathways">
        <p>
          The Communication page provides Hawaiʻi priority languages, a copyable
          language-access briefing, trusted-messenger channels, and English message
          templates for before / during / after a hazard.
          Templates are trauma-informed (lead with safety; affirm that seeking shelter is
          about safety) and must be localized by County language-access partners — this
          prototype does not machine-translate. Official alerts remain NWS / HIEMA /
          county products.
        </p>
      </Card>

      <Card icon={Shield} title="Coordination and AI">
        <p>
          The planning summary on the Resource Planning page is assembled from the
          selected community, scenario rates, and county ACS indicators. It is not
          labeled as AI unless a server-side endpoint is configured with{" "}
          <code>VITE_AI_SUMMARY_URL</code>. No API keys are stored in the frontend.
        </p>
      </Card>
    </div>
  );
}
