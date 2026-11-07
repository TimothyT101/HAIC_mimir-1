import { useEffect, useMemo, useState } from "react";
import { GeoJSON, ImageOverlay, LayerGroup, LayersControl, useMap, useMapEvents } from "react-leaflet";

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
    setOverlay({
      url,
      bounds: [
        [map.getBounds().getSouth(), map.getBounds().getWest()],
        [map.getBounds().getNorth(), map.getBounds().getEast()],
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
  return <ImageOverlay url={overlay.url} bounds={overlay.bounds} opacity={0.42} />;
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
          fillOpacity: 0.28,
        };
      }}
    />
  );
}

export default function HazardOverlays({ countyId }) {
  return (
    <>
      <LayersControl.Overlay checked name="Flood hazard (State DFIRM / FEMA)">
        <LayerGroup>
          <FloodHazardLayer countyId={countyId} />
        </LayerGroup>
      </LayersControl.Overlay>
      <LayersControl.Overlay name="Wildfire risk areas (State GIS)">
        <LayerGroup>
          <FireRiskLayer countyId={countyId} />
        </LayerGroup>
      </LayersControl.Overlay>
    </>
  );
}
