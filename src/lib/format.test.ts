import {
  formatMoney,
  averageRating,
  slugify,
  youtubeEmbed,
  initials,
} from "./format";

describe("formatMoney", () => {
  it("renders an em dash for null/undefined", () => {
    expect(formatMoney(null)).toBe("—");
    expect(formatMoney(undefined)).toBe("—");
  });

  it("formats a number in the default ARS currency", () => {
    expect(formatMoney(12000)).toMatch(/12,000/);
  });

  it("reuses a cached formatter and honours a custom currency", () => {
    const first = formatMoney(1000, "USD");
    const second = formatMoney(2000, "USD");
    expect(first).toMatch(/\$/);
    expect(second).toMatch(/2,000/);
  });
});

describe("averageRating", () => {
  it("returns null for an empty list", () => {
    expect(averageRating([])).toBeNull();
  });

  it("rounds to one decimal", () => {
    expect(averageRating([5, 4, 4])).toBe(4.3);
  });
});

describe("slugify", () => {
  it("lowercases, replaces punctuation/spaces and trims separators", () => {
    expect(slugify("  Hello, World!  ")).toBe("hello-world");
  });

  it("drops trailing accents after normalization", () => {
    expect(slugify("Café")).toBe("cafe");
  });

  it("caps the length at 60 characters", () => {
    expect(slugify("a".repeat(80))).toHaveLength(60);
  });
});

describe("youtubeEmbed", () => {
  it("converts watch URLs to embed URLs", () => {
    expect(youtubeEmbed("https://youtube.com/watch?v=abcdefghijk")).toBe(
      "https://www.youtube.com/embed/abcdefghijk"
    );
  });

  it("returns the original URL when it is not YouTube", () => {
    expect(youtubeEmbed("https://example.com/video")).toBe(
      "https://example.com/video"
    );
  });
});

describe("initials", () => {
  it("falls back when there is no name", () => {
    expect(initials(null)).toBe("JM");
    expect(initials("", "ZZ")).toBe("ZZ");
  });

  it("takes the first two initials, uppercased", () => {
    expect(initials("ada lovelace byron")).toBe("AL");
  });

  it("skips empty segments from repeated spaces", () => {
    expect(initials("ada  lovelace")).toBe("AL");
  });
});
