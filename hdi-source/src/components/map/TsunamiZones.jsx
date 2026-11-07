import { useEffect, useMemo, useState } from "react";
import { GeoJSON } from "react-leaflet";

const ISLANDS = {
  honolulu: ["OAHU"],
  maui: ["MAUI", "MOLOKAI", "LANAI"],
  hawaii: ["HAWAII"],
  kauai: ["KAUAI", "NIIHAU"],
};

const LOCAL_URL = "/tsunami-evac-zones.geojson";
const GIS_URL = "https://geodata.hawaii.gov/arcgis/rest/services/Hazards/MapServer/11/query";

function filterByCounty(collection, countyId) {
  const islands = new Set(ISLANDS[countyId] ?? ["OAHU"]);
  return {
    type: "FeatureCollection",
    features: (collection?.features ?? []).filter((feature) => {
      const island = feature?.properties?.island;
      const code = feature?.properties?.zone_code;
      return islands.has(island) && code !== 3;
    }),
  };
}

export default function TsunamiZones({ countyId }) {
  const [raw, setRaw] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const local = await fetch(LOCAL_URL);
        if (local.ok) {
          const geojson = await local.json();
          if (!cancelled && geojson?.features?.length) {
            setRaw(geojson);
            return;
          }
        }
      } catch {
        /* fall through to GIS */
      }
      const islands = ISLANDS[countyId] ?? ["OAHU"];
      const quoted = islands.map((name) => `'${name}'`).join(",");
      const params = new URLSearchParams({
        where: `island IN (${quoted}) AND zone_code <> 3`,
        outFields: "island,zone_type,zone_code,evac_zone",
        outSR: "4326",
        f: "geojson",
      });
      const response = await fetch(`${GIS_URL}?${params}`);
      if (!response.ok) return;
      const geojson = await response.json();
      if (!cancelled) setRaw(geojson);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [countyId]);

  const data = useMemo(() => filterByCounty(raw, countyId), [raw, countyId]);
  if (!data.features.length) return null;

  return (
    <GeoJSON
      key={`${countyId}-${data.features.length}`}
      data={data}
      style={(feature) => {
        const extreme = feature?.properties?.zone_code === 2;
        return {
          color: extreme ? "#7f1d1d" : "#1d4ed8",
          weight: 1,
          fillColor: extreme ? "#b91c1c" : "#3b82f6",
          fillOpacity: 0.18,
        };
      }}
    />
  );
}
