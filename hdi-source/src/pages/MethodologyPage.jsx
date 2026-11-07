import DisclaimerBanner from "../components/DisclaimerBanner";
import { LEVEL_LIST } from "../data/classification";
import { NWS_ALERTS_ENDPOINT } from "../services/nwsAlerts";

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6">
      <header>
        <h1 className="text-3xl font-bold text-forest">Methodology</h1>
        <p className="mt-3 text-muted">
          This page explains how the Hawaiʻi Disaster Intelligence prototype works
          in plain language. It is a planning aid for HAIC Challenge 2 (ESF-6), not
          an official emergency system.
        </p>
      </header>

      <Section title="Official data sources">
        <p>
          <strong>Live conditions</strong> pulls official National Weather Service
          products. <strong>Planning scenario</strong> uses labeled exercise cards in{" "}
          <code>src/data</code> so judges can practice ESF-6 workflows without mistaking
          samples for live alerts. The architecture is also ready for:
        </p>
        <ul>
          <li>National Weather Service alerts: {NWS_ALERTS_ENDPOINT}</li>
          <li>Pacific Tsunami Warning Center public products</li>
          <li>HIEMA and county emergency management notices</li>
          <li>U.S. Census ACS tables for age, disability, language, and vehicles</li>
          <li>County shelter inventories and transit accessibility datasets</li>
        </ul>
      </Section>

      <Section title="Disaster classification methodology">
        <p>
          Live Map colors the four counties from official NWS severity (Fine/Minor,
          Moderate, Severe, Extreme). Town markers stay as locations. Planning
          scenario uses exercise-only community levels — never live warnings. Nearby
          towns are not automatically raised because they are near an exercise card.
        </p>
        <ul>
          {LEVEL_LIST.map((level) => (
            <li key={level.key}>
              <strong>{level.fullLabel}.</strong> {level.description}
            </li>
          ))}
        </ul>
        <p>
          Exercise levels are assigned in static planning data. Later, documented
          thresholds (for example, official warning type, inundation overlap, or
          shelter demand) can replace the static <code>provisionalLevel</code> field.
        </p>
      </Section>

      <Section title="Population vulnerability calculations">
        <p>
          Indicators follow DHS Access and Functional Needs guidance using CMIST:
          Communication, Medical, Independence, Safety and Support, and
          Transportation. Values are sample percentages and counts, never named
          individuals. Swap in ACS estimates and agency aggregates without changing
          the dashboard layout.
        </p>
      </Section>

      <Section title="Resource estimation formulas">
        <pre className="overflow-x-auto rounded-2xl bg-slate-900 p-4 text-xs text-emerald-100">
{`estimatedShelterNeed = round(population × shelterRate)
shelterShortfall     = max(0, estimatedShelterNeed − availableCapacity)
transportAssist      = round(estimatedShelterNeed × max(transportRate, noVehiclePct))
electricityBackup    = round(max(sampleMedicalDevices, population × backupRate))
waterGallons         = estimatedShelterNeed × 1 × days
meals                = estimatedShelterNeed × mealsPerPersonDay × days`}
        </pre>
        <p className="mt-3">
          Shelter rates vary by disaster type and are listed on the Resource
          Planning page. They are planning assumptions, not observed demand.
        </p>
      </Section>

      <Section title="Assumptions and limitations">
        <ul>
          <li>Planning-mode cards and calculations are labeled as exercise data.</li>
          <li>Coordinates are real; planning classifications are exercise samples, not live status.</li>
          <li>The site does not issue evacuation orders or replace county EOPs.</li>
          <li>Unknown is used when public data are missing or unverified.</li>
        </ul>
      </Section>

      <Section title="Data update frequency">
        <p>
          Exercise-card timestamps are static. Live NWS alerts refresh from the
          official feed; Census vulnerability indicators update with each ACS release.
        </p>
      </Section>

      <Section title="Official alerts versus planning classifications">
        <p>
          Official alerts are the products of NWS, PTWC, HIEMA, and county agencies.
          Planning classifications are an exercise overlay only. If they disagree,
          follow the official product. Switch to <strong>Live conditions</strong> for
          real alerts.
        </p>
      </Section>

      <Section title="Planned AI integration">
        <p>
          The Generate Planning Report button fills a predefined template from the
          calculator. It is not AI-generated. A future model can sit behind
          <code> src/lib/reportGenerator.js</code> to summarize verified inputs after
          a human review step.
        </p>
      </Section>

      <Section title="Future expansion">
        <ul>
          <li>Connect the NWS GeoJSON alert feed</li>
          <li>Replace sample ACS indicators with live Census API queries</li>
          <li>Add official tsunami evacuation polygons</li>
          <li>Role-based access for planners without publishing personal AFN lists</li>
        </ul>
      </Section>

      <DisclaimerBanner />
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="space-y-3 text-sm leading-6 text-slate-700 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1">
        {children}
      </div>
    </section>
  );
}
