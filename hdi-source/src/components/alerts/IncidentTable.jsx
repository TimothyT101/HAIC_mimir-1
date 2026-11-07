import { useMemo } from "react";
import { ExternalLink } from "lucide-react";
import { getLevel } from "../../data/classification";
import { formatTimestamp } from "../../lib/format";
import { filterRecentIncidents } from "../../lib/incidents";

export default function IncidentTable({ title, rows }) {
  const recentRows = useMemo(() => filterRecentIncidents(rows), [rows]);

  return (
    <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
      <div className="flex items-center justify-between px-5 py-4">
        <h2 className="font-semibold">{title}</h2>
        <span className="text-xs font-medium text-forest">Past 72 hours</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-5 py-3">Date & Time</th>
              <th className="px-5 py-3">Location / card</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Level</th>
              <th className="px-5 py-3">Source</th>
            </tr>
          </thead>
          <tbody>
            {recentRows.length === 0 ? (
              <tr>
                <td className="px-5 py-6 text-muted" colSpan={5}>
                  No exercise cards in the past 3 days
                </td>
              </tr>
            ) : (
              recentRows.map((row) => {
                const level = getLevel(row.level);
                const verified = row.verified === true;
                return (
                  <tr key={`${row.date}-${row.title}`} className="border-t border-slate-100">
                    <td className="px-5 py-3 whitespace-nowrap">{formatTimestamp(row.date)}</td>
                    <td className="px-5 py-3">{row.title}</td>
                    <td className="px-5 py-3">{row.type}</td>
                    <td className="px-5 py-3">
                      <span
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ background: level.color }}
                      >
                        {level.id === "unknown" ? "?" : level.id}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-forest">
                          {row.source}
                          <ExternalLink size={12} />
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                            verified
                              ? "bg-emerald-50 text-forest"
                              : "bg-amber-50 text-amber-800"
                          }`}
                        >
                          {verified ? "Verified" : "Exercise"}
                        </span>
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
