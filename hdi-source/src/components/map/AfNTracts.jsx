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
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
        Tract AFN map
      </p>
      <p className="mt-1 text-[11px] leading-4 text-muted">
        Census tracts colored by Access &amp; Functional Needs proxies (SVI / ACS).
        Aggregates only — not a list of people.
      </p>
      <label className="mt-2 flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(event) => onEnabledChange(event.target.checked)}
        />
        Show tract AFN choropleth
      </label>
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
      ) : null}
    </div>
  );
}
