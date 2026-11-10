import { ExternalLink, RefreshCw } from "lucide-react";
import { formatTimestamp } from "../../lib/format";
import { NWS_PUBLIC_URL } from "../../services/nwsAlerts";

export default function LiveAlertsPanel({
  alerts = [],
  status = "ready",
  error,
  fetchedAt,
  stale,
  onReload,
  onViewDetails,
}) {
  return (
    <section className="flex h-full min-h-0 flex-col rounded-3xl border border-transparent bg-white p-4 shadow-sm dark:border-slate-800 dark:shadow-none">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-ink">Live NWS alerts</h2>
          <p className="text-xs text-muted">
            Official National Weather Service products for Hawaiʻi
          </p>
        </div>
        <a
          href={NWS_PUBLIC_URL}
          target="_blank"
          rel="noreferrer"
          title="Open National Weather Service Honolulu (weather.gov)"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-forest transition hover:border-emerald-300 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:border-emerald-700 dark:hover:bg-emerald-900"
        >
          Verified NWS
          <ExternalLink size={11} aria-hidden="true" />
        </a>
      </div>

      <p className="mt-2 text-[11px] text-muted">
        Last successful refresh: {fetchedAt ? formatTimestamp(fetchedAt) : "—"}.
        {stale ? " Feed may be stale." : ""} Source:{" "}
        <a
          href={NWS_PUBLIC_URL}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-forest underline-offset-2 hover:underline"
        >
          weather.gov/hfo
        </a>
        .
      </p>

      <ul className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {status === "loading" ? (
          <li className="rounded-2xl bg-slate-50 p-3 text-sm text-muted dark:bg-slate-950/60">
            Loading Hawaiʻi alerts…
          </li>
        ) : null}
        {status === "error" ? (
          <li className="rounded-2xl bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200">
            Connection error: {error || "National Weather Service is unavailable."}
            <button type="button" className="ml-2 underline" onClick={onReload}>
              Retry
            </button>
          </li>
        ) : null}
        {status === "empty" || (status === "ready" && alerts.length === 0) ? (
          <li className="rounded-2xl bg-slate-50 p-3 text-sm text-muted dark:bg-slate-950/60">
            No active NWS alerts for Hawaiʻi.
          </li>
        ) : null}
        {alerts.map((alert) => (
          <li
            key={alert.id}
            className="rounded-2xl border border-slate-100 p-3 dark:border-slate-700 dark:bg-slate-950/40"
          >
            <p className="text-sm font-semibold text-ink">
              {alert.officialTitle || alert.title}
            </p>
            <p className="text-xs text-muted">{alert.location}</p>
            <p className="mt-1 text-xs text-ink">
              {alert.severity || "Unknown severity"} · {alert.status || "Unknown status"}
            </p>
            <p className="text-xs text-muted">Issued {formatTimestamp(alert.issuedAt)}</p>
            {alert.expiresAt ? (
              <p className="text-xs text-muted">Expires {formatTimestamp(alert.expiresAt)}</p>
            ) : null}
            <p className="text-xs text-muted">Source: {alert.source}</p>
            <p className="mt-1 text-[11px] text-muted">
              {alert.geometryLabel || alert.areaDesc}
            </p>
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

      <button
        type="button"
        onClick={onReload}
        className="mt-3 inline-flex items-center gap-2 text-xs text-muted hover:text-forest"
      >
        <RefreshCw size={12} />
        Refresh now
      </button>
    </section>
  );
}
