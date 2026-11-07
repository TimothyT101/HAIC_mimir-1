import { useCallback, useEffect, useState } from "react";
import { fetchLiveHawaiiAlerts } from "../services/nwsAlerts";

const REFRESH_MS = 3 * 60 * 1000;
const STALE_MS = 10 * 60 * 1000;

export default function useHawaiiAlerts() {
  const [state, setState] = useState({
    status: "loading",
    alerts: [],
    fetchedAt: null,
    error: null,
    source: null,
  });

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setState((current) => ({
        ...current,
        status: current.alerts.length ? "refreshing" : "loading",
        error: null,
      }));
    }
    try {
      const result = await fetchLiveHawaiiAlerts();
      setState({
        status: result.alerts.length ? "ready" : "empty",
        alerts: result.alerts,
        fetchedAt: result.fetchedAt,
        error: null,
        source: result.source,
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        status: current.alerts.length ? "stale" : "error",
        error: error.message || "Unable to reach the National Weather Service.",
      }));
    }
  }, []);

  useEffect(() => {
    load();
    const timer = window.setInterval(() => load({ silent: true }), REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [load]);

  const ageMs = state.fetchedAt ? Date.now() - new Date(state.fetchedAt).getTime() : null;
  const stale = Boolean(ageMs && ageMs > STALE_MS);

  return {
    ...state,
    stale,
    refreshMs: REFRESH_MS,
    reload: () => load(),
  };
}
