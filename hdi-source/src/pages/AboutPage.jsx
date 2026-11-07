import DisclaimerBanner from "../components/DisclaimerBanner";
import { ACS_SOURCE } from "../data/acsIndicators";
import { LEVEL_LIST } from "../data/classification";
import { NWS_ALERTS_ENDPOINT } from "../services/nwsAlerts";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6">
      <header>
        <h1 className="text-3xl font-bold text-forest">About & Sources</h1>
        <p className="mt-3 text-muted">
          Hawaiʻi Disaster Intelligence is a 2026 Hawaiʻi AI Challenge prototype for
          DHS Enhanced ESF-6 planning. It supports mass-care planning. It does not
          replace official alerts, evacuation orders, or county emergency operations
          plans.
        </p>
      </header>

      <DisclaimerBanner />

      <Section id="sources" title="Data sources">
        <ul>
          <li>
            Live alerts: National Weather Service active alert API ({NWS_ALERTS_ENDPOINT}).
            Refresh every 3 minutes. Follow official products if they disagree with this site.
          </li>
          <li>
            County and Census place/CDP population and CMIST proxy indicators:{" "}
            {ACS_SOURCE.name}, retrieved {ACS_SOURCE.retrievedAt}. Includes households
            with no vehicle (DP04_0058PE). Refresh: <code>node scripts/fetch-acs.mjs</code>.
            API: {ACS_SOURCE.url}
          </li>
          <li>
            Map tiles: OpenStreetMap and Esri World Imagery. Community coordinates are
            real; provisional disaster levels remain demonstration values.
          </li>
          <li>
            Designated shelter locations are public civic facilities used for planning.
            Hawaiʻi does not publish a standing open/closed shelter API. Counties
            announce openings during events (Honolulu: honolulu.gov/dem and
            p.veoci.com/hnlshelter). An older statewide school list is on
            opendata.hawaii.gov (last updated 2019) and is not operational status.
          </li>
          <li>
            Hazard GIS: Hawaiʻi Statewide GIS on geodata.hawaii.gov. Tsunami
            evacuation is layer 11. Flood hazard uses county DFIRM layers (FEMA
            flood zones hosted by the State). Wildfire risk uses Fire Risk Areas
            (layer 7). Layers can be toggled on the Live Map.
          </li>
          <li>
            CDC/ATSDR Social Vulnerability Index 2022 county percentiles (U.S.
            ranking) are shown on Resource Planning. They are county-scale, not
            tract-scale, in this prototype.
          </li>
          <li>
            Census ACS place and county tables require an activated Census Data
            API key in <code>.env.local</code> only. The key is never shipped to
            the browser. Run <code>node scripts/fetch-acs.mjs</code> to refresh
            <code>src/data/acs2023.json</code>.
          </li>
        </ul>
      </Section>

      <Section title="What the numbers mean">
        <p>
          County and place ACS values are aggregates. They describe groups, not
          people. They must not be used to target individuals for rescue or to
          build a medical registry. CMIST notes are written from those percents.
        </p>
        <ul>
          {ACS_SOURCE.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </Section>

      <Section title="Disaster classification">
        <p>
          Live Map county colors follow NWS severity at county scale: Fine/Minor
          (green), Moderate (yellow), Severe (red), Extreme (dark red). Town markers
          stay uncolored because most NWS products name a county or zone, not a
          single community. Planning scenario still uses the demonstration 1–5
          overlay. Nearby towns are not automatically elevated.
        </p>
        <ul>
          {LEVEL_LIST.map((level) => (
            <li key={level.key}>
              <strong>{level.fullLabel}.</strong> {level.description}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Resource formulas">
        <pre className="overflow-x-auto rounded-2xl bg-slate-900 p-4 text-xs text-emerald-100">
{`estimatedShelterNeed = round(population × scenarioShelterRate)
shelterShortfall     = max(0, need − sampleCapacity)  [sample, not verified open beds]
transportAssist      = round(need × max(transportRate, noVehicleShare))
electricityBackup    = round(population × backupRate)
communicationSupport = round(need × max(communicationRate, LEP share))
waterGallons         = need × 1 × days
meals                = need × mealsPerPersonDay × days`}
        </pre>
      </Section>

      <Section title="Coordination and AI">
        <p>
          The planning summary on the Resource Planning page is assembled from the
          selected community, scenario rates, and county ACS indicators. It is not
          labeled as AI unless a server-side endpoint is configured with
          VITE_AI_SUMMARY_URL. No API keys are stored in the frontend.
        </p>
      </Section>
    </div>
  );
}

function Section({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-24 space-y-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="space-y-3 text-sm leading-6 text-slate-700 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1">
        {children}
      </div>
    </section>
  );
}
