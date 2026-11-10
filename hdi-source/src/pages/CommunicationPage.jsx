import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Check,
  Copy,
  HeartHandshake,
  Languages,
  Megaphone,
  Shield,
} from "lucide-react";
import DisclaimerBanner from "../components/DisclaimerBanner";
import { COUNTIES } from "../data/counties";
import {
  buildLanguageAccessBriefing,
  CHANNELS,
  COMMUNICATION_PATHWAYS_SOURCE,
  defaultComposerFields,
  fillTemplate,
  PHASES,
  PRIORITY_LANGUAGES,
  TRAUMA_PRINCIPLES,
  templatesFor,
} from "../data/communicationPathways";
import { DISASTER_TYPES } from "../lib/resourceCalculator";

export default function CommunicationPage() {
  const [params] = useSearchParams();
  const initialCounty =
    COUNTIES.find((c) => c.id === params.get("county"))?.id || "honolulu";
  const initialHazard =
    DISASTER_TYPES.find((d) => d.id === params.get("hazard"))?.id || "hurricane";

  const [phase, setPhase] = useState(params.get("phase") || "before");
  const [hazardId, setHazardId] = useState(initialHazard);
  const [countyId, setCountyId] = useState(initialCounty);
  const [templateId, setTemplateId] = useState("");
  const [fields, setFields] = useState(() =>
    defaultComposerFields(COUNTIES.find((c) => c.id === initialCounty))
  );
  const [copiedId, setCopiedId] = useState(null);

  const county = COUNTIES.find((c) => c.id === countyId) ?? COUNTIES[0];
  const templates = useMemo(
    () => templatesFor({ phase, hazardId }),
    [phase, hazardId]
  );
  const selected =
    templates.find((item) => item.id === templateId) || templates[0] || null;

  useEffect(() => {
    if (!templates.some((item) => item.id === templateId)) {
      setTemplateId(templates[0]?.id || "");
    }
  }, [templates, templateId]);

  useEffect(() => {
    setFields((current) => ({
      ...defaultComposerFields(county),
      facility: current.facility,
      address: current.address,
      location: current.location,
      zone: current.zone || defaultComposerFields(county).zone,
      area: current.area || defaultComposerFields(county).area,
    }));
  }, [county]);

  const draft = selected
    ? fillTemplate(selected.body, fields)
    : "Select a template to draft a message.";

  async function copyText(id, text) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setCopiedId(null);
    }
  }

  function updateField(key, value) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-3xl font-bold text-forest dark:text-emerald-300">
          Communication pathways
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Build copy-ready English drafts for County / partner desks — then localize
          with language-access partners. Not a public alert system.{" "}
          {COMMUNICATION_PATHWAYS_SOURCE.challengeNote}
        </p>
        <p className="mt-2 max-w-3xl text-xs text-amber-800 dark:text-amber-200">
          {COMMUNICATION_PATHWAYS_SOURCE.note}
        </p>
      </div>

      <DisclaimerBanner compact />

      <section className="rounded-3xl border border-transparent bg-white p-5 shadow-sm dark:border-slate-800 dark:shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Megaphone className="mt-0.5 text-forest" size={22} />
            <div>
              <h2 className="text-xl font-semibold text-ink">Message composer</h2>
              <p className="mt-1 text-sm text-muted">
                Pick phase, hazard, and county. Fill the blanks. Copy a draft for PIO /
                VOAD partners to localize and release on official channels only.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              copyText(
                "draft",
                selected
                  ? `${selected.title}\nAudience: ${selected.audience}\nCounty: ${fields.county}\nHazard: ${hazardId}\n\n${draft}`
                  : draft
              )
            }
            className="inline-flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-xs font-semibold text-white hover:bg-forest-dark"
          >
            {copiedId === "draft" ? <Check size={14} /> : <Copy size={14} />}
            {copiedId === "draft" ? "Draft copied" : "Copy draft"}
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="text-xs text-muted">
            Phase
            <select
              value={phase}
              onChange={(event) => setPhase(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-ink dark:border-slate-600 dark:bg-slate-950"
            >
              {PHASES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-muted">
            Hazard
            <select
              value={hazardId}
              onChange={(event) => setHazardId(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-ink dark:border-slate-600 dark:bg-slate-950"
            >
              {DISASTER_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-muted">
            County
            <select
              value={countyId}
              onChange={(event) => setCountyId(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-ink dark:border-slate-600 dark:bg-slate-950"
            >
              {COUNTIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-muted">
            Template
            <select
              value={selected?.id || ""}
              onChange={(event) => setTemplateId(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-ink dark:border-slate-600 dark:bg-slate-950"
            >
              {templates.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        {selected ? (
          <p className="mt-3 text-xs text-muted">
            Audience: <span className="text-ink">{selected.audience}</span>
          </p>
        ) : null}

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {[
            ["facility", "Facility / shelter name", "e.g. Central Middle School"],
            ["address", "Address", "e.g. 123 Example St"],
            ["zone", "Zone / area", "e.g. south shore evacuation zone"],
            ["location", "Pickup location", "e.g. community center lot"],
            ["transportLine", "Transport / paratransit line", ""],
            ["officialChannel", "Official update channel", ""],
            ["petRule", "Pet rule", "e.g. crate required / pet-friendly area"],
          ].map(([key, label, placeholder]) => (
            <label key={key} className="text-xs text-muted">
              {label}
              <input
                value={fields[key] || ""}
                onChange={(event) => updateField(key, event.target.value)}
                placeholder={placeholder}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-ink dark:border-slate-600 dark:bg-slate-950"
              />
            </label>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-950/50">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Live draft
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink">{draft}</p>
          {draft.includes("[") ? (
            <p className="mt-2 text-xs text-amber-800 dark:text-amber-200">
              Brackets still showing means a field above is empty — fill it or leave for
              the County PIO to complete.
            </p>
          ) : null}
        </div>

        <p className="mt-3 text-xs text-muted">
          Pull planning context from{" "}
          <Link
            className="font-medium text-forest hover:underline"
            to={`/resource-planning?county=${countyId}`}
          >
            Resource Planning
          </Link>{" "}
          · language partners on{" "}
          <Link
            className="font-medium text-forest hover:underline"
            to="/resource-planning#coordination"
          >
            MATCH
          </Link>
          .
        </p>
      </section>

      <section className="rounded-3xl border border-transparent bg-white p-5 shadow-sm dark:border-slate-800 dark:shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Languages className="mt-0.5 text-forest" size={22} />
            <div>
              <h2 className="text-xl font-semibold text-ink">
                Priority languages for Hawaiʻi mass care
              </h2>
              <p className="mt-1 text-sm text-muted">
                Equity reference for LEP / ASL planning. Copy a partner briefing, then
                localize the English draft above — this app does not machine-translate.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => copyText("language-briefing", buildLanguageAccessBriefing())}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-forest hover:bg-forest-soft dark:border-slate-600"
          >
            {copiedId === "language-briefing" ? <Check size={14} /> : <Copy size={14} />}
            {copiedId === "language-briefing"
              ? "Briefing copied"
              : "Copy language-access briefing"}
          </button>
        </div>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PRIORITY_LANGUAGES.map((lang) => (
            <li
              key={lang.id}
              className="rounded-2xl border border-slate-100 px-3 py-3 dark:border-slate-700 dark:bg-slate-950/40"
            >
              <p className="text-sm font-semibold text-ink">{lang.label}</p>
              <p className="mt-0.5 text-xs text-muted">{lang.role}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl border border-transparent bg-white p-5 shadow-sm dark:border-slate-800 dark:shadow-none">
        <div className="flex items-start gap-3">
          <HeartHandshake className="mt-0.5 text-forest" size={22} />
          <div>
            <h2 className="text-xl font-semibold text-ink">Who carries the message</h2>
            <p className="mt-1 text-sm text-muted">
              After you copy a draft, route it through the right channel — County PIO
              owns public release.
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {CHANNELS.map((channel) => (
            <article key={channel.id} className="rounded-2xl bg-forest-soft/50 p-4">
              <p className="font-semibold text-forest">{channel.title}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {channel.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-transparent bg-white p-5 shadow-sm dark:border-slate-800 dark:shadow-none">
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 text-forest" size={22} />
          <div>
            <h2 className="text-xl font-semibold text-ink">Tone cues (short)</h2>
            <p className="mt-1 text-sm text-muted">
              Keep drafts humanistic — especially for immigrant households and AFN
              audiences.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {TRAUMA_PRINCIPLES.map((item) => (
            <details
              key={item.id}
              className="rounded-full border border-slate-200 bg-slate-50 open:rounded-2xl open:px-4 open:py-3 dark:border-slate-700 dark:bg-slate-950/50"
            >
              <summary className="cursor-pointer px-3 py-1.5 text-xs font-semibold text-forest">
                {item.title}
              </summary>
              <p className="mt-2 max-w-md text-xs leading-5 text-muted">{item.body}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
