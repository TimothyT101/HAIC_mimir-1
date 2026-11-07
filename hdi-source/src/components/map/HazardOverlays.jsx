import { useEffect, useMemo, useState } from "react";
import { GeoJSON, ImageOverlay, useMap, useMapEvents } from "react-leaflet";

const DFIRM_LAYER = {
  honolulu: 5,
  maui: 4,
  hawaii: 14,
  kauai: 8,
};

const FIRE_ISLANDS = {
  honolulu: ["Oahu"],
  maui: ["Maui", "Molokai", "Lanai"],
  hawaii: ["Hawaii"],
  kauai: ["Kauai", "Niihau"],
};

const GIS_EXPORT = "https://geodata.hawaii.gov/arcgis/rest/services/Hazards/MapServer/export";
const FIRE_QUERY =
  "https://geodata.hawaii.gov/arcgis/rest/services/Hazards/MapServer/7/query";

function exportUrl(map, layerId) {
  const bounds = map.getBounds();
  const size = map.getSize();
  if (size.x < 40 || size.y < 40) return null;
  const params = new URLSearchParams({
    bbox: `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`,
    bboxSR: "4326",
    imageSR: "4326",
    size: `${Math.round(size.x)},${Math.round(size.y)}`,
    dpi: "96",
    format: "png32",
    transparent: "true",
    layers: `show:${layerId}`,
    layerDefs: JSON.stringify({ [layerId]: "sfha_tf='T'" }),
    f: "image",
  });
  return `${GIS_EXPORT}?${params}`;
}

function FloodHazardLayer({ countyId }) {
  const map = useMap();
  const layerId = DFIRM_LAYER[countyId] ?? 6;
  const [overlay, setOverlay] = useState(null);

  const refresh = () => {
    const url = exportUrl(map, layerId);
    if (!url) return;
    const bounds = map.getBounds();
    setOverlay({
      url,
      bounds: [
        [bounds.getSouth(), bounds.getWest()],
        [bounds.getNorth(), bounds.getEast()],
      ],
    });
  };

  useMapEvents({
    moveend: refresh,
    zoomend: refresh,
    resize: refresh,
  });

  useEffect(() => {
    refresh();
  }, [countyId, map, layerId]);

  if (!overlay) return null;
  return (
    <ImageOverlay
      key={overlay.url}
      url={overlay.url}
      bounds={overlay.bounds}
      opacity={0.55}
      interactive={false}
    />
  );
}

function FireRiskLayer({ countyId }) {
  const [raw, setRaw] = useState(null);
  const islands = useMemo(() => new Set(FIRE_ISLANDS[countyId] ?? ["Oahu"]), [countyId]);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({
      where: "1=1",
      outFields: "island,risk_rating,commu_name",
      outSR: "4326",
      f: "geojson",
    });
    fetch(`${FIRE_QUERY}?${params}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((geojson) => {
        if (!cancelled && geojson?.features) setRaw(geojson);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const data = useMemo(() => {
    const features = (raw?.features ?? []).filter((feature) =>
      islands.has(feature?.properties?.island)
    );
    return { type: "FeatureCollection", features };
  }, [raw, islands]);

  if (!data.features.length) return null;

  return (
    <GeoJSON
      key={`${countyId}-${data.features.length}`}
      data={data}
      interactive={false}
      style={(feature) => {
        const rating = (feature?.properties?.risk_rating || "").toLowerCase();
        const high = rating.includes("high");
        return {
          color: high ? "#9a3412" : "#a16207",
          weight: 1,
          fillColor: high ? "#ea580c" : "#fbbf24",
          fillOpacity: 0.32,
        };
      }}
    />
  );
}

export default function HazardOverlays({ countyId, hazards }) {
  return (
    <>
      {hazards.flood ? <FloodHazardLayer countyId={countyId} /> : null}
      {hazards.wildfire ? <FireRiskLayer countyId={countyId} /> : null}
    </>
  );
}

export function HazardSwitcher({ hazards, onChange, children = null }) {
  function toggle(key) {
    onChange({ ...hazards, [key]: !hazards[key] });
  }

  return (
    <div className="max-h-[340px] overflow-y-auto rounded-2xl bg-white/95 p-3 text-xs shadow-lg sm:max-h-none">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Hazard layers</p>
      <p className="mt-1 text-[11px] leading-4 text-muted">
        These are places, not people. A zone is where to go or avoid if officials
        say so — not a list of who must evacuate.
      </p>
      <div className="mt-2 space-y-1.5">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={hazards.tsunami}
            onChange={() => toggle("tsunami")}
          />
          Tsunami evacuation zones
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={hazards.flood}
            onChange={() => toggle("flood")}
          />
          Flood hazard (FEMA SFHA)
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={hazards.wildfire}
            onChange={() => toggle("wildfire")}
          />
          Wildfire risk areas
        </label>
      </div>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-muted">Legend</p>
      <ul className="mt-1 space-y-1 text-[11px] text-ink">
        {hazards.tsunami ? (
          <>
            <li className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-[#3b82f6]/70" />
              Tsunami evacuation
            </li>
            <li className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-[#b91c1c]/80" />
              Extreme tsunami evacuation
            </li>
          </>
        ) : null}
        {hazards.flood ? (
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-[#38bdf8]/80" />
            1% annual-chance flood (A / AE / VE)
          </li>
        ) : null}
        {hazards.wildfire ? (
          <>
            <li className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-[#ea580c]" />
              High wildfire risk
            </li>
            <li className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-[#fbbf24]" />
              Other mapped wildfire risk
            </li>
          </>
        ) : null}
        <li className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#1f4d3a]" />
          Town location
        </li>
      </ul>
      {children}
    </div>
  );
}
