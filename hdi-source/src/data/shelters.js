/**
 * Publicly listed mass-care / civic facilities used as designated-shelter
 * planning locations. Open status is NOT confirmed. Capacities are unknown
 * unless a public source states them — this file does not invent bed counts.
 */

export const SHELTERS = [
  {
    id: "honolulu-blaisdell",
    name: "Neal S. Blaisdell Center",
    countyId: "honolulu",
    island: "Oʻahu",
    lat: 21.3008,
    lng: -157.8506,
    status: "designated",
    openConfirmed: false,
    capacity: null,
    source: "City and County of Honolulu Department of Emergency Management (public facility)",
    sourceUrl: "https://www.honolulu.gov/dem/",
  },
  {
    id: "honolulu-uh-manoa",
    name: "University of Hawaiʻi at Mānoa (campus planning site)",
    countyId: "honolulu",
    island: "Oʻahu",
    lat: 21.2969,
    lng: -157.817,
    status: "designated",
    openConfirmed: false,
    capacity: null,
    source: "University of Hawaiʻi / City and County emergency planning references",
    sourceUrl: "https://www.honolulu.gov/dem/",
  },
  {
    id: "maui-war-memorial",
    name: "War Memorial Complex, Kahului",
    countyId: "maui",
    island: "Maui",
    lat: 20.8936,
    lng: -156.4772,
    status: "designated",
    openConfirmed: false,
    capacity: null,
    source: "County of Maui Emergency Management Agency public information",
    sourceUrl: "https://www.mauicounty.gov/76/Emergency-Management",
  },
  {
    id: "hawaii-edith-kanakaole",
    name: "Edith Kanakaʻole Stadium, Hilo",
    countyId: "hawaii",
    island: "Hawaiʻi Island",
    lat: 19.7197,
    lng: -155.0781,
    status: "designated",
    openConfirmed: false,
    capacity: null,
    source: "Hawaiʻi County Civil Defense public information",
    sourceUrl: "https://www.hawaiicounty.gov/departments/civil-defense",
  },
  {
    id: "kauai-vidinha",
    name: "Vidinha Stadium, Līhuʻe",
    countyId: "kauai",
    island: "Kauaʻi",
    lat: 21.9736,
    lng: -159.3658,
    status: "designated",
    openConfirmed: false,
    capacity: null,
    source: "Kauaʻi Emergency Management Agency public information",
    sourceUrl: "https://www.kauai.gov/Government/Departments-Agencies/Emergency-Management",
  },
];

export function sheltersForCounty(countyId) {
  return SHELTERS.filter((item) => item.countyId === countyId);
}
