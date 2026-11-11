import { useEffect, useMemo, useRef, useState } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import {
  AFN_METRICS,
  AFN_TRACT_SOURCE,
  afnFillColor,
  formatAfnValue,
  tractGeoUrl,
} from "../../data/afnTracts";

const BASE_STROKE = "#7c2d12";

function baseStyle(feature, metric) {
  const value = feature?.properties?.[metric.id];
  return {
    color: BASE_STROKE,
    weight: 0.7,
    opacity: 0.75,
    fillColor: afnFillColor(value, metric.unit),
    fillOpacity: 0.55,
  };
}

function hoverStyle(feature, metric) {
  return {
    ...baseStyle(feature, metric),
    weight: 2,
    color: "#fbbf24",
    fillOpacity: 0.72,
  };
}

function selectedStyle(feature, metric) {
  return {
    ...baseStyle(feature, metric),
    weight: 3.5,
    color: "#fef08a",
    opacity: 1,
    fillOpacity: 0.82,
    className: "afn-tract-selected",
  };
}

function popupHtml(feature, metric) {
  const p = feature.properties || {};
  const label = p.name || `Tract ${p.geoid}`;
  const value = formatAfnValue(p[metric.id], metric.unit);
  const pop =
    p.population == null ? "—" : Math.round(p.population).toLocaleString();
  return `<div class="afn-tract-popup">
    <strong>${label}</strong>
    <div>${metric.label}: <strong>${value}</strong></div>
    <div>Pop: ${pop}</div>
    <div class="afn-tract-popup-meta">${AFN_TRACT_SOURCE.vintage}</div>
  </div>`;
}

/**
 * Census-tract AFN choropleth for the selected county.
 * Click highlights the actual polygon outline (not a browser bounding-box focus ring).
 */
export default function AfNTracts({ countyId, metricId, enabled }) {
  const [collection, setCollection] = useState(null);
  const map = useMap();
  const selectedLayerRef = useRef(null);
  const metricRef = useRef(null);

  const metric = AFN_METRICS.find((item) => item.id === metricId) ?? AFN_METRICS[0];
  metricRef.current = metric;

  useEffect(() => {
    if (!enabled) {
      setCollection(null);
      return undefined;
    }
    let cancelled = false;
    setCollection(null);
    selectedLayerRef.current = null;
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

  const styleFn = useMemo(() => (feature) => baseStyle(feature, metric), [metric]);

  useEffect(() => {
    map.invalidateSize({ animate: false });
  }, [metricId, map]);

  useEffect(() => {
    selectedLayerRef.current = null;
  }, [metricId, countyId]);

  if (!enabled || !collection?.features?.length) return null;

  return (
    <GeoJSON
      key={`${countyId}-${metric.id}-${collection.features.length}`}
      data={collection}
      style={styleFn}
      onEachFeature={(feature, layer) => {
        const currentMetric = () => metricRef.current;

        layer.on({
          mouseover: (event) => {
            if (selectedLayerRef.current === layer) return;
            const target = event.target;
            target.setStyle(hoverStyle(feature, currentMetric()));
            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
              target.bringToFront();
            }
          },
          mouseout: (event) => {
            if (selectedLayerRef.current === layer) return;
            event.target.setStyle(baseStyle(feature, currentMetric()));
          },
          click: (event) => {
            L.DomEvent.stopPropagation(event);
            const m = currentMetric();
            const prev = selectedLayerRef.current;
            if (prev && prev !== layer) {
              try {
                prev.setStyle(baseStyle(prev.feature, m));
                prev.closePopup();
              } catch {
                /* layer may have been removed */
              }
            }

            selectedLayerRef.current = layer;
            layer.setStyle(selectedStyle(feature, m));
            layer.bringToFront();

            if (!layer.getPopup()) {
              layer.bindPopup(popupHtml(feature, m), {
                className: "afn-tract-popup-wrap",
                maxWidth: 260,
                autoPan: true,
                closeButton: true,
              });
            } else {
              layer.setPopupContent(popupHtml(feature, m));
            }
            layer.openPopup(event.latlng);
          },
        });
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
            Aggregates only — not a list of people. Click a tract to highlight it.
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
            {AFN_METRICS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
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
