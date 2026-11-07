import { useEffect, useMemo, useRef } from "react";
import {
  CircleMarker,
  GeoJSON,
  LayerGroup,
  LayersControl,
  MapContainer,
  ScaleControl,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { Home, Minus, Plus } from "lucide-react";
import { getLevel } from "../../data/classification";
import { getCounty } from "../../data/counties";
import { communitiesByCounty } from "../../data/communities";
import HazardOverlays from "./HazardOverlays";
import TsunamiZones from "./TsunamiZones";

function fitBoundsFor(county) {
  return L.latLngBounds(county.bounds);
}

function maxBoundsFor(county) {
  return L.latLngBounds(county.maxBounds ?? county.bounds);
}

function applyCountyView(map, county, { animate = true } = {}) {
  const fit = fitBoundsFor(county);
  const limit = maxBoundsFor(county);

  map.stop();
  map.setMaxBounds(null);
  map.setMinZoom(0);
  map.invalidateSize({ animate: false });

  const size = map.getSize();
  if (size.x < 40 || size.y < 40) return;

  const padding = L.point(28, 28);
  const fittedMinZoom = map.getBoundsZoom(fit, false, padding);
  const minZoom = Number.isFinite(fittedMinZoom)
    ? fittedMinZoom
    : (county.minZoom ?? 8);

  map.setMaxZoom(county.maxZoom ?? 15);
  map.fitBounds(fit, {
    animate,
    duration: 0.55,
    padding: [24, 24],
  });
  map.setMinZoom(minZoom);
  map.setMaxBounds(limit);
  map.options.maxBoundsViscosity = 1;
}

function CountyCamera({ countyId }) {
  const map = useMap();
  const countyIdRef = useRef(countyId);
  countyIdRef.current = countyId;

  useEffect(() => {
    const county = getCounty(countyId);
    let frame = 0;

    const run = (animate) => {
      applyCountyView(map, county, { animate });
    };

    const start = () => {
      run(false);
      frame = window.requestAnimationFrame(() => run(false));
    };

    if (map._loaded) start();
    else map.whenReady(start);

    const parent = map.getContainer().parentElement;
    let lastWidth = 0;
    let lastHeight = 0;
    const observer = new ResizeObserver(() => {
      if (countyIdRef.current !== countyId) return;
      const size = map.getSize();
      if (size.x < 40 || size.y < 40) return;
      if (Math.abs(size.x - lastWidth) < 4 && Math.abs(size.y - lastHeight) < 4) return;
      lastWidth = size.x;
      lastHeight = size.y;
      map.invalidateSize({ animate: false });
      applyCountyView(map, getCounty(countyId), { animate: false });
    });
    if (parent) observer.observe(parent);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [countyId, map]);

  return null;
}

function SelectedTownLabel({ community }) {
  const map = useMap();

  useEffect(() => {
    if (!community) return undefined;
    const tooltip = L.tooltip({
      permanent: true,
      direction: "top",
      offset: [0, -12],
      opacity: 1,
      className: "town-selected-label",
    })
      .setLatLng([community.lat, community.lng])
      .setContent(`<strong>${community.name}</strong>`)
      .addTo(map);

    return () => {
      map.removeLayer(tooltip);
    };
  }, [community, map]);

  return null;
}

function TownMarker({ community, selected, fillColor, onSelect }) {
  return (
    <CircleMarker
      center={[community.lat, community.lng]}
      radius={selected ? 13 : 10}
      pane="markerPane"
      pathOptions={{
        color: "#fff",
        weight: selected ? 3 : 2,
        fillColor,
        fillOpacity: 0.95,
        bubblingMouseEvents: false,
      }}
      eventHandlers={{
        click: (event) => {
          L.DomEvent.stop(event);
          onSelect(community.id);
        },
      }}
    >
      <Tooltip direction="top" offset={[0, -10]} opacity={1}>
        <span className="font-semibold">{community.name}</span>
      </Tooltip>
    </CircleMarker>
  );
}

function MapButtons({ countyId }) {
  const map = useMap();

  return (
    <div className="absolute left-3 top-3 z-[1000] flex flex-col overflow-hidden rounded-xl bg-white shadow">
      <button
        type="button"
        className="p-2 hover:bg-slate-50"
        onClick={() => map.zoomIn()}
        aria-label="Zoom in"
      >
        <Plus size={16} />
      </button>
      <button
        type="button"
        className="border-t border-slate-100 p-2 hover:bg-slate-50"
        onClick={() => map.zoomOut()}
        aria-label="Zoom out"
      >
        <Minus size={16} />
      </button>
      <button
        type="button"
        className="border-t border-slate-100 p-2 hover:bg-slate-50"
        onClick={() => applyCountyView(map, getCounty(countyId), { animate: true })}
        aria-label="Reset island view"
      >
        <Home size={16} />
      </button>
    </div>
  );
}

export default function MapView({
  countyId,
  selectedId,
  onSelect,
  alertFeatures = [],
  zoneNote,
  mode = "live",
}) {
  const communities = useMemo(() => communitiesByCounty(countyId), [countyId]);
  const county = getCounty(countyId);
  const bounds = useMemo(() => fitBoundsFor(county), [county]);
  const maxBounds = useMemo(() => maxBoundsFor(county), [county]);
  const alertCollection = useMemo(
    () => ({
      type: "FeatureCollection",
      features: alertFeatures.filter((feature) => feature?.geometry),
    }),
    [alertFeatures]
  );

  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl">
      <MapContainer
        key={countyId}
        bounds={bounds}
        maxBounds={maxBounds}
        maxBoundsViscosity={1}
        minZoom={county.minZoom}
        maxZoom={county.maxZoom}
        zoomSnap={0.25}
        zoomDelta={0.5}
        className="h-full w-full"
        zoomControl={false}
        attributionControl
        scrollWheelZoom
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite (Esri)">
            <TileLayer
              attribution="Tiles &copy; Esri"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
          <HazardOverlays countyId={countyId} />
        </LayersControl>
        <CountyCamera countyId={countyId} />
        <MapButtons countyId={countyId} />
        <ScaleControl position="bottomleft" imperial />
        <TsunamiZones countyId={countyId} />
        {alertCollection.features.length ? (
          <GeoJSON
            key={alertCollection.features.map((item) => item.id).join("|")}
            data={alertCollection}
            style={{
              color: "#b45309",
              weight: 2,
              fillColor: "#f59e0b",
              fillOpacity: 0.22,
            }}
          />
        ) : null}
        <LayerGroup>
          {communities.map((community) => {
            const level = getLevel(community.provisionalLevel);
            const selected = community.id === selectedId;
            const fillColor = mode === "planning" ? level.color : "#1f4d3a";
            return (
              <TownMarker
                key={community.id}
                community={community}
                selected={selected}
                fillColor={fillColor}
                onSelect={onSelect}
              />
            );
          })}
        </LayerGroup>
        <SelectedTownLabel community={communities.find((item) => item.id === selectedId)} />
      </MapContainer>
      <div className="pointer-events-none absolute bottom-10 left-3 max-w-xs rounded-xl bg-slate-900/70 px-3 py-2 text-white">
        <p className="text-sm font-semibold">{county.islandLabel}</p>
        <p className="text-xs text-white/80">{county.name}</p>
        {zoneNote ? <p className="mt-1 text-[11px] leading-4 text-amber-100">{zoneNote}</p> : null}
      </div>
    </div>
  );
}
