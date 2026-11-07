import DisclaimerBanner from "../components/DisclaimerBanner";
import { ACS_SOURCE } from "../data/acsIndicators";
import { LEVEL_LIST } from "../data/classification";
import {
  PUBLIC_SOURCE_LINKS,
} from "../data/planningFactors";
import { SVI_SOURCE } from "../data/sviIndicators";
import { NWS_ALERTS_ENDPOINT } from "../services/nwsAlerts";

function SourceLink({ href, children }) {
  return (
    <a className="text-forest hover:underline" href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

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
        <p>
          Every public dataset and planning document used by this prototype is linked
          below. Click through to the originating agency page or PDF.
        </p>
        <ul>
          {PUBLIC_SOURCE_LINKS.map((source) => (
            <li key={source.id}>
              <SourceLink href={source.url}>{source.label}</SourceLink>
              {" — "}
              {source.usedFor}
              {source.id === "nws" ? (
                <>
                  {" "}
                  (endpoint <code>{NWS_ALERTS_ENDPOINT}</code>)
                </>
              ) : null}
              {source.id === "acs" ? (
                <>
                  {" "}
                  ({ACS_SOURCE.name}, retrieved {ACS_SOURCE.retrievedAt}. Refresh with{" "}
                  <code>node scripts/fetch-acs.mjs</code>.)
                </>
              ) : null}
              {source.id === "svi" ? (
                <>
                  {" "}
                  ({SVI_SOURCE.name}, retrieved {SVI_SOURCE.retrievedAt}. Service:{" "}
                  <SourceLink href={SVI_SOURCE.url}>FeatureServer</SourceLink>.)
                </>
              ) : null}
            </li>
          ))}
        </ul>
        <p>
          Census ACS place and county tables require an activated Census Data API key in{" "}
          <code>.env.local</code> only. The key is never shipped to the browser.
        </p>
        <p>
          Designated shelter locations are public civic facilities used for planning.
          Hawaiʻi does not publish a standing open/closed shelter API. Counties announce
          openings during events. An older statewide school list on Open Data (2019) is
          not operational status.
        </p>
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
        <p>
          Planning rates are documented in code (<code>planningFactors.js</code>).
          Prefer Hawaiʻi / federal public sources over invented percentages.
        </p>
        <pre className="overflow-x-auto rounded-2xl bg-slate-900 p-4 text-xs text-emerald-100">
{`estimatedShelterNeed = residentShelter + visitorShelter
  residentShelter = round(pop × 0.85 × shelterRate)
  visitorShelter  = round(pop × 0.15 × shelterRate)   // HIEMA visitor share
shelterRate (hurricane) = 0.35   // HIEMA 2017 / USACE 2009 survey
shelterRate (other)     = 0.10–0.125 // FEMA 10–15% rule of thumb proxy
shelterShortfall = max(0, need − sampleCapacity)  // sample, not verified beds
transportAssist  = round(residentShelter × ACS no-vehicle) + visitorShelter
electricityBackup = round(county emPOWER × placePop/countyPop × outageIntensity)
communicationSupport = round(need × ACS limited-English share)
waterGallons = need × 1 × days          // Ready.gov / CDC
meals        = need × 3 × days          // mass-care practice
petSupport   = round((pop÷2.92) × 0.39 × shelterRate × 1.7)
  // Hawaiʻi Health Survey indoor companion-animal HH rate; not a registry`}
        </pre>
        <p className="font-semibold text-ink">Formula source links</p>
        <ul>
          {PUBLIC_SOURCE_LINKS.filter((source) =>
            ["hiema-shelter", "fema-evac", "empower", "pets", "ready-water", "ready-kit", "red-cross", "acs"].includes(
              source.id
            )
          ).map((source) => (
            <li key={source.id}>
              <SourceLink href={source.url}>{source.label}</SourceLink>
              {" — "}
              {source.usedFor}
            </li>
          ))}
        </ul>
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
