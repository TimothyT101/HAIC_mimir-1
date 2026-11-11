import { COUNTIES } from "../../data/counties";
import IslandSilhouette from "../IslandSilhouette";

const ISLAND_KEY = {
  honolulu: "oahu",
  maui: "maui",
  hawaii: "hawaii",
  kauai: "kauai",
};

export default function CountySelector({ value, onChange, variant = "cards", liveStatuses }) {
  if (variant === "pills") {
    return (
      <div className="grid gap-3 sm:grid-cols-4">
        {COUNTIES.map((county) => {
          const active = county.id === value;
          const status = liveStatuses?.[county.id];
          return (
            <button
              key={county.id}
              type="button"
              onClick={() => onChange(county.id)}
              className={`county-chip flex items-center justify-center gap-3 rounded-2xl px-4 py-4 text-sm font-semibold shadow-sm transition duration-200 ${
                active
                  ? "county-chip-active bg-forest text-white"
                  : "bg-white text-ink ring-1 ring-slate-100 hover:ring-forest/30"
              }`}
            >
              <IslandSilhouette
                island={ISLAND_KEY[county.id]}
                className="h-8 w-8"
                style={{ color: active ? "#fff" : status?.color || "#94a3b8" }}
              />
              {county.shortName}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {COUNTIES.map((county) => {
        const active = county.id === value;
        const status = liveStatuses?.[county.id];
        const accent = status?.color || "#1f4d3a";
        return (
          <button
            key={county.id}
            type="button"
            onClick={() => onChange(county.id)}
            className={`county-card group flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 text-left transition duration-200 ${
              active ? "county-card-active" : ""
            }`}
            style={{
              borderColor: active ? accent : status?.color || "transparent",
              borderLeftWidth: status ? 6 : undefined,
              borderLeftColor: status?.color,
              ["--county-glow"]: accent,
            }}
          >
            <IslandSilhouette
              island={ISLAND_KEY[county.id]}
              className="h-9 w-9 shrink-0 transition duration-200 group-hover:scale-105"
              style={{ color: status?.color || (active ? "#1f4d3a" : "#94a3b8") }}
            />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-ink">
                {county.islandLabel}
              </span>
              <span className="block text-xs text-muted">{county.subtitle}</span>
              {status ? (
                <span className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: status.color }}
                  />
                  {status.label}
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
