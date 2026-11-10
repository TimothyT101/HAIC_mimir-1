import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Bus,
  ClipboardList,
  HeartPulse,
  MessageCircle,
  Shield,
  Users,
} from "lucide-react";
import DisclaimerBanner from "../components/DisclaimerBanner";
import { ACS_SOURCE, getCountyAcs, getPlaceAcs } from "../data/acsIndicators";
import { SVI_SOURCE, formatSviPercentile, getCountySvi } from "../data/sviIndicators";
import { cmistFromAcs } from "../lib/cmistFromAcs";
import { COMMUNITIES, communitiesByCounty, getCommunity } from "../data/communities";
import { COUNTIES } from "../data/counties";
import { matchPartners } from "../data/partners";
import {
  estimateExposedShelterNeed,
  HAZARD_EXPOSURE_SOURCE,
} from "../data/hazardTractExposure";
import { SHELTER_DATASET, sheltersForCounty } from "../data/shelters";
import { formatNumber, formatPercent } from "../lib/format";
import { buildPlanningSummary } from "../lib/planningSummary";
import { buildPlanningReport, downloadReport } from "../lib/reportGenerator";
import { calculateResources, DISASTER_TYPES } from "../lib/resourceCalculator";
import { buildScenarioCompare } from "../lib/scenarioCompare";
import { maybeAiSummary } from "../services/aiSummary";

const CMIST = [
  { key: "communication", label: "Communication", icon: MessageCircle },
  { key: "medical", label: "Medical", icon: HeartPulse },
  { key: "independence", label: "Independence", icon: Users },
  { key: "safety", label: "Safety and Support", icon: Shield },
  { key: "transportation", label: "Transportation", icon: Bus },
];

