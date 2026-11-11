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
    note: "Sample planning capacity only — not a verified live open-bed count.",
  },
  {
    name: "Transport assistance",
    expression: "round(residentShelter × ACS no-vehicle %) + visitorShelter",
    note: "Residents without a vehicle plus visitors who may need a ride (HIEMA).",
  },
  {
    name: "Electricity backup cue",
    expression: "round(county emPOWER × placePop/countyPop × outageIntensity)",
    note: "Public county counts of electricity-dependent medical equipment (Medicare) — not a patient or medicine list.",
  },
  {
    name: "Communication support",
    expression: "round(estimatedShelterNeed × ACS limited-English %)",
    note: "Language-access planning for people expected in public shelter.",
  },
  {
    name: "Water / meals",
    expression: "need × 1 gal × days · need × 3 meals × days",
    note: "Ready.gov water guidance and common mass-care meal practice.",
  },
  {
    name: "Pet support",
    expression: `round((pop ÷ ${PERSONS_PER_HOUSEHOLD}) × 0.39 × shelterRate × ${AVG_PETS_PER_PET_HOUSEHOLD})`,
    note: "Hawaiʻi Health Survey indoor pet household rate — not a pet owner registry.",
  },
  {
    name: "Hazard ∩ tract shelter cue",
    expression: "round(exposedTractPopulation × shelterRate)",
    note: "County-scale estimate for tracts overlapping hazard areas. Does not add the visitor share used in the town calculator.",
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
          Hawaiʻi Disaster Intelligence is a 2026 Hawaiʻi AI Challenge prototype to help
          Counties and State ESF-6 plan mass care for people with Access and Functional
          Needs. It is a planning aid only — not an official alert system, evacuation
          order, or replacement for county emergency plans.
        </p>
      </header>

      <DisclaimerBanner />

      <Card icon={Shield} title="How this meets the HAIC challenge (MAP · MODEL · MATCH)">
        <p>
          Built for the DHS 2026 challenge: help Counties lead mass care, with State
          ESF-6 support, using public community-level data — never personal case files.
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            {
              label: "MAP",
              to: "/map",
              body: "See live weather alerts, hazard areas, shelters, and neighborhood vulnerability across all four counties (435 census tracts).",
            },
            {
              label: "MODEL",
              to: "/resource-planning",
              body: "For hurricane, wildfire, tsunami, or flood, estimate shelter, water, meals, rides, backup power, language support, and pets — plus CMIST notes for Access and Functional Needs.",
            },
            {
              label: "MATCH",
              to: "/resource-planning#coordination",
              body: "Match estimated gaps to agencies and partners with clear roles and decision points, download a planning report, and draft public messages on Communication.",
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
              body: "Planning rates and formulas are cited so Counties and DHS can review them before an event.",
            },
            {
              title: "Usable",
              body: "Clear partner roles, decision points, message drafts, and a downloadable ESF-6 planning report.",
            },
            {
              title: "Private",
              body: "We do not use personal data — only openly published community statistics and maps. No names, addresses, or private case files.",
            },
            {
              title: "Equitable",
              body: "All islands and rural communities; priority languages including ASL; messaging that seeking shelter is safe.",
            },
            {
              title: "Sustainable",
              body: "Built as a simple website on public data and clear formulas, so Counties and partners can keep using it after the challenge.",
            },
            {
              title: "Scope",
              body: "Planning scenarios covered: hurricane, wildfire, tsunami, and flood — across Hawaiʻi’s counties and communities.",
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
          Resource Planning, the downloadable report, and the scenario comparison all
          use the same published rates below — so the MODEL stays consistent across
          the site.
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
          Exact math behind the Resource Planning calculator. A separate county-scale
          “hazard ∩ tract” estimate on that page uses the simpler formula noted at the
          bottom of this list.
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
          Every public dataset and planning document used here is linked below. Open
          any link to see the original agency page or PDF.
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
          Updating Census tables for developers needs a free Census key stored only on
          the builder’s computer — never in the public website. The live site already
          includes the downloaded community statistics, so visitors do not need a key.
        </p>
        <p>
          Shelter and refuge locations come from public county and state lists (Open
          Data inventory last updated Dec 2019, Honolulu DEM list, Kauaʻi KEMA list).
          Maui and Hawaiʻi Island also point to county emergency hubs for announcements.
          Because there is no statewide live “beds open right now” feed, capacity
          numbers in this prototype are planning samples when shown — not verified
          open-bed counts.
        </p>
      </Card>

      <Card icon={Map} title="What the numbers mean">
        <p>
          Numbers describe communities as a whole — not named people. They must not be
          used to target individuals for rescue or to build a personal medical list.
          CMIST notes are plain-language planning cues written from those group
          percentages. We also do not invent prescription or medicine counts; medical
          planning uses public power-dependent equipment estimates and CMIST notes
          only.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          {ACS_SOURCE.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-950/50">
          <p className="font-semibold text-ink">Neighborhood vulnerability on the map</p>
          <p className="mt-1">
            Live Map can color all {AFN_TRACT_SOURCE.tractCount} Hawaiʻi census tracts
            using {AFN_TRACT_SOURCE.name} ({AFN_TRACT_SOURCE.vintage}). Turn on Tract
            AFN map and pick a metric such as overall vulnerability, disability, or
            limited English. Some tracts show Unknown or very small populations when
            Census/SVI data is sparse (for example special land-use areas) — that is
            the source data, not a missing feature. {AFN_TRACT_SOURCE.note}
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
          County colors follow National Weather Service severity: Fine/Minor (green),
          Moderate (yellow), Severe (red), Extreme (dark red). Green town markers are
          place locations — most official alerts name a county or forecast zone, not
          one neighborhood. Use the map toggles for tsunami, flood, wildfire, and
          tract vulnerability. Detailed ESF-6 needs estimates are on Resource Planning.
        </p>
        <p>
          Alerts refresh about every 3 minutes from the public NWS Hawaiʻi feed (
          <code className="break-all text-[11px]">{NWS_ALERTS_ENDPOINT}</code>
          ). Always cross-check{" "}
          <SourceLink href={NWS_PUBLIC_URL}>weather.gov/hfo</SourceLink>.
        </p>
      </Card>

      <Card icon={Calculator} title="Scenarios and hazard-area demand">
        <p>
          On Resource Planning, changing the hazard only changes planning rates
          (how many may need shelter, how many days, power stress) for the selected
          town. Community vulnerability cards stay the same. Expand scenario comparison
          to see hurricane, wildfire, tsunami, and flood side by side for that town.
        </p>
        <p>
          A separate county section estimates demand for census tracts that overlap
          published hazard areas (tsunami evacuation zones, flood hazard areas, fire
          risk). Hurricane is treated as countywide. That estimate uses exposed tract
          population × shelter rate only — it does{" "}
          <strong className="text-ink">not</strong> add the 15% visitor share used in
          the town calculator. These are planning proxies, not parcel-by-parcel risk
          and not a list of people.
        </p>
      </Card>

      <Card icon={Languages} title="Communication pathways">
        <p>
          Communication builds a copy-ready English advisory: choose a town, optionally
          pick a designated shelter, keep Hawaiʻi’s priority languages for mass care in
          view, and copy a calm, trauma-informed message. County public information
          officers still approve anything released to the public; trusted partners
          localize — this site does not auto-translate. Official alerts remain NWS,
          HIEMA, and county products.
        </p>
      </Card>

      <Card icon={Shield} title="Reports and AI">
        <p>
          The Resource Planning summary and downloadable report are built from your
          selected town, hazard rates, and public community statistics — clear formulas,
          not a black-box model. The site does not call an AI service unless a separate
          secure server address is configured later. No secret keys are stored in the
          public website.
        </p>
      </Card>
    </div>
  );
}
