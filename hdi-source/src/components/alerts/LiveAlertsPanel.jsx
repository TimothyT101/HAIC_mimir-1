import { ExternalLink, RefreshCw } from "lucide-react";
import { formatTimestamp } from "../../lib/format";
import { NWS_ALERTS_ENDPOINT, NWS_PUBLIC_URL } from "../../services/nwsAlerts";

function statusLabel({ status, stale }) {
  if (status === "loading") return "Loading…";
  if (status === "refreshing") return "Refreshing…";
  if (status === "error") return "Offline";
  if (stale || status === "stale") return "Stale";
  if (status === "empty") return "Live · no alerts";
  return "Live";
}

export default function LiveAlertsPanel({
  alerts = [],
  status = "ready",
  error,
  fetchedAt,
  stale,
  refreshMs = 3 * 60 * 1000,
  onReload,
  onViewDetails,
}) {
  const refreshMinutes = Math.round(refreshMs / 60000);
  const feedLabel = statusLabel({ status, stale });

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

      <div className="mt-2 space-y-1 text-[11px] text-muted">
        <p>
          <span className="font-semibold text-ink">{feedLabel}</span>
          {" · "}
          Last refresh: {fetchedAt ? formatTimestamp(fetchedAt) : "—"}
          {stale ? " (older than 10 min)" : ""}.
        </p>
        <p>
          Auto-refreshes every {refreshMinutes} min. Use Refresh now to pull
          immediately. Compare with{" "}
          <a
            href={NWS_PUBLIC_URL}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-forest underline-offset-2 hover:underline"
          >
            weather.gov/hfo
          </a>{" "}
          or the{" "}
          <a
            href={NWS_ALERTS_ENDPOINT}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-forest underline-offset-2 hover:underline"
          >
            live HI alerts API
          </a>
          .
        </p>
      </div>

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
            No active NWS alerts for Hawaiʻi right now — that usually matches a
            quiet day on weather.gov. If the office page shows a new watch/warning
            and this panel does not, click Refresh now.
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
        <RefreshCw size={12} className={status === "refreshing" ? "animate-spin" : undefined} />
        {status === "refreshing" ? "Refreshing…" : "Refresh now"}
      </button>
    </section>
  );
}
