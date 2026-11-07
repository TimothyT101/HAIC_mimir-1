import { X } from "lucide-react";
import { formatTimestamp } from "../../lib/format";

export default function AlertDetailsModal({ alert, onClose }) {
  if (!alert) return null;
  const live = alert.verified === true || alert.sourceKind === "nws";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-3xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p
              className={`text-xs font-semibold uppercase tracking-wide ${
                live ? "text-forest" : "text-amber-700"
              }`}
            >
              {live
                ? "Verified National Weather Service product"
                : "Mass-care prep sample — not a live alert"}
            </p>
            <h3 className="mt-1 text-xl font-bold">{alert.officialTitle || alert.title}</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-slate-100" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <dl className="mt-4 space-y-2 text-sm">
          <div>
            <dt className="text-muted">Type</dt>
            <dd className="font-medium">{alert.disasterType}</dd>
          </div>
          <div>
            <dt className="text-muted">Affected area</dt>
            <dd className="font-medium">{alert.location}</dd>
          </div>
          <div>
            <dt className="text-muted">Geometry</dt>
            <dd className="font-medium">{alert.geometryLabel || "Not provided"}</dd>
          </div>
          <div>
            <dt className="text-muted">Severity / status</dt>
            <dd className="font-medium">
              {alert.severity} · {alert.status}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Issued</dt>
            <dd className="font-medium">{formatTimestamp(alert.issuedAt)}</dd>
          </div>
          {alert.expiresAt ? (
            <div>
              <dt className="text-muted">Expires</dt>
              <dd className="font-medium">{formatTimestamp(alert.expiresAt)}</dd>
            </div>
          ) : null}
          <div>
            <dt className="text-muted">Source</dt>
            <dd className="font-medium">{alert.source}</dd>
          </div>
        </dl>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">{alert.summary}</p>
      </div>
    </div>
  );
}
