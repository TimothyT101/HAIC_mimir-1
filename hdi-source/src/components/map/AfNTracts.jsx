import { useEffect, useMemo, useState } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import {
  AFN_METRICS,
  AFN_TRACT_SOURCE,
  afnFillColor,
  formatAfnValue,
  tractGeoUrl,
} from "../../data/afnTracts";

/**
 * Census-tract AFN choropleth for the selected county.
 * Loads simplified GeoJSON from /public/tracts (SVI 2022 joined to Census boundaries).
 */
export default function AfNTracts({ countyId, metricId, enabled }) {
  const [collection, setCollection] = useState(null);
  const map = useMap();

  useEffect(() => {
    if (!enabled) {
      setCollection(null);
      return undefined;
    }
    let cancelled = false;
    setCollection(null);
    fetch(tractGeoUrl(countyId))
      .then((response) => (response.ok ? response.json() : null))
      .then((geojson) => {
        if (!cancelled) setCollection(geojson);
      })
      .catch(() => {
        if (!cancelled) setCollection(null);
      });
    return () => {
      cancelled = true;
    };
  }, [countyId, enabled]);

  const metric = AFN_METRICS.find((item) => item.id === metricId) ?? AFN_METRICS[0];

  const styleFn = useMemo(() => {
    return (feature) => {
      const value = feature?.properties?.[metric.id];
      return {
        color: "#7c2d12",
        weight: 0.7,
        opacity: 0.7,
        fillColor: afnFillColor(value, metric.unit),
        fillOpacity: 0.55,
      };
    };
  }, [metric]);

  useEffect(() => {
    // ensure redraw when metric changes
    map.invalidateSize({ animate: false });
  }, [metricId, map]);

  if (!enabled || !collection?.features?.length) return null;

  return (
    <GeoJSON
      key={`${countyId}-${metric.id}-${collection.features.length}`}
      data={collection}
      style={styleFn}
      onEachFeature={(feature, layer) => {
        const p = feature.properties || {};
        const label = p.name || `Tract ${p.geoid}`;
        const value = formatAfnValue(p[metric.id], metric.unit);
        layer.bindTooltip(
          `<strong>${label}</strong><br/>${metric.label}: ${value}<br/>Pop: ${
            p.population == null ? "—" : Math.round(p.population).toLocaleString()
          }<br/><span style="opacity:.8">${AFN_TRACT_SOURCE.vintage}</span>`,
          { sticky: true }
        );
      }}
    />
  );
}

export function AfNSwitcher({ enabled, metricId, onEnabledChange, onMetricChange }) {
  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            Tract AFN map
          </p>
          <p className="mt-1 text-[11px] leading-4 text-muted">
            Census tracts colored by Access &amp; Functional Needs proxies (SVI / ACS).
            Aggregates only — not a list of people.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Tract AFN map on or off"
          onClick={() => onEnabledChange(!enabled)}
          className={`relative inline-flex h-7 w-[64px] shrink-0 items-center rounded-full border text-[10px] font-bold uppercase tracking-wide transition ${
            enabled
              ? "border-forest bg-forest text-white"
              : "border-slate-300 bg-slate-100 text-slate-500"
          }`}
        >
          <span
            className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
              enabled ? "right-0.5" : "left-0.5"
            }`}
          />
          <span className={`w-full px-1.5 ${enabled ? "pr-6 text-left" : "pl-6 text-right"}`}>
            {enabled ? "On" : "Off"}
          </span>
        </button>
      </div>
      {enabled ? (
        <label className="mt-2 block text-[11px] text-ink">
          <span className="mb-1 block text-muted">Metric</span>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
            value={metricId}
            onChange={(event) => onMetricChange(event.target.value)}
          >
            {AFN_METRICS.map((metric) => (
              <option key={metric.id} value={metric.id}>
                {metric.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {enabled ? (
        <ul className="mt-2 space-y-1 text-[11px] text-ink">
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-[#fef3c7]" /> Lower
          </li>
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-[#fbbf24]" />
            <span className="h-3 w-3 rounded-sm bg-[#f97316]" /> Mid
          </li>
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-[#b91c1c]" /> Higher vulnerability
          </li>
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-[#cbd5e1]" /> Unknown / missing
          </li>
        </ul>
      ) : (
        <p className="mt-2 text-[11px] leading-4 text-muted">
          Switch <strong>On</strong> to color census tracts by AFN proxies.
        </p>
      )}
    </div>
  );
}
