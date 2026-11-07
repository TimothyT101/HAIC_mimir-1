import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AlertDetailsModal from "../components/alerts/AlertDetailsModal";
import LiveAlertsPanel from "../components/alerts/LiveAlertsPanel";
import CommunityPanel from "../components/community/CommunityPanel";
import DisclaimerBanner from "../components/DisclaimerBanner";
import CountySelector from "../components/map/CountySelector";
import Legend from "../components/map/Legend";
import MapView from "../components/map/MapView";
import { DEMO_ALERTS } from "../data/alerts";
import { COMMUNITIES, getCommunity } from "../data/communities";
import { getCounty } from "../data/counties";
import useHawaiiAlerts from "../hooks/useHawaiiAlerts";
import { filterRecentIncidents } from "../lib/incidents";
import { allCountyLiveStatuses } from "../lib/liveCountyStatus";

export default function MapPage() {
  const [params, setParams] = useSearchParams();
  const countyId = params.get("county") || "honolulu";
  const mode = params.get("mode") === "planning" ? "planning" : "live";
  const selectedId = params.get("community");
  const [alert, setAlert] = useState(null);
  const liveFeed = useHawaiiAlerts();

  const county = getCounty(countyId);
  const selectedCommunity = getCommunity(selectedId);
  const selected = selectedCommunity?.countyId === countyId ? selectedCommunity : null;
  const activeMarkerId = selected?.id;
  const countyStatuses = useMemo(
    () => allCountyLiveStatuses(liveFeed.alerts, liveFeed.status),
    [liveFeed.alerts, liveFeed.status]
  );
  const countyStatus = countyStatuses[countyId];

  const liveCountyAlerts = useMemo(() => {
    return liveFeed.alerts.filter(
      (item) => !item.countyIds?.length || item.countyIds.includes(countyId)
    );
  }, [liveFeed.alerts, countyId]);

  const planningIncidents = useMemo(() => {
    const rows = DEMO_ALERTS.filter((item) => item.countyId === countyId).map((item) => ({
      ...item,
      verified: false,
      sourceKind: "exercise",
      officialTitle: item.officialTitle,
      geometryLabel: "Prep sample — no live alert geometry",
    }));
    return filterRecentIncidents(rows);
  }, [countyId]);

  const panelAlerts = mode === "live" ? liveCountyAlerts : planningIncidents;
  const zoneNote = liveCountyAlerts.find((item) => !item.geometry)?.geometryLabel;
  const alertFeatures = liveCountyAlerts
    .filter((item) => item.geometry)
    .map((item) => ({
      type: "Feature",
      id: item.id,
      geometry: item.geometry,
      properties: { title: item.title },
    }));

  function update(next) {
    const values = new URLSearchParams(params);
    Object.entries(next).forEach(([key, value]) => {
      if (value == null || value === "") values.delete(key);
      else values.set(key, value);
    });
    setParams(values);
  }

  function handleCounty(id) {
    update({ county: id, community: null });
  }

  function handleSelect(communityId) {
    if (!communityId) {
      update({ community: null });
      return;
    }
    const community = getCommunity(communityId);
    update({ county: community?.countyId || countyId, community: communityId });
  }

  function handleAlertDetails(item) {
    const community = COMMUNITIES.find((entry) => entry.id === item.communityId);
    if (community) update({ county: community.countyId, community: community.id });
    setAlert(item);
  }

  return (
    <div className="mx-auto max-w-[1440px] space-y-4 px-4 py-5 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-forest">Live Map</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            {county.islandLabel}. <strong>Live conditions</strong> is the correct
            operational view (official NWS). <strong>Mass-care prep</strong> adds
            static town readiness cues for ESF-6 planning — not a fake emergency.
          </p>
        </div>
        <div className="inline-flex rounded-full bg-white p-1 shadow-sm" role="tablist" aria-label="Map data mode">
          {[
            ["live", "Live conditions"],
            ["planning", "Mass-care prep"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={mode === id}
              onClick={() => update({ mode: id === "live" ? null : id })}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                mode === id ? "bg-forest text-white" : "text-ink hover:bg-forest-soft"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <CountySelector
        value={countyId}
        onChange={handleCounty}
        liveStatuses={mode === "live" ? countyStatuses : undefined}
      />
      {mode === "live" ? (
        <div className="max-w-xl">
          <Legend variant="nwsCounty" />
        </div>
      ) : null}
      <DisclaimerBanner compact />

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="relative h-[420px] w-full sm:h-[500px] lg:h-[560px]">
          <MapView
            countyId={countyId}
            selectedId={activeMarkerId}
            onSelect={handleSelect}
            mode={mode}
            alertFeatures={mode === "live" ? alertFeatures : []}
            zoneNote={
              mode === "live"
                ? zoneNote
                : "Mass-care prep: colored markers are static readiness cues for planning — not live NWS warnings."
            }
          />
          {mode === "planning" ? (
            <div className="pointer-events-none absolute bottom-3 right-3 z-[1000] max-w-sm">
              <div className="pointer-events-auto">
                <Legend compact />
              </div>
            </div>
          ) : null}
        </div>
        <div className="flex min-h-0 flex-col gap-4 xl:h-[560px]">
          <div className="max-h-[240px] overflow-y-auto xl:max-h-[46%]">
            <CommunityPanel
              community={selected}
              mode={mode}
              countyStatus={mode === "live" ? countyStatus : undefined}
              onClose={() => update({ community: null })}
            />
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            <LiveAlertsPanel
              mode={mode}
              alerts={panelAlerts}
              status={mode === "live" ? liveFeed.status : planningIncidents.length ? "ready" : "empty"}
              error={liveFeed.error}
              fetchedAt={liveFeed.fetchedAt}
              stale={liveFeed.stale}
              onReload={liveFeed.reload}
              onViewDetails={handleAlertDetails}
            />
          </div>
        </div>
      </div>

      <AlertDetailsModal alert={alert} onClose={() => setAlert(null)} />
    </div>
  );
}
