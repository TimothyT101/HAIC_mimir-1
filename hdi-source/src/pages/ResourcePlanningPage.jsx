import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Bus,
  ClipboardList,
  HeartPulse,
  MessageCircle,
  Shield,
  Users,
} from "lucide-react";
import DisclaimerBanner from "../components/DisclaimerBanner";
import { ACS_SOURCE, getCountyAcs } from "../data/acsIndicators";
import { COMMUNITIES, communitiesByCounty, getCommunity } from "../data/communities";
import { COUNTIES } from "../data/counties";
import { sheltersForCounty } from "../data/shelters";
import { formatNumber, formatPercent } from "../lib/format";
import { buildPlanningSummary } from "../lib/planningSummary";
import { buildPlanningReport, downloadReport } from "../lib/reportGenerator";
import { calculateResources, DISASTER_TYPES } from "../lib/resourceCalculator";
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
  const shelters = sheltersForCounty(countyId);

  const assessment = useMemo(() => {
    if (!community) return null;
    return calculateResources({ community, disasterTypeId });
  }, [community, disasterTypeId]);

  const summary = useMemo(() => {
    if (!community || !assessment) return null;
    return buildPlanningSummary({ community, assessment });
  }, [community, assessment]);

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

  const v = community?.vulnerability;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-3xl font-bold text-forest">Resource Planning</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          County, community, and hazard scenario for ESF-6 planning. County
          indicators are Census QuickFacts/ACS aggregates. Shelter open status is
          not confirmed. Formulas are shown with the results.
        </p>
      </div>
      <DisclaimerBanner compact />

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Scenario inputs</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="text-sm">
            <span className="mb-1 block text-muted">County</span>
            <select
              value={countyId}
              onChange={(event) => handleCounty(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
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
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
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
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
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

      {acs ? (
        <section id="vulnerability" className="scroll-mt-24 rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Population vulnerability (county ACS)</h2>
          <p className="mt-1 text-sm text-muted">
            {acs.name}, {acs.geography} scale. Source: {ACS_SOURCE.name}, retrieved{" "}
            {ACS_SOURCE.retrievedAt}. These aggregates do not identify individuals.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Stat label="Population (ACS 2023 5-year)" value={formatNumber(acs.population)} />
            <Stat label="Age 65+" value={formatPercent(acs.olderAdultsPct)} />
            <Stat label="With a disability" value={formatPercent(acs.disabilityPct ?? acs.disabilityUnder65Pct)} />
            <Stat label="Language other than English at home" value={formatPercent(acs.languageOtherThanEnglishPct)} />
            <Stat label="Speak English less than very well" value={formatPercent(acs.limitedEnglishPct)} />
            <Stat label="Poverty" value={formatPercent(acs.povertyPct)} />
            <Stat
              label="Households without vehicles"
              value={acs.noVehiclePct == null ? "Not published in this extract" : formatPercent(acs.noVehiclePct)}
            />
            <Stat
              label={`${community?.name} no-vehicle proxy`}
              value={v?.noVehiclePct == null ? "Unknown" : `${formatPercent(v.noVehiclePct)} (demonstration)`}
            />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {CMIST.map((item) => (
              <article key={item.key} className="rounded-2xl bg-forest-soft/60 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-forest">
                  <item.icon size={16} />
                  {item.label}
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-700">
                  {v?.cmist?.[item.key] ?? "Unknown"}{" "}
                  <span className="text-amber-800">(community note: demonstration)</span>
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {assessment ? (
        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="font-semibold">Estimated needs and documented assumptions</h2>
          <p className="mt-1 text-xs text-amber-800">
            Shortages use sample community capacity, not verified open shelter beds.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[
              ["Potential population used", assessment.inputs.population, "Selected community population field"],
              ["Accessible / congregate shelter need", assessment.estimatedShelterNeed, assessment.formulas.estimatedShelterNeed],
              ["Sample capacity (not confirmed open)", assessment.availableCapacity, assessment.formulas.shelterShortfall],
              ["Scenario shelter gap", assessment.shelterShortfall, assessment.formulas.shelterShortfall],
              ["Transportation assistance", assessment.transportAssist, assessment.formulas.transportAssist],
              ["Backup power considerations", assessment.electricityBackup, assessment.formulas.electricityBackup],
              ["Water (gallons)", assessment.waterGallons, assessment.formulas.waterGallons],
              ["Communication / language support", assessment.communicationSupport, assessment.formulas.communicationSupport],
            ].map(([label, value, formula]) => (
              <article key={label} className="rounded-2xl border border-slate-100 p-4">
                <p className="text-sm text-muted">{label}</p>
                <p className="mt-2 text-3xl font-bold text-forest">{formatNumber(value)}</p>
                <p className="mt-2 font-mono text-[11px] leading-4 text-slate-500">{formula}</p>
              </article>
            ))}
          </div>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-muted">
            <li>Shelter rate {(assessment.inputs.shelterRate * 100).toFixed(0)}% · {assessment.rates.notes}</li>
            <li>Planning horizon {assessment.inputs.days} days · meals {formatNumber(assessment.meals)}</li>
            <li>{assessment.dataLabel}</li>
          </ul>
        </section>
      ) : null}

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Designated shelter locations</h2>
        <p className="mt-1 text-sm text-muted">
          Public civic sites for {COUNTIES.find((item) => item.id === countyId)?.name}. Status is
          designated, not confirmed open.
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          {shelters.map((item) => (
            <li key={item.id} className="rounded-2xl border border-slate-100 p-3">
              <p className="font-semibold">{item.name}</p>
              <p className="text-xs text-amber-800">Designated — open status not confirmed</p>
              <p className="text-xs text-muted">
                Capacity: {item.capacity == null ? "not published here" : formatNumber(item.capacity)}
              </p>
              <a href={item.sourceUrl} className="text-xs text-forest hover:underline" target="_blank" rel="noreferrer">
                {item.source}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section id="coordination" className="scroll-mt-24 rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Coordinated response framework</h2>
        {summary ? <p className="mt-3 text-sm leading-6 text-slate-700">{summary.text}</p> : null}
        <p className="mt-3 text-xs text-muted">
          {summary?.aiGenerated ? "AI summary" : "Deterministic planning summary — not AI-generated."}
        </p>
        <ul className="mt-4 grid gap-2 text-sm text-muted md:grid-cols-2">
          <li>County emergency management / civil defense — lead ESF-6 decisions</li>
          <li>HIEMA and State DHS — state coordination and mass care support</li>
          <li>American Red Cross and VOAD — shelter operations and feeding</li>
          <li>Transit / paratransit — households without vehicles</li>
        </ul>
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
    <article className="rounded-2xl border border-slate-100 p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </article>
  );
}
