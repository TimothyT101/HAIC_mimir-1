export const COUNTIES = [
  {
    id: "honolulu",
    name: "Honolulu County",
    shortName: "Oʻahu",
    islandLabel: "Oʻahu",
    subtitle: "Honolulu County",
    islands: ["Oʻahu"],
    center: [21.4389, -157.99],
    zoom: 10,
    minZoom: 10,
    maxZoom: 15,
    bounds: [
      [21.25, -158.32],
      [21.73, -157.62],
    ],
    maxBounds: [
      [21.2, -158.42],
      [21.78, -157.52],
    ],
  },
  {
    id: "maui",
    name: "Maui County",
    shortName: "Maui",
    islandLabel: "Maui County",
    subtitle: "Maui, Molokaʻi, Lānaʻi",
    islands: ["Maui", "Molokaʻi", "Lānaʻi", "Kahoʻolawe"],
    center: [20.8, -156.6],
    zoom: 9,
    minZoom: 8.5,
    maxZoom: 15,
    bounds: [
      [20.5, -157.35],
      [21.22, -155.9],
    ],
    maxBounds: [
      [20.42, -157.48],
      [21.28, -155.78],
    ],
  },
  {
    id: "hawaii",
    name: "Hawaiʻi County",
    shortName: "Hawaiʻi",
    islandLabel: "Hawaiʻi Island",
    subtitle: "Hawaiʻi Island",
    islands: ["Hawaiʻi Island"],
    center: [19.59, -155.5],
    zoom: 8.5,
    minZoom: 8,
    maxZoom: 15,
    bounds: [
      [18.89, -156.08],
      [20.28, -154.8],
    ],
    maxBounds: [
      [18.78, -156.22],
      [20.4, -154.66],
    ],
  },
  {
    id: "kauai",
    name: "Kauaʻi County",
    shortName: "Kauaʻi",
    islandLabel: "Kauaʻi County",
    subtitle: "Kauaʻi and Niʻihau",
    islands: ["Kauaʻi", "Niʻihau"],
    center: [21.97, -159.55],
    zoom: 10,
    minZoom: 9.5,
    maxZoom: 15,
    bounds: [
      [21.75, -160.3],
      [22.24, -159.23],
    ],
    maxBounds: [
      [21.68, -160.42],
      [22.3, -159.12],
    ],
  },
];

export const STATEWIDE_VIEW = {
  center: [20.7, -157.3],
  zoom: 7,
};

export function getCounty(id) {
  return COUNTIES.find((county) => county.id === id) ?? COUNTIES[0];
}
