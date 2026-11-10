import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check, Copy, Languages, MapPin, Megaphone } from "lucide-react";
import DisclaimerBanner from "../components/DisclaimerBanner";
import { COMMUNITIES } from "../data/communities";
import { COUNTIES } from "../data/counties";
import {
  buildLanguageAccessBriefing,
  buildPublicAdvisoryDraft,
  COMMUNICATION_PATHWAYS_SOURCE,
  defaultComposerFields,
  fillTemplate,
  PHASES,
  PRIORITY_LANGUAGES,
  templatesFor,
} from "../data/communicationPathways";
import { sheltersForCounty, suggestSheltersNearQuery } from "../data/shelters";
import { DISASTER_TYPES } from "../lib/resourceCalculator";

const DEFAULT_LANG_IDS = PRIORITY_LANGUAGES.map((lang) => lang.id);

export default function CommunicationPage() {
  const [params] = useSearchParams();
  const initialCounty =
    COUNTIES.find((c) => c.id === params.get("county"))?.id || "honolulu";
  const initialHazard =
    DISASTER_TYPES.find((d) => d.id === params.get("hazard"))?.id || "hurricane";

  const [phase, setPhase] = useState(params.get("phase") || "during");
  const [hazardId, setHazardId] = useState(initialHazard);
  const [countyId, setCountyId] = useState(initialCounty);
  const [templateId, setTemplateId] = useState("");
  const [shelterId, setShelterId] = useState("");
  const [selectedLangIds, setSelectedLangIds] = useState(DEFAULT_LANG_IDS);
  const [fields, setFields] = useState(() =>
    defaultComposerFields(COUNTIES.find((c) => c.id === initialCounty))
  );
  const [copiedId, setCopiedId] = useState(null);

  const county = COUNTIES.find((c) => c.id === countyId) ?? COUNTIES[0];
  const hazard = DISASTER_TYPES.find((d) => d.id === hazardId);
  const phaseMeta = PHASES.find((p) => p.id === phase);
  const countyShelters = useMemo(() => sheltersForCounty(countyId), [countyId]);
  const placePicks = useMemo(
    () =>
      COMMUNITIES.filter((item) => item.countyId === countyId).map((item) => ({
        id: item.id,
        name: item.name,
      })),
    [countyId]
  );

  const suggestedShelters = useMemo(
    () => suggestSheltersNearQuery(fields.zone, countyId, { limit: 8 }),
    [fields.zone, countyId]
  );

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
    setShelterId("");
    setFields(defaultComposerFields(county));
  }, [county]);

  useEffect(() => {
    if (!shelterId) return;
    const shelter = countyShelters.find((item) => item.id === shelterId);
    if (!shelter) return;
    setFields((current) => ({
      ...current,
      facility: shelter.name,
      address: shelter.address || "",
      petRule: shelter.petFriendly
        ? "pet-friendly area when County opens this site — confirm crate rules"
        : current.petRule || "check county pet / crate rules",
    }));
  }, [shelterId, countyShelters]);

  const messageBody = selected ? fillTemplate(selected.body, fields) : "";
  const nearbyNames = suggestedShelters
    .filter((item) => item.id !== shelterId)
    .slice(0, 5)
    .map((item) => item.name);

  const advisory = buildPublicAdvisoryDraft({
    county,
    hazardLabel: hazard?.label,
    phaseLabel: phaseMeta?.label,
    fields,
    messageBody,
    audience: selected?.audience,
    priorityLanguageIds: selectedLangIds,
    nearbyShelterNames: nearbyNames,
  });

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

  function pickPlace(name) {
    setShelterId("");
    setFields((current) => ({
      ...current,
      zone: name,
      area: name,
      facility: "",
      address: "",
    }));
  }

  function pickSuggestedShelter(shelter) {
    setShelterId(shelter.id);
  }

  function toggleLanguage(id) {
    if (id === "en") return;
    setSelectedLangIds((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }
      return [...current, id];
    });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-3xl font-bold text-forest dark:text-emerald-300">
          Communication pathways
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Draft a sendable English advisory for County / partner desks: where it
          affects, where to get help, and which languages to prepare. County PIO
          still owns public release — this is not NWS.{" "}
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
              <h2 className="text-xl font-semibold text-ink">Advisory draft builder</h2>
              <p className="mt-1 text-sm text-muted">
                Type a neighborhood (for example ʻEwa Beach) to see nearby designated
                shelters like Campbell High, fill the blanks, then copy one advisory.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => copyText("advisory", advisory)}
            className="inline-flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-xs font-semibold text-white hover:bg-forest-dark"
          >
            {copiedId === "advisory" ? <Check size={14} /> : <Copy size={14} />}
            {copiedId === "advisory" ? "Advisory copied" : "Copy full advisory"}
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
            Where this affects (county)
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
            Message focus
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

        <div className="mt-4 space-y-3">
          <label className="block text-xs text-muted">
            Zone / neighborhood (where this affects)
            <input
              value={fields.zone || ""}
              onChange={(event) => {
                updateField("zone", event.target.value);
                updateField("area", event.target.value);
              }}
              placeholder="e.g. Ewa Beach, Kapolei, Kāneʻohe"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-ink dark:border-slate-600 dark:bg-slate-950"
            />
          </label>

          {placePicks.length > 0 ? (
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
                Quick places in this county
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {placePicks.map((place) => {
                  const active =
                    normalizeLoose(fields.zone) === normalizeLoose(place.name);
                  return (
                    <li key={place.id}>
                      <button
                        type="button"
                        onClick={() => pickPlace(place.name)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                          active
                            ? "bg-forest text-white"
                            : "border border-slate-200 text-ink hover:bg-forest-soft dark:border-slate-700"
                        }`}
                      >
                        {place.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          {suggestedShelters.length > 0 ? (
            <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/60 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 shrink-0 text-forest" size={16} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-forest dark:text-emerald-300">
                    Possible shelters near “{fields.zone}”
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted">
                    Click one to put it in the advisory. Open status is never confirmed
                    here — County still announces openings.
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {suggestedShelters.map((shelter) => {
                      const active = shelterId === shelter.id;
                      return (
                        <li key={shelter.id}>
                          <button
                            type="button"
                            onClick={() => pickSuggestedShelter(shelter)}
                            className={`max-w-full rounded-full px-3 py-1.5 text-left text-xs transition ${
                              active
                                ? "bg-forest text-white"
                                : "border border-emerald-300/80 bg-white text-ink hover:border-forest dark:border-emerald-800 dark:bg-slate-950"
                            }`}
                            title={shelter.address || shelter.name}
                          >
                            <span className="font-semibold">{shelter.name}</span>
                            {shelter.address ? (
                              <span className="mt-0.5 block truncate text-[10px] opacity-80">
                                {shelter.address}
                              </span>
                            ) : null}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          ) : fields.zone && String(fields.zone).trim().length >= 3 ? (
            <p className="text-[11px] text-muted">
              No address match yet for “{fields.zone}” in this county inventory. Try a
              town name (ʻEwa Beach, Kapolei) or pick from the full list below.
            </p>
          ) : null}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="text-xs text-muted md:col-span-2">
            Where to get help — designated shelter (optional)
            <select
              value={shelterId}
              onChange={(event) => setShelterId(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-ink dark:border-slate-600 dark:bg-slate-950"
            >
              <option value="">County will announce openings (no site selected)</option>
              {countyShelters.slice(0, 80).map((shelter) => (
                <option key={shelter.id} value={shelter.id}>
                  {shelter.name}
                  {shelter.address ? ` — ${shelter.address}` : ""}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-[11px] text-muted">
              Planning inventories only ({countyShelters.length} sites in this county).
              Open status is never confirmed here.
            </span>
          </label>
          <label className="text-xs text-muted">
            Transport pickup point
            <input
              value={fields.location || ""}
              onChange={(event) => updateField("location", event.target.value)}
              placeholder="e.g. community center lot"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-ink dark:border-slate-600 dark:bg-slate-950"
            />
          </label>
          <label className="text-xs text-muted">
            Official update channel
            <input
              value={fields.officialChannel || ""}
              onChange={(event) => updateField("officialChannel", event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-ink dark:border-slate-600 dark:bg-slate-950"
            />
          </label>
          <label className="text-xs text-muted">
            Facility name (editable)
            <input
              value={fields.facility || ""}
              onChange={(event) => {
                setShelterId("");
                updateField("facility", event.target.value);
              }}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-ink dark:border-slate-600 dark:bg-slate-950"
            />
          </label>
          <label className="text-xs text-muted">
            Address (editable)
            <input
              value={fields.address || ""}
              onChange={(event) => updateField("address", event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-ink dark:border-slate-600 dark:bg-slate-950"
            />
          </label>
          <label className="text-xs text-muted md:col-span-2">
            Transport / paratransit line
            <input
              value={fields.transportLine || ""}
              onChange={(event) => updateField("transportLine", event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-ink dark:border-slate-600 dark:bg-slate-950"
            />
          </label>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-950/50">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Full advisory (copy this)
          </p>
          <pre className="mt-2 whitespace-pre-wrap font-sans text-sm leading-6 text-ink">
            {advisory}
          </pre>
        </div>

        <p className="mt-3 text-xs text-muted">
          Numbers and the downloadable ESF-6 planning report live on{" "}
          <Link
            className="font-medium text-forest hover:underline"
            to={`/resource-planning?county=${countyId}`}
          >
            Resource Planning
          </Link>
          . Language partners on{" "}
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
                Priority languages for mass care
              </h2>
              <p className="mt-1 text-sm text-muted">
                Click to include or drop languages from the advisory above. Copy the
                partner briefing when you want a checkbox ask for interpreters.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              copyText(
                "language-briefing",
                buildLanguageAccessBriefing(selectedLangIds)
              )
            }
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-forest hover:bg-forest-soft dark:border-slate-600"
          >
            {copiedId === "language-briefing" ? <Check size={14} /> : <Copy size={14} />}
            {copiedId === "language-briefing"
              ? "Briefing copied"
              : "Copy language-access briefing"}
          </button>
        </div>
        <ul className="mt-4 flex flex-wrap gap-2">
          {PRIORITY_LANGUAGES.map((lang) => {
            const active = selectedLangIds.includes(lang.id);
            const locked = lang.id === "en";
            return (
              <li key={lang.id}>
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => toggleLanguage(lang.id)}
                  title={lang.role}
                  className={`rounded-full px-3 py-1 text-xs transition ${
                    active
                      ? "bg-forest text-white"
                      : "border border-slate-200 text-ink hover:bg-forest-soft dark:border-slate-700"
                  } ${locked ? "cursor-default opacity-90" : ""}`}
                >
                  {lang.label}
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function normalizeLoose(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[ʻ''`]/g, "")
    .toLowerCase()
    .trim();
}
