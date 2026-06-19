/**
 * Canonical vocabularies for Jammers. Stored as text[] in Postgres and filtered
 * with the `&&` overlap operator (GIN-indexed). Keep values stable — they are
 * persisted in the database.
 */

export const GENRES = [
  "Rock",
  "Indie",
  "Pop",
  "Metal",
  "Punk",
  "Jazz",
  "Blues",
  "Funk",
  "Soul",
  "R&B",
  "Hip-Hop",
  "Electronic",
  "Reggae",
  "Cumbia",
  "Folklore",
  "Tango",
  "Classical",
  "Latin",
] as const;

export const INSTRUMENTS = [
  "Vocals",
  "Electric Guitar",
  "Acoustic Guitar",
  "Bass",
  "Drums",
  "Keys",
  "Piano",
  "Synth",
  "Saxophone",
  "Trumpet",
  "Trombone",
  "Violin",
  "Cello",
  "Percussion",
  "DJ / Production",
] as const;

export const AVAILABILITY = [
  { value: "session", label: "Session work" },
  { value: "band_member", label: "Join a band" },
  { value: "support_act", label: "Support act (telonero)" },
  { value: "teaching", label: "Teaching" },
  { value: "gigs", label: "One-off gigs" },
] as const;

export const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "professional", label: "Professional" },
] as const;

export const ACCOUNT_TYPES = [
  {
    value: "musician",
    label: "Musician",
    description: "Show your talent, get hired, join bands.",
  },
  {
    value: "manager",
    label: "Manager / Band",
    description: "Find players and support acts for your shows.",
  },
  {
    value: "room_owner",
    label: "Rehearsal room owner",
    description: "List your space and take bookings.",
  },
] as const;

/** Amenities a rehearsal room can offer. */
export const AMENITIES = [
  { value: "drum_kit", label: "Drum kit" },
  { value: "pa_system", label: "PA system" },
  { value: "guitar_amp", label: "Guitar amp" },
  { value: "bass_amp", label: "Bass amp" },
  { value: "microphones", label: "Microphones" },
  { value: "backline", label: "Full backline" },
  { value: "air_conditioning", label: "Air conditioning" },
  { value: "wifi", label: "Wi-Fi" },
  { value: "parking", label: "Parking" },
  { value: "lounge", label: "Lounge area" },
  { value: "recording", label: "Recording setup" },
  { value: "lockers", label: "Lockers" },
  { value: "accessible", label: "Wheelchair accessible" },
  { value: "24_7", label: "24/7 access" },
] as const;

/** Buenos Aires neighbourhoods used for room locations + filtering. */
export const BA_NEIGHBORHOODS = [
  "Palermo",
  "Villa Crespo",
  "Chacarita",
  "Colegiales",
  "San Telmo",
  "Caballito",
  "Almagro",
  "Belgrano",
  "Núñez",
  "Recoleta",
  "Boedo",
  "La Paternal",
] as const;

/** Map default centre — Buenos Aires. */
export const BA_CENTER = { longitude: -58.4173, latitude: -34.6037, zoom: 11.6 };

// Free CARTO vector basemaps (no token required).
export const MAP_STYLES = {
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
} as const;

export const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  declined: "Declined",
  cancelled: "Cancelled",
  completed: "Completed",
};

const AMENITY_LABEL = new Map<string, string>(
  AMENITIES.map((a) => [a.value, a.label])
);
export const amenityLabel = (value: string) =>
  AMENITY_LABEL.get(value) ?? value;

const AVAILABILITY_LABEL = new Map<string, string>(
  AVAILABILITY.map((a) => [a.value, a.label])
);
export const availabilityLabel = (value: string) =>
  AVAILABILITY_LABEL.get(value) ?? value;

export type Genre = (typeof GENRES)[number];
export type Instrument = (typeof INSTRUMENTS)[number];
