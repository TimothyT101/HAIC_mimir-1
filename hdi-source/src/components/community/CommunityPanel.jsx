import { Link } from "react-router-dom";
import { AlertTriangle, Clock, ExternalLink, MapPin, X } from "lucide-react";
import { getCounty } from "../../data/counties";
import { formatTimestamp } from "../../lib/format";

export default function CommunityPanel({ community, onClose, countyStatus }) {
  if (!community) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Community details</h2>
        <p className="mt-2 text-sm text-muted">
          Click a town marker for location details and official source links. County
          alert colors come from live NWS products.
        </p>
      </section>
    );
  }

  const county = getCounty(community.countyId);

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">{community.name}</h2>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted">
            <MapPin size={14} />
            {community.island}, {county.name}
          </p>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 hover:bg-slate-100"
            aria-label="Close details"
          >
            <X size={18} />
          </button>
        ) : null}
      </div>

      <div className="mt-4 rounded-2xl bg-forest-soft px-4 py-3 text-sm text-forest">
        <p className="flex items-center gap-2 font-semibold">
          {countyStatus ? (
            <span
              className="h-3 w-3 rounded-full"
              style={{ background: countyStatus.color }}
            />
          ) : null}
          {community.name}
        </p>
        <p className="mt-1 text-xs leading-5">
          {community.island}, {county.name}. County NWS status:{" "}
          {countyStatus?.label || "—"}. {countyStatus?.detail} This town is a map
          location, not its own live emergency score.
        </p>
      </div>

      <div className="mt-4 space-y-3 text-sm">
        <div>
          <p className="font-semibold">Official source links</p>
          <ul className="mt-1 space-y-1">
            {community.sources.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-forest hover:underline"
                >
                  {source.label}
                  <ExternalLink size={12} />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <p className="flex items-center gap-2 text-xs text-muted">
          <Clock size={14} />
          Profile updated {formatTimestamp(community.lastUpdated)}
        </p>
      </div>

      <div className="mt-5">
        <Link
          to={`/resource-planning?community=${community.id}&county=${community.countyId}`}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-forest px-4 py-3 text-sm font-semibold text-white hover:bg-forest-dark"
        >
          View Resource Assessment
          <AlertTriangle size={16} />
        </Link>
      </div>
    </section>
  );
}
