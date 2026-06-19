import {
  GENRES,
  INSTRUMENTS,
  AVAILABILITY,
  EXPERIENCE_LEVELS,
  ACCOUNT_TYPES,
  AMENITIES,
  BA_NEIGHBORHOODS,
  BA_CENTER,
  MAP_STYLES,
  STATUS_LABELS,
  amenityLabel,
  availabilityLabel,
} from "./constants";

describe("constant vocabularies", () => {
  it("exposes non-empty readonly lists", () => {
    expect(GENRES).toContain("Rock");
    expect(INSTRUMENTS).toContain("Vocals");
    expect(AVAILABILITY[0]).toEqual({ value: "session", label: "Session work" });
    expect(EXPERIENCE_LEVELS[0].value).toBe("beginner");
    expect(ACCOUNT_TYPES[0]).toMatchObject({ value: "musician" });
    expect(AMENITIES.length).toBeGreaterThan(0);
    expect(BA_NEIGHBORHOODS).toContain("Palermo");
  });

  it("exposes map config objects", () => {
    expect(BA_CENTER).toEqual({
      longitude: -58.4173,
      latitude: -34.6037,
      zoom: 11.6,
    });
    expect(MAP_STYLES.dark).toMatch(/dark-matter/);
    expect(MAP_STYLES.light).toMatch(/positron/);
    expect(STATUS_LABELS.pending).toBe("Pending");
  });
});

describe("amenityLabel", () => {
  it("returns the mapped label for a known value", () => {
    expect(amenityLabel("drum_kit")).toBe("Drum kit");
  });

  it("falls back to the raw value for an unknown key", () => {
    expect(amenityLabel("nope")).toBe("nope");
  });
});

describe("availabilityLabel", () => {
  it("returns the mapped label for a known value", () => {
    expect(availabilityLabel("session")).toBe("Session work");
  });

  it("falls back to the raw value for an unknown key", () => {
    expect(availabilityLabel("nope")).toBe("nope");
  });
});
