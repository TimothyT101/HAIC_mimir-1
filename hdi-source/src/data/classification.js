/**
 * Planning-exercise classification scale for Map → Planning scenario only.
 * These are not official Hawaiʻi or NWS warning levels and must not be shown as live status.
 */

export const CLASSIFICATION_LEVELS = {
  1: {
    id: 1,
    key: "normal",
    label: "Normal",
    fullLabel: "Level 1 — Normal",
    short: "Normal / Safe",
    color: "#22c55e",
    bg: "#ecfdf3",
    text: "#166534",
    description: "Exercise baseline: no significant hazards or impacts in the scenario.",
  },
  2: {
    id: 2,
    key: "advisory",
    label: "Advisory",
    fullLabel: "Level 2 — Advisory",
    short: "Advisory / Monitor",
    color: "#eab308",
    bg: "#fefce8",
    text: "#854d0e",
    description: "Exercise scale: developing conditions or limited exposure in the scenario.",
  },
  3: {
    id: 3,
    key: "elevated",
    label: "Elevated",
    fullLabel: "Level 3 — Elevated",
    short: "Elevated",
    color: "#f97316",
    bg: "#fff7ed",
    text: "#9a3412",
    description: "Exercise scale: significant hazard exposure or potential impacts in the scenario.",
  },
  4: {
    id: 4,
    key: "emergency",
    label: "Emergency",
    fullLabel: "Level 4 — Emergency",
    short: "Emergency",
    color: "#ef4444",
    bg: "#fef2f2",
    text: "#991b1b",
    description:
      "Exercise scale: confirmed impacts and ongoing hazards in the scenario. Mass-care support may be needed if this were real.",
  },
  5: {
    id: 5,
    key: "critical",
    label: "Critical",
    fullLabel: "Level 5 — Critical",
    short: "Critical",
    color: "#7f1d1d",
    bg: "#fee2e2",
    text: "#7f1d1d",
    description:
      "Exercise scale: severe impacts and major ESF-6 support needs in the scenario. Not a live emergency declaration.",
  },
  unknown: {
    id: "unknown",
    key: "unknown",
    label: "Unknown",
    fullLabel: "Unknown",
    short: "Unknown",
    color: "#9ca3af",
    bg: "#f3f4f6",
    text: "#4b5563",
    description: "Insufficient or unverified information in the exercise dataset.",
  },
};

export const LEVEL_LIST = [1, 2, 3, 4, 5, "unknown"].map(
  (id) => CLASSIFICATION_LEVELS[id]
);

export function getLevel(levelId) {
  return CLASSIFICATION_LEVELS[levelId] ?? CLASSIFICATION_LEVELS.unknown;
}

/**
 * Placeholder for future threshold logic.
 * Communities are classified independently; nearby towns are not auto-escalated.
 */
export function assignProvisionalLevel(community) {
  if (community?.provisionalLevel == null) {
    return CLASSIFICATION_LEVELS.unknown;
  }
  return getLevel(community.provisionalLevel);
}
