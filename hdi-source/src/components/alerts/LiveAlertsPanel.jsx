import { ExternalLink, RefreshCw } from "lucide-react";
import { formatTimestamp } from "../../lib/format";

export default function LiveAlertsPanel({
  alerts = [],
  status = "ready",
  error,
  fetchedAt,
  stale,
  onReload,
  onViewDetails,
  mode = "live",
}) {
  const live = mode === "live";

  return (
    <section className="flex h-full min-h-0 flex-col rounded-3xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">
            {live ? "Live NWS alerts" : "Planning exercise cards"}
          </h2>
          <p className={`text-xs ${live ? "text-slate-500" : "text-amber-700"}`}>
            {live
              ? "Official National Weather Service products for Hawaiʻi"
              : "HAIC exercise samples only — not live warnings"}
          </p>
        </div>
        <span
          className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
            live ? "bg-emerald-50 text-forest" : "bg-amber-50 text-amber-800"
          }`}
        >
          {live ? "Verified NWS" : "Exercise"}
        </span>
      </div>

      {live ? (
        <p className="mt-2 text-[11px] text-muted">
          Last successful refresh: {fetchedAt ? formatTimestamp(fetchedAt) : "—"}.
          {stale ? " Feed may be stale." : ""} Source: weather.gov.
        </p>
      ) : null}

      <ul className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {status === "loading" ? (
          <li className="rounded-2xl bg-slate-50 p-3 text-sm text-muted">Loading Hawaiʻi alerts…</li>
        ) : null}
        {status === "error" ? (
          <li className="rounded-2xl bg-red-50 p-3 text-sm text-red-800">
            Connection error: {error || "National Weather Service is unavailable."}
            <button type="button" className="ml-2 underline" onClick={onReload}>
              Retry
            </button>
          </li>
        ) : null}
        {status === "empty" || (status === "ready" && alerts.length === 0) ? (
          <li className="rounded-2xl bg-slate-50 p-3 text-sm text-muted">
            {live
              ? "No active NWS alerts for Hawaiʻi."
              : "No exercise cards in the recent window. Switch to Live conditions for real alerts."}
          </li>
        ) : null}
        {alerts.map((alert) => (
          <li key={alert.id} className="rounded-2xl border border-slate-100 p-3">
            <p className="text-sm font-semibold">{alert.officialTitle || alert.title}</p>
            <p className="text-xs text-muted">{alert.location}</p>
            <p className="mt-1 text-xs">
              {alert.severity || "Unknown severity"} · {alert.status || "Unknown status"}
            </p>
            <p className="text-xs text-muted">Issued {formatTimestamp(alert.issuedAt)}</p>
            {alert.expiresAt ? (
              <p className="text-xs text-muted">Expires {formatTimestamp(alert.expiresAt)}</p>
            ) : null}
            <p className="text-xs text-muted">Source: {alert.source}</p>
            <p className="mt-1 text-[11px] text-slate-500">{alert.geometryLabel || alert.areaDesc}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onViewDetails?.(alert)}
                className="rounded-full bg-forest-soft px-3 py-1 text-xs font-semibold text-forest"
              >
                View details
              </button>
              {alert.sourceUrl ? (
                <a
                  href={alert.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-forest hover:underline"
                >
                  Official source
                  <ExternalLink size={11} />
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      {live ? (
        <button
          type="button"
          onClick={onReload}
          className="mt-3 inline-flex items-center gap-2 text-xs text-muted hover:text-forest"
        >
          <RefreshCw size={12} />
          Refresh now
        </button>
      ) : null}
    </section>
  );
}
