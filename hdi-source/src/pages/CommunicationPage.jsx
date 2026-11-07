import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Copy, HeartHandshake, Languages, Megaphone, Shield } from "lucide-react";
import DisclaimerBanner from "../components/DisclaimerBanner";
import {
  CHANNELS,
  COMMUNICATION_PATHWAYS_SOURCE,
  PHASES,
  PRIORITY_LANGUAGES,
  TRAUMA_PRINCIPLES,
  templatesFor,
} from "../data/communicationPathways";
import { DISASTER_TYPES } from "../lib/resourceCalculator";

const LANG_STORAGE_KEY = "haic-language-coverage";

function loadCoveredLanguages() {
  try {
    const raw = window.localStorage.getItem(LANG_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export default function CommunicationPage() {
  const [phase, setPhase] = useState("before");
  const [hazardId, setHazardId] = useState("hurricane");
  const [copiedId, setCopiedId] = useState(null);
  const [covered, setCovered] = useState(() => new Set());

  useEffect(() => {
    setCovered(loadCoveredLanguages());
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, JSON.stringify([...covered]));
    } catch {
      /* ignore quota / private mode */
    }
  }, [covered]);

  const templates = useMemo(
    () => templatesFor({ phase, hazardId }),
    [phase, hazardId]
  );

  const coveredCount = covered.size;

  function toggleLanguage(id) {
    setCovered((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function copyTemplate(template) {
    const text = `${template.title}\nAudience: ${template.audience}\n\n${template.body}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(template.id);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setCopiedId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-3xl font-bold text-forest">Communication pathways</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Multilingual checklist and trauma-informed message templates for ESF-6
          mass-care planning — before, during, and after a hazard.{" "}
          {COMMUNICATION_PATHWAYS_SOURCE.challengeNote}
        </p>
        <p className="mt-2 max-w-3xl text-xs text-amber-800">
          {COMMUNICATION_PATHWAYS_SOURCE.note}
        </p>
      </div>

      <DisclaimerBanner compact />

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 text-forest" size={22} />
          <div>
            <h2 className="text-xl font-semibold">Trauma-informed principles</h2>
            <p className="mt-1 text-sm text-muted">
              Humanistic tone for County and partner outreach. These are planning
              cues — not a substitute for county public information officers.
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {TRAUMA_PRINCIPLES.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-100 p-4">
              <p className="font-semibold text-forest">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Languages className="mt-0.5 text-forest" size={22} />
            <div>
              <h2 className="text-xl font-semibold">Priority languages checklist</h2>
              <p className="mt-1 text-sm text-muted">
                Working desk tool: click each language when your County / VOAD team
                has an interpreter or plain-language line ready <em>before</em> impact.
                Saved in this browser only — not shared with DHS systems.
              </p>
            </div>
          </div>
          <p className="rounded-full bg-forest-soft px-3 py-1 text-xs font-semibold text-forest">
            {coveredCount} / {PRIORITY_LANGUAGES.length} covered
          </p>
        </div>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PRIORITY_LANGUAGES.map((lang) => {
            const isOn = covered.has(lang.id);
            return (
              <li key={lang.id}>
                <button
                  type="button"
                  onClick={() => toggleLanguage(lang.id)}
                  aria-pressed={isOn}
                  className={`flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left text-sm transition ${
                    isOn
                      ? "border-forest/40 bg-forest-soft/70"
                      : "border-slate-100 hover:border-forest/30 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                      isOn
                        ? "border-forest bg-forest text-white"
                        : "border-slate-300 bg-white text-transparent"
                    }`}
                    aria-hidden="true"
                  >
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>
                    <span className="font-semibold text-ink">{lang.label}</span>
                    <span className="mt-0.5 block text-xs text-muted">{lang.role}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <HeartHandshake className="mt-0.5 text-forest" size={22} />
          <div>
            <h2 className="text-xl font-semibold">Who carries the message</h2>
            <p className="mt-1 text-sm text-muted">
              Pair official alerts with mass-care and trusted community channels.
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
        <p className="mt-3 text-sm text-muted">
          On Resource Planning, language-access partners appear when the MODEL
          estimates communication support need.{" "}
          <Link className="font-medium text-forest hover:underline" to="/resource-planning#coordination">
            Open MATCH partners
          </Link>
          .
        </p>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex items-start gap-3">
            <Megaphone className="mt-0.5 text-forest" size={22} />
            <div>
              <h2 className="text-xl font-semibold">English message templates</h2>
              <p className="mt-1 text-sm text-muted">
                Copy, localize with language partners, then release only through
                authorized public information channels.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="text-xs text-muted">
              Phase
              <select
                value={phase}
                onChange={(event) => setPhase(event.target.value)}
                className="ml-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-ink"
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
                className="ml-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-ink"
              >
                {DISASTER_TYPES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {templates.map((template) => (
            <article key={template.id} className="rounded-2xl border border-slate-100 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-ink">{template.title}</p>
                  <p className="mt-1 text-xs text-muted">
                    {template.phase} · {template.audience}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyTemplate(template)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-forest hover:bg-forest-soft"
                >
                  {copiedId === template.id ? <Check size={14} /> : <Copy size={14} />}
                  {copiedId === template.id ? "Copied" : "Copy English"}
                </button>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {template.body}
              </p>
            </article>
          ))}
          {templates.length === 0 ? (
            <p className="text-sm text-muted">No templates for this filter.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
