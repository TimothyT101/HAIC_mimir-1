import { NWS_COUNTY_LEGEND } from "../../lib/liveCountyStatus";

export default function Legend() {
  return (
    <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
        County NWS
      </p>
      <p className="mb-2 text-[11px] leading-4 text-muted">
        Colors apply to the county cards above, not to town dots.
      </p>
      <div className="flex flex-wrap gap-3">
        {NWS_COUNTY_LEGEND.map((item) => (
          <span key={item.id} className="inline-flex items-center gap-1.5 text-xs">
            <span
              className="h-3.5 w-3.5 rounded-full"
              style={{ background: item.color }}
            />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