export default function ResourcePlanningPage() {
  const [params] = useSearchParams();
  const [countyId, setCountyId] = useState(params.get("county") || "honolulu");
  const [communityId, setCommunityId] = useState(params.get("community") || "ewa-beach");
  const [disasterTypeId, setDisasterTypeId] = useState("hurricane");
  const [reportPreview, setReportPreview] = useState(null);
  const [aiNote, setAiNote] = useState(null);

  const countyCommunities = communitiesByCounty(countyId);
  const community = getCommunity(communityId) ?? countyCommunities[0];
  const acs = getCountyAcs(countyId);
  const placeAcs = getPlaceAcs(community?.id);
  const svi = getCountySvi(countyId);
  const cmist = cmistFromAcs(placeAcs, community?.name, countyId);
  const shelters = sheltersForCounty(countyId);

  const assessment = useMemo(() => {
    if (!community) return null;
    return calculateResources({ community, disasterTypeId });
  }, [community, disasterTypeId]);

  const scenarioCompare = useMemo(() => {
    if (!community) return null;
    return buildScenarioCompare({ community, disasterTypeId });
  }, [community, disasterTypeId]);

  const hazardExposure = useMemo(
    () => estimateExposedShelterNeed(countyId, disasterTypeId),
    [countyId, disasterTypeId]
  );

  const summary = useMemo(() => {
    if (!community || !assessment) return null;
    return buildPlanningSummary({ community, assessment });
  }, [community, assessment]);

  const partners = useMemo(() => {
    if (!assessment) return [];
    return matchPartners({ assessment, disasterTypeId });
  }, [assessment, disasterTypeId]);

  function handleCounty(id) {
    setCountyId(id);
    const next = communitiesByCounty(id)[0];
    setCommunityId(next?.id);
  }

  async function handleGenerate() {
    const report = buildPlanningReport({ community, assessment });
    report.summary = summary?.text;
    setReportPreview(report);
    downloadReport(report);
    try {
      const ai = await maybeAiSummary({ community, assessment, summary });
      setAiNote(
        ai.aiGenerated
          ? "An optional server summary is configured."
          : "No AI endpoint is configured. This summary is deterministic."
      );
    } catch (error) {
      setAiNote(error.message);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-3xl font-bold text-forest dark:text-emerald-300">
          Resource Planning
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          County, community, and hazard scenario for ESF-6 planning. Town
          population, vehicles, disability, and language shares are Census ACS
          place/CDP tables. Shelter open status is not confirmed. Formulas are
          shown with the results.
        </p>
      </div>
      <DisclaimerBanner compact />

      <section className="rounded-3xl border border-transparent bg-white p-5 shadow-sm dark:border-slate-800 dark:shadow-none">
        <h2 className="font-semibold text-ink">Scenario inputs</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="text-sm">
            <span className="mb-1 block text-muted">County</span>
            <select
              value={countyId}
              onChange={(event) => handleCounty(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-ink dark:border-slate-600 dark:bg-slate-950"
            >
              {COUNTIES.map((county) => (
                <option key={county.id} value={county.id}>
                  {county.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-muted">Community</span>
            <select
              value={community?.id}
              onChange={(event) => setCommunityId(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-ink dark:border-slate-600 dark:bg-slate-950"
            >
              {countyCommunities.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-muted">Disaster scenario</span>
            <select
              value={disasterTypeId}
              onChange={(event) => setDisasterTypeId(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-ink dark:border-slate-600 dark:bg-slate-950"
            >
              {DISASTER_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {assessment ? (
          <p className="mt-3 text-sm text-slate-700">{assessment.rates.exposure}</p>
        ) : null}
      </section>

      {scenarioCompare ? (
        <section
          id="what-changed"
          className="scroll-mt-24 rounded-3xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm dark:border-amber-800/60 dark:shadow-none"
        >
          <h2 className="text-xl font-semibold text-amber-950 dark:text-amber-100">
            What changed for {scenarioCompare.currentLabel}
          </h2>
          <p className="mt-1 text-sm text-amber-900/90 dark:text-amber-200/90">
            Switching the disaster scenario only changes MODEL rates for{" "}
            {scenarioCompare.communityName}. {scenarioCompare.unchangedNote}
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-amber-950 dark:text-amber-100">
            {scenarioCompare.bullets.map((item) => (
              <li key={item.label}>
                <span className="font-semibold">{item.label}. </span>
                {item.detail}
              </li>
            ))}
          </ul>
          <div className="mt-4 overflow-x-auto rounded-2xl bg-white/80 dark:bg-slate-950/70">
            <table className="min-w-full text-left text-xs text-ink">
              <thead className="bg-amber-100/80 text-[10px] uppercase tracking-wide text-amber-900 dark:bg-amber-950/80 dark:text-amber-200">
                <tr>
                  <th className="px-3 py-2">Scenario</th>
                  <th className="px-3 py-2">Shelter rate</th>
                  <th className="px-3 py-2">Days</th>
                  <th className="px-3 py-2">Shelter need</th>
                  <th className="px-3 py-2">Water (gal)</th>
                  <th className="px-3 py-2">Meals</th>
                  <th className="px-3 py-2">Power cue</th>
                </tr>
              </thead>
              <tbody>
                {scenarioCompare.rows.map((row) => (
                  <tr
                    key={row.id}
                    className={`border-t border-amber-100 dark:border-amber-900/50 ${
                      row.isCurrent
                        ? "bg-amber-100/60 font-semibold dark:bg-amber-900/40"
                        : ""
                    }`}
                  >
                    <td className="px-3 py-2">
                      {row.label}
                      {row.isCurrent ? " ← current" : ""}
                    </td>
                    <td className="px-3 py-2">{row.shelterRatePct}%</td>
                    <td className="px-3 py-2">{row.days}</td>
                    <td className="px-3 py-2">{formatNumber(row.estimatedShelterNeed)}</td>
                    <td className="px-3 py-2">{formatNumber(row.waterGallons)}</td>
                    <td className="px-3 py-2">{formatNumber(row.meals)}</td>
                    <td className="px-3 py-2">{row.outageIntensity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {hazardExposure?.selected ? (
        <section
          id="hazard-tract-demand"
          className="scroll-mt-24 rounded-3xl border border-transparent bg-white p-5 shadow-sm dark:border-slate-800 dark:shadow-none"
        >
          <h2 className="text-xl font-semibold text-ink">
            Hazard ∩ tract AFN demand ({hazardExposure.hazardLabel})
          </h2>
          <p className="mt-1 text-sm text-muted">
            County-scale cue: census tracts whose polygons intersect public{" "}
            {hazardExposure.hazardKey === "hurricane"
              ? "countywide planning extent (hurricane)"
              : `${hazardExposure.hazardLabel.toLowerCase()} hazard polygons`}
            . Separate from the selected-community calculator above.{" "}
            {HAZARD_EXPOSURE_SOURCE.note}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Exposed tracts"
              value={`${formatNumber(hazardExposure.selected.tractCount)} / ${formatNumber(
                hazardExposure.allTracts.tractCount
              )}`}
            />
            <Stat
              label="Population in exposed tracts"
              value={formatNumber(hazardExposure.selected.population)}
            />
            <Stat
              label={`Shelter need @ ${Math.round(hazardExposure.shelterRate * 100)}%`}
              value={formatNumber(hazardExposure.estimatedShelterNeedFromExposedTracts)}
            />
            <Stat
              label="Est. disability (SVI × pop)"
              value={formatNumber(hazardExposure.selected.estDisability ?? 0)}
            />
            <Stat
              label="Est. limited English"
              value={formatNumber(hazardExposure.selected.estLimitedEnglish ?? 0)}
            />
            <Stat
              label="Est. age 65+"
              value={formatNumber(hazardExposure.selected.estAge65Plus ?? 0)}
            />
            <Stat
              label="No-vehicle proxy"
              value={formatNumber(hazardExposure.selected.estNoVehicleHhProxy ?? 0)}
            />
            <Stat
              label="Pop-weighted disability %"
              value={
                hazardExposure.selected.disabilityPct == null
                  ? "—"
                  : formatPercent(hazardExposure.selected.disabilityPct)
              }
            />
          </div>
          <p className="mt-3 text-xs text-muted">
            Method: {HAZARD_EXPOSURE_SOURCE.method} As of {HAZARD_EXPOSURE_SOURCE.asOf}. Rate
            source: {hazardExposure.shelterRateSource}.
          </p>
          {hazardExposure.hazardKey === "wildfire" ? (
            <p className="mt-2 text-xs text-amber-800">
              Fire Risk Areas cover most inhabited tracts statewide — treat as a broad WUI
              planning screen, not a parcel burn footprint.
            </p>
          ) : null}
          {hazardExposure.selected.note ? (
            <p className="mt-2 text-xs text-muted">{hazardExposure.selected.note}</p>
          ) : null}
        </section>
      ) : null}

      {acs ? (
        <section
          id="vulnerability"
          className="scroll-mt-24 rounded-3xl border border-transparent bg-white p-5 shadow-sm dark:border-slate-800 dark:shadow-none"
        >
          <h2 className="text-xl font-semibold text-ink">Population vulnerability (ACS)</h2>
          <p className="mt-1 text-sm text-muted">
            {placeAcs
              ? `${community?.name} uses ${placeAcs.censusName}.`
              : `${community?.name} has no matching Census place table — town ACS is Unknown.`}{" "}
            County comparison is {acs.name}. Source: {ACS_SOURCE.name}, retrieved{" "}
            {ACS_SOURCE.retrievedAt}. These aggregates do not identify individuals.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Stat
              label={`${community?.name} population`}
              value={placeAcs ? formatNumber(placeAcs.population) : "Unknown"}
            />
            <Stat
              label={`${community?.name} age 65+`}
              value={placeAcs ? formatPercent(placeAcs.olderAdultsPct) : "Unknown"}
            />
            <Stat
              label={`${community?.name} with a disability`}
              value={placeAcs ? formatPercent(placeAcs.disabilityPct) : "Unknown"}
            />
            <Stat
              label={`${community?.name} no vehicle`}
              value={placeAcs?.noVehiclePct == null ? "Unknown" : formatPercent(placeAcs.noVehiclePct)}
            />
            <Stat
              label={`${community?.name} limited English`}
              value={placeAcs?.limitedEnglishPct == null ? "Unknown" : formatPercent(placeAcs.limitedEnglishPct)}
            />
            <Stat
              label={`${community?.name} poverty`}
              value={placeAcs?.povertyPct == null ? "Unknown" : formatPercent(placeAcs.povertyPct)}
            />
            <Stat label={`${acs.name} population`} value={formatNumber(acs.population)} />
            <Stat label={`${acs.name} no vehicle`} value={formatPercent(acs.noVehiclePct)} />
            {svi ? (
              <>
                <Stat label={`${svi.name} SVI overall`} value={formatSviPercentile(svi.overall)} />
                <Stat
                  label="SVI housing / transportation theme"
                  value={formatSviPercentile(svi.housingTransport)}
                />
              </>
            ) : null}
          </div>
          {svi ? (
            <p className="mt-2 text-xs text-muted">
              {SVI_SOURCE.name}, retrieved {SVI_SOURCE.retrievedAt}. Higher percentile means
              more social vulnerability among U.S. counties. {SVI_SOURCE.note}
            </p>
          ) : null}
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {CMIST.map((item) => (
              <article key={item.key} className="rounded-2xl bg-forest-soft/60 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-forest">
                  <item.icon size={16} />
                  {item.label}
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-700">{cmist[item.key]}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {assessment ? (
        <section className="rounded-3xl border border-transparent bg-white p-5 shadow-sm dark:border-slate-800 dark:shadow-none">
          <h2 className="font-semibold">Estimated needs and documented assumptions</h2>
          <p className="mt-1 text-xs text-amber-800">
            Shortages use sample community capacity, not verified open shelter beds.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[
              [
                "ACS place population used",
                assessment.inputs.hasPlaceAcs ? assessment.inputs.population : "Unknown",
                assessment.inputs.populationSource || "No Census place match",
              ],
              ["Accessible / congregate shelter need", assessment.estimatedShelterNeed, assessment.formulas.estimatedShelterNeed],
              ["Sample capacity (not confirmed open)", assessment.availableCapacity, assessment.formulas.shelterShortfall],
              ["Scenario shelter gap", assessment.shelterShortfall, assessment.formulas.shelterShortfall],
              ["Transportation assistance", assessment.transportAssist, assessment.formulas.transportAssist],
              ["Backup power considerations", assessment.electricityBackup, assessment.formulas.electricityBackup],
              ["Water (gallons)", assessment.waterGallons, assessment.formulas.waterGallons],
              ["Meals (planning horizon)", assessment.meals, assessment.formulas.meals],
              ["Communication / language support", assessment.communicationSupport, assessment.formulas.communicationSupport],
              [
                "Pet / working-animal support",
                assessment.petSupport,
                assessment.formulas.petSupport,
              ],
            ].map(([label, value, formula]) => (
              <article key={label} className="rounded-2xl border border-slate-100 p-4">
                <p className="text-sm text-muted">{label}</p>
                <p className="mt-2 text-3xl font-bold text-forest">
                  {typeof value === "number" ? formatNumber(value) : value}
                </p>
                <p className="mt-2 font-mono text-[11px] leading-4 text-slate-500">{formula}</p>
              </article>
            ))}
          </div>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-muted">
            <li>
              Shelter rate {(assessment.inputs.shelterRate * 100).toFixed(0)}% · {assessment.rates.notes}
            </li>
            <li>
              Residents sheltering ~{formatNumber(assessment.inputs.residentShelterNeed)} · visitors
              sheltering ~{formatNumber(assessment.inputs.visitorShelterNeed)} (HIEMA ~15% visitor share)
            </li>
            <li>
              Planning horizon {assessment.inputs.days} days · meals {formatNumber(assessment.meals)} ·
              pet HH rate {(assessment.inputs.petHouseholdRate * 100).toFixed(0)}% (Hawaiʻi Health Survey)
            </li>
            <li>{assessment.dataLabel}</li>
          </ul>
          {assessment.sources ? (
            <details className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-xs text-slate-600">
              <summary className="cursor-pointer font-semibold text-ink">
                Data sources behind these numbers
              </summary>
              <ul className="mt-3 list-disc space-y-1.5 pl-5">
                {Object.entries(assessment.sources).map(([key, value]) => (
                  <li key={key}>
                    <span className="font-medium capitalize text-ink">{key}:</span> {value}
                  </li>
                ))}
              </ul>
              {assessment.sourceLinks?.length ? (
                <div className="mt-4 border-t border-slate-200 pt-3">
                  <p className="font-semibold text-ink">All source links</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {assessment.sourceLinks.map((source) => (
                      <li key={source.id}>
                        <a
                          className="text-forest hover:underline"
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {source.label}
                        </a>
                        {" — "}
                        {source.usedFor}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </details>
          ) : null}
        </section>
      ) : null}

      <section className="rounded-3xl border border-transparent bg-white p-5 shadow-sm dark:border-slate-800 dark:shadow-none">
        <h2 className="font-semibold">Designated shelter / refuge locations</h2>
        <p className="mt-1 text-sm text-muted">
          {shelters.length} publicly listed planning facilities for{" "}
          {COUNTIES.find((item) => item.id === countyId)?.name}. These are designated or
          potential sites only — not confirmed open. {SHELTER_DATASET.note}
        </p>
        <p className="mt-1 text-xs text-amber-800">
          Inventory vintage: {SHELTER_DATASET.asOf}. Capacities are not published in these
          sources, so bed counts stay blank.
        </p>
        <ul className="mt-3 max-h-[28rem] space-y-2 overflow-y-auto pr-1 text-sm">
          {shelters.map((item) => (
            <li key={item.id} className="rounded-2xl border border-slate-100 p-3">
              <p className="font-semibold">{item.name}</p>
              <p className="text-xs text-muted">
                {item.island}
                {item.address ? ` · ${item.address}` : ""}
              </p>
              <p className="mt-1 text-xs text-amber-800">
                Designated / potential — open status not confirmed
              </p>
              <p className="text-xs text-muted">
                Capacity:{" "}
                {item.capacity == null ? "not published in source" : formatNumber(item.capacity)}
                {item.petFriendly ? " · Pet-friendly (bring crate/supplies)" : ""}
                {item.specialNeeds ? " · Special-needs flag in source" : ""}
                {item.notes ? ` · ${item.notes}` : ""}
              </p>
              <a
                href={item.sourceUrl}
                className="text-xs text-forest hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                Source
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">
          Full source set:{" "}
          <a className="text-forest hover:underline" href={SHELTER_DATASET.openDataUrl} target="_blank" rel="noreferrer">
            Open Data CSV
          </a>
          {" · "}
          <a className="text-forest hover:underline" href={SHELTER_DATASET.honoluluListUrl} target="_blank" rel="noreferrer">
            Honolulu 2018 list
          </a>
          {" · "}
          <a className="text-forest hover:underline" href={SHELTER_DATASET.kauaiListUrl} target="_blank" rel="noreferrer">
            Kauaʻi KEMA list
          </a>
          {" · "}
          <a className="text-forest hover:underline" href={SHELTER_DATASET.mauiEmaUrl} target="_blank" rel="noreferrer">
            Maui EMA
          </a>
          {" · "}
          <a className="text-forest hover:underline" href={SHELTER_DATASET.hawaiiCdUrl} target="_blank" rel="noreferrer">
            Hawaiʻi Civil Defense
          </a>
        </p>
      </section>

      <section id="coordination" className="scroll-mt-24 rounded-3xl border border-transparent bg-white p-5 shadow-sm dark:border-slate-800 dark:shadow-none">
        <h2 className="text-xl font-semibold text-ink">Coordinated response framework</h2>
        {summary ? <p className="mt-3 text-sm leading-6 text-slate-700">{summary.text}</p> : null}
        <p className="mt-3 text-xs text-muted">
          {summary?.aiGenerated ? "AI summary" : "Deterministic planning summary — not AI-generated."}
          {" "}
          Partners below are matched to this scenario&apos;s estimated gaps (MATCH).
          Counties lead; State ESF-6 supports. For multilingual / trauma-informed message
          templates, open{" "}
          <Link className="font-medium text-forest hover:underline" to="/communication">
            Communication pathways
          </Link>
          .
        </p>
        <div className="mt-4 space-y-3">
          {partners.map((partner) => (
            <article
              key={partner.id}
              className={`rounded-2xl border p-4 ${
                partner.lead ? "border-forest/30 bg-forest-soft/50" : "border-slate-100"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="font-semibold text-ink">
                  {partner.name}
                  {partner.lead ? (
                    <span className="ml-2 text-xs font-semibold uppercase tracking-wide text-forest">
                      Lead
                    </span>
                  ) : null}
                </p>
                <p className="text-[11px] uppercase tracking-wide text-muted">
                  CMIST: {partner.cmist.join(" · ")}
                </p>
              </div>
              <p className="mt-2 text-sm text-slate-700">{partner.role}</p>
              {partner.matchedNeeds.length ? (
                <p className="mt-2 text-xs text-amber-900">
                  Matched to: {partner.matchedNeeds.join(" · ")}
                </p>
              ) : (
                <p className="mt-2 text-xs text-muted">Always on for County / State coordination.</p>
              )}
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted">
                {partner.decisionPoints.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white hover:bg-forest-dark"
        >
          <ClipboardList size={16} />
          Generate planning report
        </button>
        {aiNote ? <p className="mt-2 text-xs text-muted">{aiNote}</p> : null}
      </section>

      {reportPreview ? (
        <section className="rounded-3xl bg-slate-900 p-5 text-sm text-emerald-50">
          <h2 className="text-lg font-semibold text-white">{reportPreview.title}</h2>
          <p className="mt-2 text-emerald-100">{reportPreview.disclaimer}</p>
        </section>
      ) : null}

      <p className="text-xs text-muted">Prototype communities: {COMMUNITIES.length}.</p>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <article className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-950/60">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold text-ink">{value}</p>
    </article>
  );
}
