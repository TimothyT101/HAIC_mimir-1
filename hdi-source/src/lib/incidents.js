const HOURS_72_MS = 72 * 60 * 60 * 1000;

export function parseIncidentTimestamp(value) {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value !== "string" || !value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isWithinPastHours(value, hours = 72, now = Date.now()) {
  const date = parseIncidentTimestamp(value);
  if (!date) return false;
  const timestamp = date.getTime();
  return timestamp <= now && now - timestamp <= hours * 60 * 60 * 1000;
}

export function filterRecentIncidents(rows, { hours = 72, now = Date.now() } = {}) {
  const windowMs = hours * 60 * 60 * 1000;
  return (rows ?? []).filter((row) => {
    const date = parseIncidentTimestamp(row.date ?? row.issuedAt ?? row.onset);
    if (!date) return false;
    const timestamp = date.getTime();
    return timestamp <= now && now - timestamp <= windowMs;
  });
}

export { HOURS_72_MS };
