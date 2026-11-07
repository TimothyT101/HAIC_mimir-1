import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AlertDetailsModal from "../components/alerts/AlertDetailsModal";
import LiveAlertsPanel from "../components/alerts/LiveAlertsPanel";
import CommunityPanel from "../components/community/CommunityPanel";
import DisclaimerBanner from "../components/DisclaimerBanner";
import CountySelector from "../components/map/CountySelector";
import Legend from "../components/map/Legend";
import MapView from "../components/map/MapView";
import { COMMUNITIES, getCommunity } from "../data/communities";
import { getCounty } from "../data/counties";
import useHawaiiAlerts from "../hooks/useHawaiiAlerts";
import { allCountyLiveStatuses } from "../lib/liveCountyStatus";

export default function MapPage() {
  const [params, setParams] = useSearchParams();
  const countyId = params.get("county") || "honolulu";
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
    // Drop legacy prep-mode query if present.
    values.delete("mode");
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
      <div>
        <h1 className="text-3xl font-bold text-forest">Live Map</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          {county.islandLabel}. Official National Weather Service alerts, hazard layers,
          and census-tract AFN overlays. Town markers are locations — open Resource
          Planning for ESF-6 needs estimates.
        </p>
      </div>

      <CountySelector
        value={countyId}
        onChange={handleCounty}
        liveStatuses={countyStatuses}
      />
      <div className="max-w-xl">
        <Legend />
      </div>
      <DisclaimerBanner compact />

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="relative h-[420px] w-full sm:h-[500px] lg:h-[560px]">
          <MapView
            countyId={countyId}
            selectedId={activeMarkerId}
            onSelect={handleSelect}
            alertFeatures={alertFeatures}
            zoneNote={zoneNote}
          />
        </div>
        <div className="flex min-h-0 flex-col gap-4 xl:h-[560px]">
          <div className="max-h-[240px] overflow-y-auto xl:max-h-[46%]">
            <CommunityPanel
              community={selected}
              countyStatus={countyStatus}
              onClose={() => update({ community: null })}
            />
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            <LiveAlertsPanel
              alerts={liveCountyAlerts}
              status={liveFeed.status}
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
